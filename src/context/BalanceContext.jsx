import { createContext, useContext, useState, useEffect } from 'react';
import { useGoogleAuth } from './GoogleAuthContext';
import { writeSetting } from '../services/SheetsService';
import { useTransactions } from './TransactionContext';
import { useAccounts } from './AccountContext';

const BalanceContext = createContext();

export const BalanceProvider = ({ children }) => {
  const { spreadsheetId, initialData, setSyncing } = useGoogleAuth();
  const { totalCredits, totalDebits } = useTransactions();
  const {hasAnyAccountOpeningBalance, accountsOpeningBalanceTotal } = useAccounts();

  const [manualOpeningBalance, setManualOpeningBalanceState] = useState(0);
  const [overrideEnabled, setOverrideEnabled] = useState(false);

  useEffect(() => {
    if (initialData?.settings?.openingBalance) {
      setManualOpeningBalanceState(parseFloat(initialData.settings.openingBalance) || 0);
    }
    if (initialData?.settings?.balanceOverride) {
      setOverrideEnabled(initialData.settings.balanceOverride === 'true');
    }
  }, [initialData]);

  // If any account has an opening balance set, use the sum of those.
  // User can still override with a manual value at any time.
  const openingBalance = overrideEnabled || !hasAnyAccountOpeningBalance
    ? manualOpeningBalance
    : accountsOpeningBalanceTotal;

  const currentBalance = openingBalance + totalCredits - totalDebits;

  const setOpeningBalance = async (value) => {
    setManualOpeningBalanceState(value);
    setOverrideEnabled(true);
    if (!spreadsheetId) return;
    setSyncing(true);
    try {
      await writeSetting(spreadsheetId, 'openingBalance', value);
      await writeSetting(spreadsheetId, 'balanceOverride', 'true');
    } finally {
      setSyncing(false);
    }
  };

  // Call this to go back to auto-summing from accounts
  const clearOverride = async () => {
    setOverrideEnabled(false);
    if (!spreadsheetId) return;
    setSyncing(true);
    try {
      await writeSetting(spreadsheetId, 'balanceOverride', 'false');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <BalanceContext.Provider value={{
      openingBalance,
      manualOpeningBalance,
      overrideEnabled,
      hasAnyAccountOpeningBalance,
      accountsOpeningBalanceTotal,
      setOpeningBalance,
      clearOverride,
      currentBalance,
    }}>
      {children}
    </BalanceContext.Provider>
  );
};

export const useBalance = () => useContext(BalanceContext);