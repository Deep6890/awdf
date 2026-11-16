import React from 'react';
import './ErrorMessage.css';

export default function ErrorMessage({ message, onRetry }) {
  return (
    <div className="error-card" role="alert">
      <div className="error-icon">⚠️</div>
      <div className="error-content">
        <h3 className="error-title">Unable to Connect</h3>
        <p className="error-description">{message || 'An unexpected error occurred.'}</p>
        {onRetry && (
          <button type="button" className="retry-btn" onClick={onRetry}>
            🔄 Retry
          </button>
        )}
      </div>
    </div>
  );
}
