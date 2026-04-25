import { useBudget } from '../context/BudgetContext';
import { useTransactions } from '../context/TransactionContext';
import './BudgetProgress.css';
const CC = { Food:'#f97316',Transport:'#3b82f6',Bills:'#ef4444',Entertainment:'#a855f7',Shopping:'#ec4899',Health:'#10b981',Other:'#6b7280' };
const BudgetProgress = () => {
  const { budgets } = useBudget();
  const { transactions } = useTransactions();
  if (!Object.keys(budgets).length) return <div className="budget-progress-card"><p className="no-budget-msg">No budgets set yet.</p></div>;
  return (
    <div className="budget-progress-card">
      <h2 className="progress-title">Budget Overview</h2>
      <div className="progress-list">
        {Object.entries(budgets).map(([cat, limit]) => {
          const spent = transactions.filter((t) => t.type === 'debit' && t.category === cat).reduce((s, t) => s + t.amount, 0);
          const pct = Math.min((spent / limit) * 100, 100);
          const isOver = spent > limit;
          const color = CC[cat] || '#6b7280';
          return (
            <div key={cat} className="progress-item">
              <div className="progress-header">
                <div style={{display:'flex',alignItems:'center',gap:'8px'}}><div className="cat-dot" style={{background:color}}/><span className="cat-name">{cat}</span></div>
                <div><span className={`spent-amount ${isOver?'over':''}`}>₹{spent.toFixed(0)}</span><span className="limit-amount"> / ₹{limit}</span></div>
              </div>
              <div className="progress-track"><div className="progress-fill" style={{width:`${pct}%`,background:isOver?'#ef4444':color}}/></div>
              <div className="progress-footer">{isOver?<span className="over-budget">⚠ Over by ₹{(spent-limit).toFixed(0)}</span>:<span className="under-budget">₹{(limit-spent).toFixed(0)} remaining</span>}<span className="percent-label">{Math.round(pct)}%</span></div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default BudgetProgress;
