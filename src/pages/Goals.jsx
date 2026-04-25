import { useState, useEffect } from 'react';
import { useGoogleAuth } from '../context/GoogleAuthContext';
import { writeAllGoals } from '../services/SheetsService';
import './Goals.css';
import './PageStyles.css';

const Goals = () => {
  const { spreadsheetId, initialData, setSyncing } = useGoogleAuth();
  const [goals, setGoals] = useState([]);
  const [form, setForm] = useState({ name: '', target: '', saved: '' });

  // ── Load from Google Sheets on login ──────────────────────────────────
  useEffect(() => {
    if (initialData?.goals) {
      setGoals(initialData.goals);
    }
  }, [initialData]);

  // ── Sync to Google Sheets ─────────────────────────────────────────────
  const syncGoals = async (updated) => {
    if (!spreadsheetId) return;
    setSyncing(true);
    try {
      await writeAllGoals(spreadsheetId, updated);
    } catch (err) {
      console.error('Goals sync error:', err);
    } finally {
      setSyncing(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name || !form.target) return;
    const newGoal = {
      id:     Date.now(),
      name:   form.name,
      target: parseFloat(form.target),
      saved:  parseFloat(form.saved) || 0,
    };
    const updated = [newGoal, ...goals];
    setGoals(updated);
    await syncGoals(updated);
    setForm({ name: '', target: '', saved: '' });
  };

  const handleAddSavings = async (id, amount) => {
    if (!amount || isNaN(parseFloat(amount))) return;
    const updated = goals.map((g) =>
      g.id === id
        ? { ...g, saved: Math.min(g.saved + parseFloat(amount), g.target) }
        : g
    );
    setGoals(updated);
    await syncGoals(updated);
  };

  const handleDelete = async (id) => {
    const updated = goals.filter((g) => g.id !== id);
    setGoals(updated);
    await syncGoals(updated);
  };

  return (
    <div className="page">
      <h1 className="page-heading">Savings Goals</h1>

      {/* ── Add Goal Form ── */}
      <div className="goal-form-card">
        <h2 className="goal-form-title">Add New Goal</h2>
        <form onSubmit={handleAdd} className="goal-form">
          <div className="goal-form-row">
            <div className="gform-group">
              <label>Goal Name</label>
              <input
                type="text"
                name="name"
                placeholder="e.g. New Laptop"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="gform-group">
              <label>Target Amount (₹)</label>
              <input
                type="number"
                name="target"
                placeholder="e.g. 50000"
                value={form.target}
                onChange={handleChange}
                min="1"
                required
              />
            </div>
            <div className="gform-group">
              <label>Already Saved (₹)</label>
              <input
                type="number"
                name="saved"
                placeholder="0"
                value={form.saved}
                onChange={handleChange}
                min="0"
              />
            </div>
            <button type="submit" className="goal-submit-btn">
              + Add Goal
            </button>
          </div>
        </form>
      </div>

      {/* ── Goals List ── */}
      {goals.length === 0 ? (
        <div className="goals-empty">
          <p>No goals yet.</p>
          <span>Add a savings goal above to start tracking!</span>
        </div>
      ) : (
        <div className="goals-grid">
          {goals.map((goal) => {
            const percent = Math.min((goal.saved / goal.target) * 100, 100);
            const isDone  = goal.saved >= goal.target;

            return (
              <div key={goal.id} className={`goal-card ${isDone ? 'done' : ''}`}>

                {/* Header */}
                <div className="goal-card-header">
                  <span className="goal-name">{goal.name}</span>
                  {isDone && <span className="goal-badge">✓ Completed!</span>}
                  <button
                    className="goal-delete"
                    onClick={() => handleDelete(goal.id)}
                    title="Delete goal"
                  >✕</button>
                </div>

                {/* Amounts */}
                <div className="goal-amounts">
                  <span className="goal-saved">₹{goal.saved.toLocaleString('en-IN')}</span>
                  <span className="goal-target"> / ₹{goal.target.toLocaleString('en-IN')}</span>
                </div>

                {/* Progress bar */}
                <div className="goal-track">
                  <div
                    className="goal-fill"
                    style={{
                      width: `${percent}%`,
                      background: isDone ? '#10b981' : '#3b82f6',
                    }}
                  />
                </div>

                {/* Footer */}
                <div className="goal-footer">
                  <span className="goal-percent">{Math.round(percent)}% saved</span>
                  {!isDone && (
                    <span className="goal-remaining">
                      ₹{(goal.target - goal.saved).toLocaleString('en-IN')} to go
                    </span>
                  )}
                </div>

                {/* Add savings input */}
                {!isDone && (
                  <div className="add-savings-row">
                    <input
                      type="number"
                      placeholder="Add amount (₹)"
                      min="1"
                      id={`add-${goal.id}`}
                    />
                    <button
                      onClick={() => {
                        const input = document.getElementById(`add-${goal.id}`);
                        if (input.value) {
                          handleAddSavings(goal.id, input.value);
                          input.value = '';
                        }
                      }}
                    >
                      Add
                    </button>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Goals;