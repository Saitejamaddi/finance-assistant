import { createContext, useContext, useState, useEffect } from 'react';
import {
  loadGapi, signInWithGoogle, findOrCreateSheet,
  readTransactions, readBudgets, readGoals,
  readCategories, readSettings
} from '../services/SheetsService';

const GoogleAuthContext = createContext();

export const GoogleAuthProvider = ({ children }) => {
  const [user, setUser]                   = useState(null);
  const [spreadsheetId, setSpreadsheetId] = useState(null);
  const [loading, setLoading]             = useState(true);
  const [syncing, setSyncing]             = useState(false);
  const [initialData, setInitialData]     = useState(null);
  const [gapiReady, setGapiReady]         = useState(false);

  useEffect(() => {
    loadGapi().then(() => {
      setGapiReady(true);
      setLoading(false);
      // restore session
      const savedUser = localStorage.getItem('gauth_user');
      const savedSheetId = localStorage.getItem('gauth_sheetId');
      if (savedUser && savedSheetId) {
        setUser(JSON.parse(savedUser));
        setSpreadsheetId(savedSheetId);
      }
    });
  }, []);

  const login = async () => {
    try {
      setLoading(true);
      const token = await signInWithGoogle();
      window.gapi.client.setToken({ access_token: token });

      // Get user info
      const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json());

      // Find or create sheet
      setSyncing(true);
      const sheetId = await findOrCreateSheet();

      // Load all existing data
      const [transactions, budgets, goals, categories, settings] = await Promise.all([
        readTransactions(sheetId),
        readBudgets(sheetId),
        readGoals(sheetId),
        readCategories(sheetId),
        readSettings(sheetId),
      ]);

      // Save session
      localStorage.setItem('gauth_user', JSON.stringify(userInfo));
      localStorage.setItem('gauth_sheetId', sheetId);
      localStorage.setItem('gauth_token', token);

      setUser(userInfo);
      setSpreadsheetId(sheetId);
      setInitialData({ transactions, budgets, goals, categories, settings });
    } catch (err) {
      console.error('Login error:', err);
      alert('Login failed. Please try again.');
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('gauth_user');
    localStorage.removeItem('gauth_sheetId');
    localStorage.removeItem('gauth_token');
    setUser(null);
    setSpreadsheetId(null);
    setInitialData(null);
    if (window.google?.accounts?.oauth2) {
      window.google.accounts.oauth2.revoke(localStorage.getItem('gauth_token'));
    }
  };

  return (
    <GoogleAuthContext.Provider value={{
      user, spreadsheetId, loading, syncing,
      setSyncing, initialData, gapiReady, login, logout
    }}>
      {children}
    </GoogleAuthContext.Provider>
  );
};

export const useGoogleAuth = () => useContext(GoogleAuthContext);