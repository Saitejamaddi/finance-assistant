import './ConfirmModal.css';
const ConfirmModal = ({ message, onConfirm, onCancel }) => (
  <div className="modal-overlay">
    <div className="modal-box">
      <div className="modal-icon">🗑️</div>
      <h3 className="modal-title">Delete Transaction</h3>
      <p className="modal-message">{message}</p>
      <div className="modal-actions">
        <button className="modal-cancel" onClick={onCancel}>Cancel</button>
        <button className="modal-confirm" onClick={onConfirm}>Yes, Delete</button>
      </div>
    </div>
  </div>
);
export default ConfirmModal;
