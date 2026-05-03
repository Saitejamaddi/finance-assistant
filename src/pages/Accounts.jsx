import { useState } from "react";
import { useAccounts } from "../context/AccountContext";
import { useTransactions } from "../context/TransactionContext";
import "./Accounts.css";
import "./PageStyles.css";

const PRESET_ICONS = ["🏦", "💳", "💰", "🏧", "📱", "💵", "🪙", "🏪"];
const PRESET_COLORS = [
  "#3b82f6",
  "#10b981",
  "#f97316",
  "#a855f7",
  "#ec4899",
  "#ef4444",
  "#f59e0b",
  "#6366f1",
];

const defaultForm = {
  name: "",
  icon: "🏦",
  color: "#3b82f6",
  openingBalance: "",
};

const AccountCard = ({ account, onEdit, onDelete, currentBalance }) => {
  const isPositive = currentBalance >= 0;
  return (
    <div
      className="acc-card"
      style={{ borderTop: `4px solid ${account.color}` }}
    >
      <div className="acc-card-header">
        <div
          className="acc-icon"
          style={{ background: account.color + "20", color: account.color }}
        >
          {account.icon}
        </div>
        <div className="acc-card-actions">
          <button
            className="acc-action-btn"
            onClick={() => onEdit(account)}
            title="Edit"
          >
            ✏️
          </button>
          <button
            className="acc-action-btn acc-action-delete"
            onClick={() => onDelete(account.id)}
            title="Delete"
          >
            ❌
          </button>
        </div>
      </div>
      <h3 className="acc-name">{account.name}</h3>
      <div className="acc-balances">
        <div className="acc-balance-row">
          <span className="acc-balance-label">Opening balance</span>
          <span className="acc-balance-value">
            {account.openingBalance !== "" && account.openingBalance != null ? (
              `₹${parseFloat(account.openingBalance).toLocaleString("en-IN")}`
            ) : (
              <span className="acc-balance-none">not set</span>
            )}
          </span>
        </div>
        <div className="acc-balance-row">
          <span className="acc-balance-label">Current balance</span>
          <span
            className={`acc-balance-value acc-balance-current ${isPositive ? "positive" : "negative"}`}
          >
            ₹{currentBalance.toLocaleString("en-IN")}
          </span>
        </div>
      </div>
    </div>
  );
};

