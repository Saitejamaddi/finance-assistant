import { createContext, useContext, useState, useEffect } from 'react';
import { useGoogleAuth } from './GoogleAuthContext';
import { writeSetting } from '../services/SheetsService';
import { useTransactions } from './TransactionContext';

const BalanceContext = createContext();

export const BalanceProvider = ({ children }) => {
  const { spreadsheetId, initialData, setSyncing } = useGoogleAuth();
  const { totalCredits, totalDebits } = useTransactions();
  const [openingBalance, setOpeningBalanceState] = useState(0);

  useEffect(() => {
    if (initialData?.settings?.openingBalance) {
      setOpeningBalanceState(parseFloat(initialData.settings.openingBalance) || 0);
    }
  }, [initialData]);

  const currentBalance = openingBalance + totalCredits - totalDebits;

  const setOpeningBalance = async (value) => {
    setOpeningBalanceState(value);
    if (!spreadsheetId) return;
    setSyncing(true);
    try {
      await writeSetting(spreadsheetId, 'openingBalance', value);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <BalanceContext.Provider value={{ openingBalance, setOpeningBalance, currentBalance }}>
      {children}
    </BalanceContext.Provider>
  );
};

export const useBalance = () => useContext(BalanceContext);