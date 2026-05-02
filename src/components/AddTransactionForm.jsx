import { useState } from 'react';
import { useTransactions } from '../context/TransactionContext';
import { useCategories } from '../context/CategoryContext';
import { useAccounts } from '../context/AccountContext';
import './AddTransactionForm.css';

const AddTransactionForm = () => {
  const { addTransaction } = useTransactions();
  const { allCategories } = useCategories();
  const { accounts } = useAccounts();

  const emptyForm = {
    title: '',
    amount: '',
    type: 'debit',
    category: 'Food',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    isRecurring: false,
    recurringFrequency: 'monthly',
    accountId: accounts.length > 0 ? accounts[0].id : '',
  };

  const [form, setForm] = useState(emptyForm);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.amount) return;
    addTransaction({
      ...form,
      amount: parseFloat(form.amount),
      accountId: form.accountId !== '' ? Number(form.accountId) : null,
    });
    setForm({ ...emptyForm, accountId: form.accountId });
  };

  const selectedAccount = accounts.find(a => a.id === Number(form.accountId));

  return (
    <div className="txn-form-card">
      <h2 className="txn-form-title">Add Transaction</h2>
      <form onSubmit={handleSubmit} className="txn-form">

        <div className="type-toggle">
          <button type="button" className={`toggle-btn debit-btn ${form.type === 'debit' ? 'active' : ''}`} onClick={() => setForm((p) => ({ ...p, type: 'debit' }))}>
            ↑ Debit <span className="toggle-hint">money out</span>
          </button>
          <button type="button" className={`toggle-btn credit-btn ${form.type === 'credit' ? 'active' : ''}`} onClick={() => setForm((p) => ({ ...p, type: 'credit' }))}>
            ↓ Credit <span className="toggle-hint">money in</span>
          </button>
        </div>

        <div className="form-group">
          <label>Title *</label>
          <input
            type="text"
            name="title"
            placeholder={form.type === 'debit' ? 'e.g. Grocery shopping' : 'e.g. Monthly salary'}
            value={form.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="txn-form-row">
          <div className="form-group">
            <label>Amount (₹) *</label>
            <input
              type="number"
              name="amount"
              placeholder="0.00"
              value={form.amount}
              onChange={handleChange}
              min="0"
              step="0.01"
              required
            />
          </div>
          <div className="form-group">
            <label>Date</label>
            <input type="date" name="date" value={form.date} onChange={handleChange} />
          </div>
        </div>

        <div className="form-group">
          <label>Category</label>
          <select name="category" value={form.category} onChange={handleChange}>
            {allCategories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>

        {accounts.length > 0 && (
          <div className="form-group">
            <label>Account</label>
            <div className="txn-account-select-wrap">
              {selectedAccount && (
                <span
                  className="txn-account-dot"
                  style={{ background: selectedAccount.color }}
                >
                  {selectedAccount.icon}
                </span>
              )}
              <select
                name="accountId"
                value={form.accountId}
                onChange={handleChange}
                className={selectedAccount ? 'has-account-icon' : ''}
              >
                <option value="">No account</option>
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.icon} {acc.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div className="form-group">
          <label>Notes <span className="optional-tag">optional</span></label>
          <textarea
            name="notes"
            placeholder="Add any extra details about this transaction..."
            value={form.notes}
            onChange={handleChange}
            rows={2}
            className="notes-textarea"
          />
        </div>

        <div className="recurring-section">
          <label className="recurring-label">
            <input type="checkbox" name="isRecurring" checked={form.isRecurring} onChange={handleChange} />
            <span>🔁 This is a recurring transaction</span>
          </label>
          {form.isRecurring && (
            <select name="recurringFrequency" value={form.recurringFrequency} onChange={handleChange} className="recurring-select">
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          )}
        </div>

        <button type="submit" className={`txn-submit-btn ${form.type}`}>
          {form.type === 'debit' ? '− Add Debit Transaction' : '+ Add Credit Transaction'}
        </button>

      </form>
    </div>
  );
};

export default AddTransactionForm;