import { createContext, useContext, useState, useEffect } from 'react';
import { useGoogleAuth } from './GoogleAuthContext';
import { writeAllBudgets } from '../services/SheetsService';

const BudgetContext = createContext();

export const BudgetProvider = ({ children }) => {
  const { spreadsheetId, initialData, setSyncing } = useGoogleAuth();
  const [budgets, setBudgets] = useState({});

  useEffect(() => {
    if (initialData?.budgets) setBudgets(initialData.budgets);
  }, [initialData]);

  const sync = async (updated) => {
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

  const setBudget = async (category, amount) => {
    const updated = { ...budgets, [category]: parseFloat(amount) };
    setBudgets(updated);
    await sync(updated);
  };

  const deleteBudget = async (category) => {
    const updated = { ...budgets };
    delete updated[category];
    setBudgets(updated);
    await sync(updated);
  };

  const totalBudget = Object.values(budgets).reduce((s, a) => s + parseFloat(a || 0), 0);

  return (
    <BudgetContext.Provider value={{ budgets, setBudget, deleteBudget, totalBudget }}>
      {children}
    </BudgetContext.Provider>
  );
};

export const useBudget = () => useContext(BudgetContext);