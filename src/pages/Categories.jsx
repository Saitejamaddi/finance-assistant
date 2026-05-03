import { useState } from 'react';
import { useCategories } from '../context/CategoryContext';
import './Categories.css';
import './PageStyles.css';

const CC = { Food:'#f97316', Transport:'#3b82f6', Bills:'#ef4444', Entertainment:'#a855f7', Shopping:'#ec4899', Health:'#10b981', Other:'#6b7280' };
const EXTRA = ['#f97316','#3b82f6','#a855f7','#ec4899','#10b981','#f59e0b','#6366f1'];
const getColor = (n, i) => CC[n] || EXTRA[i % 7];

const Categories = () => {
  const { allCategories, customCategories, DEFAULT_CATEGORIES, addCategory, deleteCategory } = useCategories();
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(null);

  const handleAdd = (e) => {
    e.preventDefault();
    const t = input.trim();
    if (!t) { setError('Enter a name.'); return; }
    if (allCategories.map(c => c.toLowerCase()).includes(t.toLowerCase())) { setError('Already exists.'); return; }
    addCategory(t);
    setInput('');
    setError('');
  };

  const handleDeleteConfirm = () => {
    deleteCategory(confirmDelete);
    setConfirmDelete(null);
  };

  return (
    <div className="page">
      <h1 className="page-heading">Categories</h1>

      <div className="cat-form-card">
        <h2 className="cat-form-title">Add Custom Category</h2>
        <form onSubmit={handleAdd} className="cat-form">
          <div className="cat-input-row">
            <input
              type="text"
              placeholder="e.g. Gym, Pet Care..."
              value={input}
              onChange={(e) => { setInput(e.target.value); setError(''); }}
              className="cat-input"
            />
            <button type="submit" className="cat-add-btn">+ Add</button>
          </div>
          {error && <p className="cat-error">{error}</p>}
        </form>
      </div>

      <div className="cat-section">
        <h2 className="cat-section-title">Default Categories</h2>
        <div className="cat-grid">
          {DEFAULT_CATEGORIES.map((c, i) => (
            <div key={c} className="cat-chip default">
              <span className="cat-chip-dot" style={{ background: getColor(c, i) }} />
              <span className="cat-chip-name">{c}</span>
              <span className="cat-chip-badge">Default</span>
            </div>
          ))}
        </div>
      </div>

      {customCategories.length > 0 && (
        <div className="cat-section">
          <h2 className="cat-section-title">My Custom Categories</h2>
          <div className="cat-grid">
            {customCategories.map((c, i) => (
              <div key={c} className="cat-chip custom">
                <span className="cat-chip-dot" style={{ background: getColor(c, DEFAULT_CATEGORIES.length + i) }} />
                <span className="cat-chip-name">{c}</span>
                <button className="cat-chip-delete" onClick={() => setConfirmDelete(c)}>❌</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confirm delete modal */}
      {confirmDelete && (
        <div className="cat-confirm-backdrop">
          <div className="cat-confirm-box">
            <p className="cat-confirm-msg">
              Delete category <strong>"{confirmDelete}"</strong>?<br />
              <span className="cat-confirm-sub">Transactions using this category will not be affected.</span>
            </p>
            <div className="cat-confirm-actions">
              <button className="cat-confirm-cancel" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button className="cat-confirm-delete" onClick={handleDeleteConfirm}>Yes, delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;