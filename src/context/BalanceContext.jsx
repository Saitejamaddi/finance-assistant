import { createContext, useContext, useState, useEffect } from 'react';
import { useGoogleAuth } from './GoogleAuthContext';
import { writeSetting } from '../services/SheetsService';
import { useTransactions } from './TransactionContext';
import { useAccounts } from './AccountContext';

const BalanceContext = createContext();

export const BalanceProvider = ({ children }) => {
  const { spreadsheetId, initialData, setSyncing } = useGoogleAuth();
  const { transactions, totalCredits, totalDebits } = useTransactions();
  const { bankAccounts, creditAccounts, hasAnyAccountOpeningBalance, accountsOpeningBalanceTotal } = useAccounts();

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

  const openingBalance = overrideEnabled || !hasAnyAccountOpeningBalance
    ? manualOpeningBalance
    : accountsOpeningBalanceTotal;

  // ── Per-account balance helper ──────────────────────────────────────
  const getAccountCurrentBalance = (account) => {
    const opening = account.openingBalance != null && account.openingBalance !== ''
      ? parseFloat(account.openingBalance) : 0;
    const credits = transactions
      .filter(t => t.accountId === account.id && t.type === 'credit')
      .reduce((s, t) => s + t.amount, 0);
    const debits = transactions
      .filter(t => t.accountId === account.id && t.type === 'debit')
      .reduce((s, t) => s + t.amount, 0);
    return opening + credits - debits;
  };

  // ── Bank balance: sum of all bank account current balances ──────────
  // If no accounts exist fall back to the simple opening+credits-debits
  const bankBalance = bankAccounts.length > 0
    ? bankAccounts.reduce((sum, a) => sum + getAccountCurrentBalance(a), 0)
    : openingBalance + totalCredits - totalDebits;

  // ── Credit card due: total outstanding across all credit cards ──────
  // For a credit card, "due" = sum of debits - sum of credits (payments reduce the due)
  const totalCreditDue = creditAccounts.reduce((sum, a) => {
    const debits = transactions
      .filter(t => t.accountId === a.id && t.type === 'debit')
      .reduce((s, t) => s + t.amount, 0);
    const payments = transactions
      .filter(t => t.accountId === a.id && t.type === 'credit')
      .reduce((s, t) => s + t.amount, 0);
    return sum + Math.max(0, debits - payments);
  }, 0);

  // ── Net worth: what you actually own after subtracting what you owe ─
  const netWorth = bankBalance - totalCreditDue;

  // ── Legacy currentBalance for compatibility ─────────────────────────
  const currentBalance = bankBalance;

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
      bankBalance,
      totalCreditDue,
      netWorth,
      getAccountCurrentBalance,
    }}>
      {children}
    </BalanceContext.Provider>
  );
};

export const useBalance = () => useContext(BalanceContext);