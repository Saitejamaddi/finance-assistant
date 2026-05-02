import { useState } from 'react';
import { useTransactions } from '../context/TransactionContext';
import { useBalance } from '../context/BalanceContext';
import { useAccounts } from '../context/AccountContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import './Dashboard.css';
import './PageStyles.css';

const COLORS = ['#f97316','#3b82f6','#ef4444','#a855f7','#ec4899','#10b981','#6b7280'];

const Dashboard = () => {
  const { transactions, totalCredits, totalDebits } = useTransactions();
  const { currentBalance, openingBalance, setOpeningBalance, overrideEnabled, clearOverride, hasAnyAccountOpeningBalance, accountsOpeningBalanceTotal } = useBalance();
  const { accounts } = useAccounts();

  const [editingBalance, setEditingBalance] = useState(false);
  const [balanceInput, setBalanceInput] = useState('');

  const categoryMap = {};
  transactions.filter((t) => t.type === 'debit').forEach((t) => {
    categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
  });
  const pieData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));
  const recentTransactions = transactions.slice(0, 5);

  const handleEditClick = () => {
    setBalanceInput(openingBalance);
    setEditingBalance(true);
  };

  const handleBalanceSave = () => {
    const val = parseFloat(balanceInput);
    setOpeningBalance(isNaN(val) ? 0 : val);
    setEditingBalance(false);
  };

  const handleClearOverride = async () => {
    await clearOverride();
    setEditingBalance(false);
  };

  // Per-account current balances
  const getAccountBalance = (account) => {
    const opening = account.openingBalance !== '' && account.openingBalance != null
      ? parseFloat(account.openingBalance) : 0;
    const credits = transactions
      .filter(t => t.accountId === account.id && t.type === 'credit')
      .reduce((s, t) => s + t.amount, 0);
    const debits = transactions
      .filter(t => t.accountId === account.id && t.type === 'debit')
      .reduce((s, t) => s + t.amount, 0);
    return opening + credits - debits;
  };

  return (
    <div className="page">
      <h1 className="page-heading">Dashboard</h1>

      {/* ── Summary Cards ── */}
      <div className="dash-summary">

        <div className="dash-card balance-card">
          <span className="dash-label">Account Balance</span>
          <span className={`dash-value balance-val ${currentBalance < 0 ? 'negative' : ''}`}>
            ₹{currentBalance.toLocaleString('en-IN')}
          </span>

          {editingBalance ? (
            <div className="balance-edit-row">
              <input
                type="number"
                value={balanceInput}
                onChange={(e) => setBalanceInput(e.target.value)}
                className="balance-input"
                placeholder="Enter opening balance"
                autoFocus
              />
              <button className="balance-save-btn" onClick={handleBalanceSave}>Save</button>
              <button className="balance-cancel-btn" onClick={() => setEditingBalance(false)}>✕</button>
            </div>
          ) : (
            <div className="balance-hint-row">
              {hasAnyAccountOpeningBalance && !overrideEnabled ? (
                <span className="balance-hint">
                  📊 Opening: ₹{accountsOpeningBalanceTotal.toLocaleString('en-IN')} (from accounts)
                  <button className="balance-override-link" onClick={handleEditClick}>override</button>
                </span>
              ) : (
                <span className="balance-hint" onClick={handleEditClick}>
                  ✏️ Opening balance: ₹{openingBalance.toLocaleString('en-IN')}
                  {overrideEnabled && hasAnyAccountOpeningBalance && (
                    <button className="balance-override-link" onClick={(e) => { e.stopPropagation(); handleClearOverride(); }}>
                      use account totals
                    </button>
                  )}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="dash-card debit-card">
          <span className="dash-label">Total Debits</span>
          <span className="dash-value debit-color">₹{totalDebits.toLocaleString('en-IN')}</span>
        </div>

        <div className="dash-card credit-card">
          <span className="dash-label">Total Credits</span>
          <span className="dash-value credit-color">₹{totalCredits.toLocaleString('en-IN')}</span>
        </div>

        <div className="dash-card purple">
          <span className="dash-label">Transactions</span>
          <span className="dash-value">{transactions.length}</span>
        </div>

      </div>

      {/* ── Per-account balance strip ── */}
      {accounts.length > 0 && (
        <div className="acc-balance-strip">
          {accounts.map(acc => {
            const bal = getAccountBalance(acc);
            return (
              <div key={acc.id} className="acc-strip-item" style={{ borderTop: `3px solid ${acc.color}` }}>
                <div className="acc-strip-icon" style={{ background: acc.color + '20', color: acc.color }}>
                  {acc.icon}
                </div>
                <div className="acc-strip-info">
                  <span className="acc-strip-name">{acc.name}</span>
                  <span className={`acc-strip-bal ${bal < 0 ? 'negative' : 'positive'}`}>
                    ₹{bal.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Charts & Recent ── */}
      <div className="dash-grid">
        <div className="dash-panel">
          <h2 className="panel-title">Spending Breakdown</h2>
          {pieData.length === 0 ? (
            <p className="panel-empty">No debit transactions yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={85} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `₹${value.toFixed(0)}`} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="dash-panel">
          <h2 className="panel-title">Recent Transactions</h2>
          {recentTransactions.length === 0 ? (
            <p className="panel-empty">No transactions yet</p>
          ) : (
            <div className="recent-list">
              {recentTransactions.map((t) => {
                const acc = accounts.find(a => a.id === t.accountId);
                return (
                  <div key={t.id} className="recent-item">
                    <div>
                      <div className="recent-title-row">
                        <p className="recent-title">{t.title}</p>
                        {acc && (
                          <span className="recent-acc-badge" style={{ background: acc.color + '20', color: acc.color }}>
                            {acc.icon} {acc.name}
                          </span>
                        )}
                      </div>
                      <p className="recent-meta">{t.category} · {t.date}</p>
                    </div>
                    <span className={`recent-amount ${t.type}`}>
                      {t.type === 'debit' ? '−' : '+'} ₹{t.amount.toFixed(0)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;