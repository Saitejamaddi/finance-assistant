import { createContext, useContext, useState, useEffect } from 'react';
import { useGoogleAuth } from './GoogleAuthContext';
import { writeAllAccounts } from '../services/SheetsService';

const AccountContext = createContext();

export const AccountProvider = ({ children }) => {
  const { spreadsheetId, initialData, setSyncing } = useGoogleAuth();
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    if (initialData?.accounts) {
      setAccounts(initialData.accounts);
    }
  }, [initialData]);

  const syncToSheets = async (updated) => {
    if (!spreadsheetId) return;
    setSyncing(true);
    try {
      await writeAllAccounts(spreadsheetId, updated);
    } catch (err) {
      console.error('Accounts sync error:', err);
    } finally {
      setSyncing(false);
    }
  };

  const addAccount = async (account) => {
    const newAcc = { ...account, id: Date.now() };
    const updated = [...accounts, newAcc];
    setAccounts(updated);
    await syncToSheets(updated);
    return newAcc;
  };

  const updateAccount = async (id, changes) => {
    const updated = accounts.map(a => a.id === id ? { ...a, ...changes } : a);
    setAccounts(updated);
    await syncToSheets(updated);
  };

  const deleteAccount = async (id) => {
    const updated = accounts.filter(a => a.id !== id);
    setAccounts(updated);
    await syncToSheets(updated);
  };

  // ── Derived values ──────────────────────────────────────────────────

  const bankAccounts   = accounts.filter(a => a.accountType !== 'credit');
  const creditAccounts = accounts.filter(a => a.accountType === 'credit');

  // Opening balance: sum of bank accounts only
  const accountsOpeningBalanceTotal = bankAccounts
    .filter(a => a.openingBalance != null && a.openingBalance !== '')
    .reduce((sum, a) => sum + parseFloat(a.openingBalance || 0), 0);

  const hasAnyAccountOpeningBalance = bankAccounts.some(
    a => a.openingBalance != null && a.openingBalance !== ''
  );

  return (
    <AccountContext.Provider value={{
      accounts,
      bankAccounts,
      creditAccounts,
      addAccount,
      updateAccount,
      deleteAccount,
      accountsOpeningBalanceTotal,
      hasAnyAccountOpeningBalance,
    }}>
      {children}
    </AccountContext.Provider>
  );
};

export const useAccounts = () => useContext(AccountContext);