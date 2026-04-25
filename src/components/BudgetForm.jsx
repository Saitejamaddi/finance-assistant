import { useState } from 'react';
import { useBudget } from '../context/BudgetContext';
import { useCategories } from '../context/CategoryContext';
import './BudgetForm.css';
const BudgetForm = () => {
  const { budgets, setBudget } = useBudget();
  const { allCategories } = useCategories();
  const [selected, setSelected] = useState('Food');
  const [amount, setAmount] = useState('');
  const handleSubmit = (e) => { e.preventDefault(); if (!amount) return; setBudget(selected, amount); setAmount(''); };
  return (
    <div className="budget-form-card">
      <h2 className="budget-form-title">Set Monthly Budget</h2>
      <form onSubmit={handleSubmit} className="budget-form">
        <div className="budget-form-row">
          <div className="form-group"><label>Category</label><select value={selected} onChange={(e) => setSelected(e.target.value)}>{allCategories.map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
          <div className="form-group"><label>Limit (₹)</label><input type="number" placeholder="e.g. 5000" value={amount} onChange={(e) => setAmount(e.target.value)} min="0" required /></div>
          <button type="submit" className="budget-submit-btn">Set Budget</button>
        </div>
      </form>
      {Object.keys(budgets).length > 0 && <div className="current-budgets"><p className="current-label">Current limits:</p><div className="budget-tags">{Object.entries(budgets).map(([c, a]) => <span key={c} className="budget-tag">{c}: ₹{a}</span>)}</div></div>}
    </div>
  );
};
export default BudgetForm;
