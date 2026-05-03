import { useBudget } from '../context/BudgetContext';
import { useTransactions } from '../context/TransactionContext';
import './BudgetProgress.css';

const CC = {
  Food: '#f97316', Transport: '#3b82f6', Bills: '#ef4444',
  Entertainment: '#a855f7', Shopping: '#ec4899', Health: '#10b981', Other: '#6b7280'
};

const getCurrentMonthKey = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

const getMonthLabel = () => {
  return new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
};

const BudgetProgress = () => {
  const { budgets, totalBudget } = useBudget();
  const { transactions } = useTransactions();

  if (!Object.keys(budgets).length) {
    return (
      <div className="budget-progress-card">
        <p className="no-budget-msg">No budgets set yet.</p>
      </div>
    );
  }

  const currentMonthKey = getCurrentMonthKey();

  // Only count transactions from the current month
  const currentMonthTransactions = transactions.filter((t) => {
    if (!t.date) return false;
    return t.date.startsWith(currentMonthKey);
  });

  const totalSpent = Object.entries(budgets).reduce((sum, [cat]) => {
    return sum + currentMonthTransactions
      .filter((t) => t.type === 'debit' && t.category === cat)
      .reduce((s, t) => s + t.amount, 0);
  }, 0);

  const totalRemaining = totalBudget - totalSpent;
  const totalPct = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0;
  const isTotalOver = totalSpent > totalBudget;

  return (
    <div className="budget-progress-card">
      <div className="progress-header-row">
        <h2 className="progress-title">Budget Overview</h2>
        <span className="progress-month-badge">📅 {getMonthLabel()}</span>
      </div>

      {/* ── Overall summary bar ── */}
      <div className="budget-summary-bar">
        <div className="budget-summary-row">
          <span className="budget-summary-label">Total spent this month</span>
          <span className={`budget-summary-spent ${isTotalOver ? 'over' : ''}`}>
            ₹{totalSpent.toLocaleString('en-IN')} <span className="budget-summary-of">of ₹{totalBudget.toLocaleString('en-IN')}</span>
          </span>
        </div>
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{ width: `${totalPct}%`, background: isTotalOver ? '#ef4444' : '#3b82f6' }}
          />
        </div>
        <div className="budget-summary-footer">
          {isTotalOver
            ? <span className="over-budget">⚠ Over budget by ₹{(totalSpent - totalBudget).toLocaleString('en-IN')}</span>
            : <span className="under-budget">₹{totalRemaining.toLocaleString('en-IN')} remaining overall</span>
          }
          <span className="percent-label">{Math.round(totalPct)}% used</span>
        </div>
      </div>

      {/* ── Per category ── */}
      <div className="progress-list">
        {Object.entries(budgets).map(([cat, limit]) => {
          const spent = currentMonthTransactions
            .filter((t) => t.type === 'debit' && t.category === cat)
            .reduce((s, t) => s + t.amount, 0);
          const pct = Math.min((spent / limit) * 100, 100);
          const isOver = spent > limit;
          const color = CC[cat] || '#6b7280';

          return (
            <div key={cat} className="progress-item">
              <div className="progress-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div className="cat-dot" style={{ background: color }} />
                  <span className="cat-name">{cat}</span>
                </div>
                <div>
                  <span className={`spent-amount ${isOver ? 'over' : ''}`}>
                    ₹{spent.toLocaleString('en-IN')}
                  </span>
                  <span className="limit-amount"> / ₹{Number(limit).toLocaleString('en-IN')}</span>
                </div>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${pct}%`, background: isOver ? '#ef4444' : color }} />
              </div>
              <div className="progress-footer">
                {isOver
                  ? <span className="over-budget">⚠ Over by ₹{(spent - limit).toLocaleString('en-IN')}</span>
                  : <span className="under-budget">₹{(limit - spent).toLocaleString('en-IN')} remaining</span>
                }
                <span className="percent-label">{Math.round(pct)}%</span>
              </div>
            </div>
          );
        })}
      </div>

      <p className="budget-month-note">
      </p>
    </div>
  );
};

export default BudgetProgress;