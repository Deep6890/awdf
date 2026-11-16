import React from 'react';
import './Spinner.css';

export default function Spinner({ message = 'Loading...' }) {
  return (
    <div className="spinner-wrapper" role="status" aria-live="polite">
      <div className="spinner-circle"></div>
      {message && <span className="spinner-text">{message}</span>}
    </div>
  );
}
