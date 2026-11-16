import './PageLoader.css';

export default function PageLoader({ message = 'Loading page...' }) {
  return (
    <div className="page-loader" role="status" aria-live="polite">
      <div className="page-loader-spinner" aria-hidden="true" />
      <p className="page-loader-text">{message}</p>
    </div>
  );
}
