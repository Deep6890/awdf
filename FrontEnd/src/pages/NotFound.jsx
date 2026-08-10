import React from 'react'
import { Link } from 'react-router-dom'
import { Home, ArrowLeft, AlertTriangle } from 'lucide-react'
import './NotFound.css'

/**
 * NotFound — Custom 404 component rendered for unknown paths.
 * Rendered via <Route path="*" element={<NotFound />} /> in App.jsx.
 */
export default function NotFound() {
  return (
    <main className="notfound-page" id="not-found-page">
      <div className="notfound-card card" id="notfound-card">

        {/* Animated 404 graphic */}
        <div className="notfound-graphic" aria-hidden="true">
          <div className="notfound-icon">
            <AlertTriangle size={56} />
          </div>
          <h1 className="notfound-code">404</h1>
        </div>

        <h2 className="notfound-title">Page Not Found</h2>
        <p className="notfound-desc">
          Oops! The page you're looking for doesn't exist or has been moved.
          Check the URL or navigate back to safety.
        </p>

        <div className="notfound-actions">
          <Link to="/" className="btn-primary" id="notfound-home-btn">
            <Home size={16} />
            Back to Home
          </Link>
          <button
            className="btn-secondary"
            id="notfound-back-btn"
            onClick={() => window.history.back()}
          >
            <ArrowLeft size={16} />
            Go Back
          </button>
        </div>
      </div>
    </main>
  )
}