const AccountModal = ({ initial, onSave, onClose }) => {
  const [form, setForm] = useState(initial || defaultForm);
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError("Account name is required.");
      return;
    }
    onSave({
      ...form,
      openingBalance:
        form.openingBalance !== "" ? parseFloat(form.openingBalance) : "",
    });
  };

  return (
    <div className="acc-modal-backdrop" onClick={onClose}>
      <div className="acc-modal" onClick={(e) => e.stopPropagation()}>
        <div className="acc-modal-header">
          <h2>{initial ? "Edit account" : "Add account"}</h2>
          <button className="acc-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="acc-modal-form">
          <div className="acc-form-group">
            <label>Account name *</label>
            <input
              type="text"
              placeholder="e.g. SBI Savings, Kotak Current..."
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              autoFocus
            />
            {error && <p className="acc-form-error">{error}</p>}
          </div>

          <div className="acc-form-row">
            <div className="acc-form-group">
              <label>Icon</label>
              <div className="acc-icon-grid">
                {PRESET_ICONS.map((ic) => (
                  <button
                    key={ic}
                    type="button"
                    className={`acc-icon-btn ${form.icon === ic ? "selected" : ""}`}
                    onClick={() => setForm((p) => ({ ...p, icon: ic }))}
                  >
                    {ic}
                  </button>
                ))}
              </div>
            </div>
            <div className="acc-form-group">
              <label>Color</label>
              <div className="acc-color-grid">
                {PRESET_COLORS.map((col) => (
                  <button
                    key={col}
                    type="button"
                    className={`acc-color-btn ${form.color === col ? "selected" : ""}`}
                    style={{ background: col }}
                    onClick={() => setForm((p) => ({ ...p, color: col }))}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="acc-form-group">
            <label>
              Opening balance <span className="acc-optional">(optional)</span>
            </label>
            <div className="acc-amount-input">
              <span className="acc-currency">₹</span>
              <input
                type="number"
                placeholder="0.00"
                value={form.openingBalance}
                onChange={(e) =>
                  setForm((p) => ({ ...p, openingBalance: e.target.value }))
                }
                min="0"
                step="0.01"
              />
            </div>
            <p className="acc-form-hint">
              Leave blank if you want to set a combined opening balance from the
              dashboard instead.
            </p>
          </div>

          <div className="acc-modal-footer">
            <button type="button" className="acc-btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="acc-btn-save"
              style={{ background: form.color }}
            >
              {initial ? "Save changes" : "+ Add account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Accounts = () => {
  const { accounts, addAccount, updateAccount, deleteAccount } = useAccounts();
  const { transactions } = useTransactions();
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const getAccountBalance = (account) => {
    const opening =
      account.openingBalance !== "" && account.openingBalance != null
        ? parseFloat(account.openingBalance)
        : 0;
    const credits = transactions
      .filter((t) => t.accountId === account.id && t.type === "credit")
      .reduce((s, t) => s + t.amount, 0);
    const debits = transactions
      .filter((t) => t.accountId === account.id && t.type === "debit")
      .reduce((s, t) => s + t.amount, 0);
    return opening + credits - debits;
  };

  const handleSave = async (form) => {
    if (editingAccount) {
      await updateAccount(editingAccount.id, form);
    } else {
      await addAccount(form);
    }
    setShowModal(false);
    setEditingAccount(null);
  };

  const handleEdit = (account) => {
    setEditingAccount(account);
    setShowModal(true);
  };

  const handleDelete = (id) => setConfirmDelete(id);
  const handleDeleteConfirm = async () => {
    await deleteAccount(confirmDelete);
    setConfirmDelete(null);
  };

  const handleClose = () => {
    setShowModal(false);
    setEditingAccount(null);
  };

  return (
    <div className="page">
      <div className="acc-page-header">
        <h1 className="page-heading">Accounts</h1>
        <button className="acc-add-btn" onClick={() => setShowModal(true)}>
          + Add account
        </button>
      </div>

      {accounts.length === 0 ? (
        <div className="acc-empty">
          <div className="acc-empty-icon">🏦</div>
          <h2>No accounts yet</h2>
          <p>
            Add your bank accounts to track balances separately and tag
            transactions to them.
          </p>
          <button className="acc-add-btn" onClick={() => setShowModal(true)}>
            + Add your first account
          </button>
        </div>
      ) : (
        <div className="acc-grid">
          {accounts.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              onEdit={handleEdit}
              onDelete={handleDelete}
              currentBalance={getAccountBalance(account)}
            />
          ))}
        </div>
      )}

      {showModal && (
        <AccountModal
          initial={editingAccount}
          onSave={handleSave}
          onClose={handleClose}
        />
      )}

      {confirmDelete && (
        <div className="acc-modal-backdrop">
          <div
            className="acc-modal"
            style={{
              maxWidth: "360px",
              textAlign: "center",
              padding: "28px 24px 24px",
            }}
          >
            <p
              style={{
                fontSize: "15px",
                color: "#374151",
                lineHeight: "1.6",
                marginBottom: "6px",
              }}
            >
              Delete{" "}
              <strong>
                {accounts.find((a) => a.id === confirmDelete)?.name}
              </strong>
              ?
            </p>
            <p
              style={{
                fontSize: "12px",
                color: "#9ca3af",
                marginBottom: "20px",
              }}
            >
              Transactions linked to it will remain but lose their account tag.
            </p>
            <div
              style={{ display: "flex", gap: "10px", justifyContent: "center" }}
            >
              <button
                className="acc-btn-cancel"
                onClick={() => setConfirmDelete(null)}
              >
                Cancel
              </button>
              <button
                className="acc-btn-save"
                style={{ background: "#ef4444" }}
                onClick={handleDeleteConfirm}
              >
                Yes, delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Accounts;
