import { createContext, useContext, useState, useEffect } from 'react';
import {
  loadGapi, signInWithGoogle, findOrCreateSheet,
  readTransactions, readBudgets, readGoals,
  readCategories, readSettings, readAccounts
} from '../services/SheetsService';

const GoogleAuthContext = createContext();

export const GoogleAuthProvider = ({ children }) => {
  const [user, setUser]                   = useState(null);
  const [spreadsheetId, setSpreadsheetId] = useState(null);
  const [loading, setLoading]             = useState(true);
  const [syncing, setSyncing]             = useState(false);
  const [initialData, setInitialData]     = useState(null);

  useEffect(() => {
    const restoreSession = async () => {
      try {
        await loadGapi();

        const savedUser    = localStorage.getItem('gauth_user');
        const savedSheetId = localStorage.getItem('gauth_sheetId');
        const savedToken   = localStorage.getItem('gauth_token');

        if (!savedUser || !savedSheetId || !savedToken) {
          setLoading(false);
          return;
        }

        window.gapi.client.setToken({ access_token: savedToken });

        const check = await fetch('https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=' + savedToken);
        const tokenInfo = await check.json();

        if (tokenInfo.error) {
          clearSession();
          setLoading(false);
          return;
        }

        setSyncing(true);
        const [transactions, budgets, goals, categories, settings, accounts] = await Promise.all([
          readTransactions(savedSheetId),
          readBudgets(savedSheetId),
          readGoals(savedSheetId),
          readCategories(savedSheetId),
          readSettings(savedSheetId),
          readAccounts(savedSheetId),
        ]);

        setUser(JSON.parse(savedUser));
        setSpreadsheetId(savedSheetId);
        setInitialData({ transactions, budgets, goals, categories, settings, accounts });

      } catch (err) {
        console.error('Session restore error:', err);
        clearSession();
      } finally {
        setLoading(false);
        setSyncing(false);
      }
    };

    restoreSession();
  }, []);

  const clearSession = () => {
    localStorage.removeItem('gauth_user');
    localStorage.removeItem('gauth_sheetId');
    localStorage.removeItem('gauth_token');
    setUser(null);
    setSpreadsheetId(null);
    setInitialData(null);
  };

  const login = async () => {
    try {
      setLoading(true);
      const token = await signInWithGoogle();
      window.gapi.client.setToken({ access_token: token });

      const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${token}` },
      }).then((r) => r.json());

      setSyncing(true);
      const sheetId = await findOrCreateSheet();

      const [transactions, budgets, goals, categories, settings, accounts] = await Promise.all([
        readTransactions(sheetId),
        readBudgets(sheetId),
        readGoals(sheetId),
        readCategories(sheetId),
        readSettings(sheetId),
        readAccounts(sheetId),
      ]);

      localStorage.setItem('gauth_user',    JSON.stringify(userInfo));
      localStorage.setItem('gauth_sheetId', sheetId);
      localStorage.setItem('gauth_token',   token);

      setUser(userInfo);
      setSpreadsheetId(sheetId);
      setInitialData({ transactions, budgets, goals, categories, settings, accounts });

    } catch (err) {
      console.error('Login error:', err);
      alert('Login failed. Please try again.');
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  };

  const logout = () => {
    const token = localStorage.getItem('gauth_token');
    if (token && window.google?.accounts?.oauth2) {
      window.google.accounts.oauth2.revoke(token);
    }
    clearSession();
  };

  return (
    <GoogleAuthContext.Provider value={{
      user, spreadsheetId, loading, syncing,
      setSyncing, initialData, login, logout
    }}>
      {children}
    </GoogleAuthContext.Provider>
  );
};

export const useGoogleAuth = () => useContext(GoogleAuthContext);