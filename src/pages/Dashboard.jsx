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
  const {
    openingBalance, setOpeningBalance, clearOverride,
    overrideEnabled, hasAnyAccountOpeningBalance, accountsOpeningBalanceTotal,
    bankBalance, totalCreditDue, netWorth,
    getAccountCurrentBalance,
  } = useBalance();
  const { accounts, bankAccounts, creditAccounts } = useAccounts();

  const [editingBalance, setEditingBalance] = useState(false);
  const [balanceInput, setBalanceInput]     = useState('');

  const categoryMap = {};
  transactions.filter(t => t.type === 'debit').forEach(t => {
    categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
  });
  const pieData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));
  const recentTransactions = transactions.slice(0, 5);
  const netTransactions = totalCredits - totalDebits;
  const fromAccounts = hasAnyAccountOpeningBalance && !overrideEnabled;

  const handleEditClick = () => { setBalanceInput(openingBalance); setEditingBalance(true); };
  const handleBalanceSave = () => { setOpeningBalance(isNaN(parseFloat(balanceInput)) ? 0 : parseFloat(balanceInput)); setEditingBalance(false); };
  const handleClearOverride = async (e) => { e.stopPropagation(); await clearOverride(); setEditingBalance(false); };

  return (
    <div className="page">
      <h1 className="page-heading">Dashboard</h1>

      {/* ── Summary Cards ── */}
      <div className="dash-summary">

        {/* ── Option C Balance Card ── */}
        <div className="dash-card balance-card">
          <div className="balance-card-main">
            <div>
              <span className="dash-label">Bank Balance</span>
              <span className={`dash-value balance-val ${bankBalance < 0 ? 'negative' : ''}`}>
                ₹{bankBalance.toLocaleString('en-IN')}
              </span>
            </div>
            {!editingBalance && (
              <button className="balance-edit-btn" onClick={handleEditClick}>
                Edit opening balance
              </button>
            )}
          </div>

          {editingBalance ? (
            <div className="balance-edit-inline">
              <div className="balance-edit-field">
                <span className="balance-edit-label">Opening balance (₹)</span>
                <div className="balance-edit-row">
                  <input
                    type="number"
                    value={balanceInput}
                    onChange={e => setBalanceInput(e.target.value)}
                    className="balance-input"
                    placeholder="0.00"
                    autoFocus
                  />
                  <button className="balance-save-btn" onClick={handleBalanceSave}>Save</button>
                  <button className="balance-cancel-btn" onClick={() => setEditingBalance(false)}>Cancel</button>
                </div>
              </div>
              {fromAccounts && (
                <p className="balance-acc-note">
                  Currently auto-summed from your accounts (₹{accountsOpeningBalanceTotal.toLocaleString('en-IN')}). Saving will override this.
                </p>
              )}
            </div>
          ) : (
            <div className="balance-breakdown">
              <div className="breakdown-item">
                <span className="breakdown-label">Opening</span>
                <span className="breakdown-val">₹{openingBalance.toLocaleString('en-IN')}</span>
                {fromAccounts && <span className="breakdown-tag">from accounts</span>}
                {overrideEnabled && hasAnyAccountOpeningBalance && (
                  <button className="breakdown-reset" onClick={handleClearOverride}>use accounts</button>
                )}
              </div>
              <div className="breakdown-divider" />
              <div className="breakdown-item">
                <span className="breakdown-label">Credits</span>
                <span className="breakdown-val credit-color">+₹{totalCredits.toLocaleString('en-IN')}</span>
              </div>
              <div className="breakdown-divider" />
              <div className="breakdown-item">
                <span className="breakdown-label">Debits</span>
                <span className="breakdown-val debit-color">−₹{totalDebits.toLocaleString('en-IN')}</span>
              </div>
              <div className="breakdown-divider" />
              <div className="breakdown-item">
                <span className="breakdown-label">Net</span>
                <span className={`breakdown-val ${netTransactions >= 0 ? 'credit-color' : 'debit-color'}`}>
                  {netTransactions >= 0 ? '+' : '−'}₹{Math.abs(netTransactions).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ── Net Worth & Credit Due ── */}
        <div className="dash-right-col">
          <div className="dash-card networth-card">
            <span className="dash-label">Net Worth</span>
            <span className={`dash-value ${netWorth < 0 ? 'debit-color' : 'credit-color'}`}>
              ₹{netWorth.toLocaleString('en-IN')}
            </span>
            <span className="dash-card-sub">bank balance − credit dues</span>
          </div>

          {creditAccounts.length > 0 && (
            <div className="dash-card credit-due-card">
              <span className="dash-label">Credit Card Due</span>
              <span className={`dash-value ${totalCreditDue > 0 ? 'debit-color' : ''}`}>
                ₹{totalCreditDue.toLocaleString('en-IN')}
              </span>
              <span className="dash-card-sub">
                {totalCreditDue === 0 ? '✅ all clear' : `across ${creditAccounts.length} card${creditAccounts.length > 1 ? 's' : ''}`}
              </span>
            </div>
          )}
        </div>

      </div>

      {/* ── Per-account balance strip ── */}
      {accounts.length > 0 && (
        <div className="acc-balance-strip">
          {bankAccounts.map(acc => {
            const bal = getAccountCurrentBalance(acc);
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
          {creditAccounts.map(acc => {
            const bal = getAccountCurrentBalance(acc);
            const due = Math.max(0, bal * -1);
            return (
              <div key={acc.id} className="acc-strip-item" style={{ borderTop: `3px solid ${acc.color}` }}>
                <div className="acc-strip-icon" style={{ background: acc.color + '20', color: acc.color }}>
                  {acc.icon}
                </div>
                <div className="acc-strip-info">
                  <span className="acc-strip-name">{acc.name}</span>
                  <span className={`acc-strip-bal ${due > 0 ? 'negative' : 'positive'}`}>
                    {due > 0 ? `Due ₹${due.toLocaleString('en-IN')}` : '✅ Clear'}
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
                <Tooltip formatter={value => `₹${value.toFixed(0)}`} />
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
              {recentTransactions.map(t => {
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