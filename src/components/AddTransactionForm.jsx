import { useState } from 'react';
import { useTransactions } from '../context/TransactionContext';
import { useCategories } from '../context/CategoryContext';
import { useAccounts } from '../context/AccountContext';
import './AddTransactionForm.css';

const AddTransactionForm = () => {
  const { addTransaction } = useTransactions();
  const { allCategories } = useCategories();
  const { accounts, bankAccounts, creditAccounts } = useAccounts();

  const buildEmpty = () => ({
    title: '',
    amount: '',
    type: 'debit',
    category: 'Food',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    isRecurring: false,
    recurringFrequency: 'monthly',
    accountId: accounts.length > 0 ? accounts[0].id : '',
    isBillPayment: false,
    billPaymentForId: '',
  });

  const [form, setForm] = useState(buildEmpty());

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.amount) return;

    const accountId = form.accountId !== '' ? Number(form.accountId) : null;
    const billPaymentForId = form.isBillPayment && form.billPaymentForId !== ''
      ? Number(form.billPaymentForId) : null;

    addTransaction({
      ...form,
      amount: parseFloat(form.amount),
      accountId,
      billPaymentForId,
    });

    // If this is a bill payment, also add a credit transaction to the credit card
    // to reduce its outstanding due
    if (form.isBillPayment && billPaymentForId) {
      addTransaction({
        title: `Bill payment received — ${accounts.find(a => a.id === accountId)?.name || ''}`,
        amount: parseFloat(form.amount),
        type: 'credit',
        category: 'Credit Card Payment',
        date: form.date,
        notes: 'Auto-generated from bill payment',
        isRecurring: false,
        recurringFrequency: 'monthly',
        accountId: billPaymentForId,
        isBillPayment: false,
        billPaymentForId: null,
      });
    }

    setForm({ ...buildEmpty(), accountId: form.accountId });
  };

  const selectedAccount    = accounts.find(a => a.id === Number(form.accountId));
  const isCreditCardSelected = selectedAccount?.accountType === 'credit';

  // Bill payment is only relevant when a bank account is selected and credit cards exist
  const showBillPaymentOption = !isCreditCardSelected && creditAccounts.length > 0 && form.type === 'debit';

  return (
    <div className="txn-form-card">
      <h2 className="txn-form-title">Add Transaction</h2>
      <form onSubmit={handleSubmit} className="txn-form">

        {/* ── Type toggle ── */}
        <div className="type-toggle">
          <button
            type="button"
            className={`toggle-btn debit-btn ${form.type === 'debit' ? 'active' : ''}`}
            onClick={() => setForm(p => ({ ...p, type: 'debit', isBillPayment: false }))}
          >
            ↑ Debit <span className="toggle-hint">money out</span>
          </button>
          <button
            type="button"
            className={`toggle-btn credit-btn ${form.type === 'credit' ? 'active' : ''}`}
            onClick={() => setForm(p => ({ ...p, type: 'credit', isBillPayment: false }))}
          >
            ↓ Credit <span className="toggle-hint">money in</span>
          </button>
        </div>

        {/* ── Account selector ── */}
        {accounts.length > 0 && (
          <div className="form-group">
            <label>Account</label>
            <div className="txn-account-select-wrap">
              {selectedAccount && (
                <span className="txn-account-dot" style={{ background: selectedAccount.color }}>
                  {selectedAccount.icon}
                </span>
              )}
              <select
                name="accountId"
                value={form.accountId}
                onChange={e => setForm(p => ({ ...p, accountId: e.target.value, isBillPayment: false, billPaymentForId: '' }))}
                className={selectedAccount ? 'has-account-icon' : ''}
              >
                <option value="">No account</option>
                {bankAccounts.length > 0 && (
                  <optgroup label="🏦 Bank Accounts">
                    {bankAccounts.map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.icon} {acc.name}</option>
                    ))}
                  </optgroup>
                )}
                {creditAccounts.length > 0 && (
                  <optgroup label="💳 Credit Cards">
                    {creditAccounts.map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.icon} {acc.name}</option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>
            {isCreditCardSelected && form.type === 'debit' && (
              <p className="txn-cc-hint">
                💳 This will be added to your credit card due — not deducted from your bank balance.
              </p>
            )}
          </div>
        )}

        {/* ── Bill payment toggle ── */}
        {showBillPaymentOption && (
          <div className="txn-bill-payment-row">
            <label className="txn-bill-label">
              <input
                type="checkbox"
                name="isBillPayment"
                checked={form.isBillPayment}
                onChange={handleChange}
              />
              <span>💳 This is a credit card bill payment</span>
            </label>
            {form.isBillPayment && (
              <div className="form-group" style={{ marginTop: '10px' }}>
                <label>Paying bill for</label>
                <select
                  name="billPaymentForId"
                  value={form.billPaymentForId}
                  onChange={handleChange}
                >
                  <option value="">Select credit card...</option>
                  {creditAccounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.icon} {acc.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {/* ── Title ── */}
        <div className="form-group">
          <label>Title *</label>
          <input
            type="text"
            name="title"
            placeholder={
              form.isBillPayment
                ? 'e.g. Rupay bill payment'
                : isCreditCardSelected
                ? 'e.g. Amazon order, Swiggy...'
                : form.type === 'debit'
                ? 'e.g. Grocery shopping'
                : 'e.g. Monthly salary'
            }
            value={form.title}
            onChange={handleChange}
            required
          />
        </div>

        {/* ── Amount & Date ── */}
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

        {/* ── Category (hidden during bill payment) ── */}
        {!form.isBillPayment && (
          <div className="form-group">
            <label>Category</label>
            <select name="category" value={form.category} onChange={handleChange}>
              {allCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
        )}

        {/* ── Notes ── */}
        <div className="form-group">
          <label>Notes <span className="optional-tag">optional</span></label>
          <textarea
            name="notes"
            placeholder="Add any extra details..."
            value={form.notes}
            onChange={handleChange}
            rows={2}
            className="notes-textarea"
          />
        </div>

        {/* ── Recurring (hidden during bill payment) ── */}
        {!form.isBillPayment && (
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
        )}

        <button type="submit" className={`txn-submit-btn ${form.type}`}>
          {form.isBillPayment
            ? '💳 Pay Credit Card Bill'
            : form.type === 'debit'
            ? '− Add Debit Transaction'
            : '+ Add Credit Transaction'}
        </button>

      </form>
    </div>
  );
};

export default AddTransactionForm;