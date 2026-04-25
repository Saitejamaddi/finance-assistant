import { createContext, useContext, useState, useEffect } from 'react';
import { useGoogleAuth } from './GoogleAuthContext';
import { writeAllBudgets } from '../services/SheetsService';

const BudgetContext = createContext();

export const BudgetProvider = ({ children }) => {
  const { spreadsheetId, initialData, setSyncing } = useGoogleAuth();
  const [budgets, setBudgets] = useState({});

  useEffect(() => {
    if (initialData?.budgets) {
      setBudgets(initialData.budgets);
    }
  }, [initialData]);

  const setBudget = async (category, amount) => {
    const updated = { ...budgets, [category]: parseFloat(amount) };
    setBudgets(updated);
    if (!spreadsheetId) return;
    setSyncing(true);
    try {
      await writeAllBudgets(spreadsheetId, updated);
    } catch (err) {
      console.error('Budget sync error:', err);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <BudgetContext.Provider value={{ budgets, setBudget }}>
      {children}
    </BudgetContext.Provider>
  );
};

export const useBudget = () => useContext(BudgetContext);