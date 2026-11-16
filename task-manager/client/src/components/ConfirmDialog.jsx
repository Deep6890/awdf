import React from 'react';
import './ConfirmDialog.css';

export default function ConfirmDialog({
  isOpen,
  title = 'Confirm Deletion',
  message = 'Are you sure you want to delete this task? This action cannot be undone.',
  onConfirm,
  onCancel
}) {
  if (!isOpen) return null;

  return (
    <div className="confirm-overlay" role="dialog" aria-modal="true">
      <div className="confirm-modal">
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="confirm-actions">
          <button type="button" className="btn-cancel" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="btn-danger" onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
