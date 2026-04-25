import { createContext, useContext, useState, useEffect } from 'react';
import { useGoogleAuth } from './GoogleAuthContext';
import { writeAllTransactions } from '../services/SheetsService';

const TransactionContext = createContext();

export const TransactionProvider = ({ children }) => {
  const { spreadsheetId, initialData, setSyncing } = useGoogleAuth();
  const [transactions, setTransactions] = useState([]);

  // Load from Google Sheets on login
  useEffect(() => {
    if (initialData?.transactions) {
      setTransactions(initialData.transactions);
    }
  }, [initialData]);

  const syncToSheets = async (updatedTransactions) => {
    if (!spreadsheetId) return;
    setSyncing(true);
    try {
      await writeAllTransactions(spreadsheetId, updatedTransactions);
    } catch (err) {
      console.error('Sync error:', err);
    } finally {
      setSyncing(false);
    }
  };

  const addTransaction = async (transaction) => {
    const newTxn = { ...transaction, id: Date.now() };
    const updated = [newTxn, ...transactions];
    setTransactions(updated);
    await syncToSheets(updated);
  };

  const deleteTransaction = async (id) => {
    const updated = transactions.filter((t) => t.id !== id);
    setTransactions(updated);
    await syncToSheets(updated);
  };

  const totalCredits = transactions
    .filter((t) => t.type === 'credit')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalDebits = transactions
    .filter((t) => t.type === 'debit')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <TransactionContext.Provider value={{
      transactions, addTransaction, deleteTransaction,
      totalCredits, totalDebits
    }}>
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactions = () => useContext(TransactionContext);