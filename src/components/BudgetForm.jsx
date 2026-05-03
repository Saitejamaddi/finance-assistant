import { useState } from 'react';
import { useBudget } from '../context/BudgetContext';
import { useCategories } from '../context/CategoryContext';
import './BudgetForm.css';

const BudgetForm = () => {
  const { budgets, setBudget, deleteBudget, totalBudget } = useBudget();
  const { allCategories } = useCategories();
  const [selected, setSelected] = useState('Food');
  const [amount, setAmount] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount) return;
    setBudget(selected, amount);
    setAmount('');
  };

  const handleDeleteClick = (category) => setConfirmDelete(category);
  const handleDeleteConfirm = () => { deleteBudget(confirmDelete); setConfirmDelete(null); };
  const handleDeleteCancel = () => setConfirmDelete(null);

  return (
    <div className="budget-form-card">
      <h2 className="budget-form-title">Set Monthly Budget</h2>
      <form onSubmit={handleSubmit} className="budget-form">
        <div className="budget-form-row">
          <div className="form-group">
            <label>Category</label>
            <select value={selected} onChange={(e) => setSelected(e.target.value)}>
              {allCategories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Limit (₹)</label>
            <input
              type="number"
              placeholder="e.g. 5000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              required
            />
          </div>
          <button type="submit" className="budget-submit-btn">Set Budget</button>
        </div>
      </form>

      {Object.keys(budgets).length > 0 && (
        <>
          <div className="current-budgets">
            <p className="current-label">Current limits:</p>
            <div className="budget-tags">
              {Object.entries(budgets).map(([cat, amt]) => (
                <span key={cat} className="budget-tag">
                  <span className="budget-tag-text">{cat}: ₹{Number(amt).toLocaleString('en-IN')}</span>
                  <button
                    className="budget-tag-delete"
                    title={`Delete ${cat} budget`}
                    onClick={() => handleDeleteClick(cat)}
                  >❌</button>
                </span>
              ))}
            </div>
          </div>

          <div className="budget-total-bar">
            <span className="budget-total-label">💰 Total monthly budget</span>
            <span className="budget-total-value">₹{totalBudget.toLocaleString('en-IN')}</span>
          </div>
        </>
      )}

      {/* Confirm delete modal */}
      {confirmDelete && (
        <div className="budget-confirm-backdrop">
          <div className="budget-confirm-box">
            <p className="budget-confirm-msg">
              Delete <strong>{confirmDelete}</strong> budget of{' '}
              <strong>₹{Number(budgets[confirmDelete]).toLocaleString('en-IN')}</strong>?
            </p>
            <div className="budget-confirm-actions">
              <button className="budget-confirm-cancel" onClick={handleDeleteCancel}>Cancel</button>
              <button className="budget-confirm-delete" onClick={handleDeleteConfirm}>Yes, delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetForm;