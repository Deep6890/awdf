import React, { useEffect } from 'react';
import './Toast.css';

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const isError = toast.type === 'error';

  return (
    <div className={`toast-container ${isError ? 'toast-error' : 'toast-success'}`} role="status">
      <span className="toast-icon">{isError ? '✕' : '✓'}</span>
      <span className="toast-message">{toast.message}</span>
      <button type="button" className="toast-close" onClick={onClose} aria-label="Dismiss">
        &times;
      </button>
    </div>
  );
}
