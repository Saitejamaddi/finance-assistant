import { useState } from 'react';
import { useTransactions } from '../context/TransactionContext';
import { useCategories } from '../context/CategoryContext';
import ConfirmModal from './ConfirmModal';
import './TransactionList.css';

const categoryColors = {
  Food: '#f97316', Transport: '#3b82f6', Bills: '#ef4444',
  Entertainment: '#a855f7', Shopping: '#ec4899', Health: '#10b981', Other: '#6b7280',
};
const getColor = (name) => categoryColors[name] || '#6366f1';

// ── Fixed CSV export ──────────────────────────────────────────────────────
const exportToCSV = (transactions) => {
  if (transactions.length === 0) {
    alert('No transactions to export!');
    return;
  }

  const headers = ['Title', 'Type', 'Amount (INR)', 'Category', 'Date', 'Notes', 'Recurring', 'Frequency'];

  const rows = transactions.map((t) => {
    // Wrap values in quotes to handle commas in text
    const safe = (val) => `"${String(val ?? '').replace(/"/g, '""')}"`;
    return [
      safe(t.title),
      safe(t.type),
      safe(t.amount),
      safe(t.category),
      safe(t.date),
      safe(t.notes || ''),
      safe(t.isRecurring ? 'Yes' : 'No'),
      safe(t.isRecurring ? t.recurringFrequency : '-'),
    ].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');

  // BOM for Excel to read ₹ and special chars correctly
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `transactions_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const TransactionList = () => {
  const { transactions, deleteTransaction } = useTransactions();
  const { allCategories } = useCategories();
  const [filter, setFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('all');
  const [confirmId, setConfirmId] = useState(null);

  const filtered = transactions
    .filter((t) => filter === 'All' || t.category === filter)
    .filter((t) => typeFilter === 'all' || t.type === typeFilter);

  const totalFiltered = filtered.reduce((sum, t) =>
    t.type === 'debit' ? sum - t.amount : sum + t.amount, 0);

  const txnToDelete = transactions.find((t) => t.id === confirmId);

  return (
    <div className="txn-list-card">
      {confirmId && (
        <ConfirmModal
          message={`Are you sure you want to delete "${txnToDelete?.title}" of ₹${txnToDelete?.amount}?`}
          onConfirm={() => { deleteTransaction(confirmId); setConfirmId(null); }}
          onCancel={() => setConfirmId(null)}
        />
      )}

      {/* Header */}
      <div className="txn-list-header">
        <div>
          <h2 className="txn-list-title">Transactions</h2>
          <span className="txn-count">{transactions.length} total</span>
        </div>
        <button className="export-btn" onClick={() => exportToCSV(transactions)}>
          📤 Export CSV
        </button>
      </div>

      {/* Type filter */}
      <div className="type-filter-bar">
        {[
          { key: 'all',    label: '🔁 All' },
          { key: 'debit',  label: '↑ Debit' },
          { key: 'credit', label: '↓ Credit' },
        ].map(({ key, label }) => (
          <button
            key={key}
            className={`type-filter-btn ${typeFilter === key ? `active-${key}` : ''}`}
            onClick={() => setTypeFilter(key)}
          >
            {label}
          </button>
        ))}
        {filtered.length > 0 && (
          <span className={`filtered-total ${totalFiltered >= 0 ? 'positive' : 'negative'}`}>
            Net: {totalFiltered >= 0 ? '+' : ''}₹{totalFiltered.toFixed(0)}
          </span>
        )}
      </div>

      {/* Category filter */}
      <div className="filter-bar">
        <button className={`filter-btn ${filter === 'All' ? 'active' : ''}`} onClick={() => setFilter('All')}>All</button>
        {allCategories.map((cat) => (
          <button key={cat} className={`filter-btn ${filter === cat ? 'active' : ''}`} onClick={() => setFilter(cat)}>
            {cat}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <p>No transactions found.</p>
          <span>Try changing your filters or add a new transaction above.</span>
        </div>
      ) : (
        <div className="txn-items">
          {filtered.map((txn) => (
            <div key={txn.id} className={`txn-item ${txn.type}`}>
              <div className="txn-left">
                <div className="cat-dot" style={{ background: getColor(txn.category) }} />
                <div className="txn-info">
                  <div className="txn-title-row">
                    <span className="txn-title">{txn.title}</span>
                    {txn.isRecurring && (
                      <span className="recurring-badge">🔁 {txn.recurringFrequency}</span>
                    )}
                  </div>
                  <span className="txn-meta">{txn.category} · {txn.date}</span>
                  {txn.notes && txn.notes.trim() && (
                    <span className="txn-notes">📝 {txn.notes}</span>
                  )}
                </div>
              </div>
              <div className="txn-right">
                <span className={`txn-amount ${txn.type}`}>
                  {txn.type === 'debit' ? '−' : '+'} ₹{txn.amount.toFixed(2)}
                </span>
                <button className="delete-btn" title="Delete" onClick={() => setConfirmId(txn.id)}>✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TransactionList;
