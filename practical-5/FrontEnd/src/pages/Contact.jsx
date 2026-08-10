import React, { useState } from 'react'
import { HelpCircle, X, Send, CheckCircle } from 'lucide-react'
import './Contact.css'

/**
 * Contact Page — Controlled Form with useState
 *
 * useState #1 — message: controlled textarea input (real-time capture)
 * useState #2 — showTooltip: UI visibility toggle (help panel)
 * useState #3 — submitted: success state after form submit
 *
 * BUG #2: name input is UNCONTROLLED — missing value + onChange,
 * so React cannot track it via state (common mistake for beginners).
 */
export default function Contact() {
  // Controlled state for the message textarea only
  const [message, setMessage] = useState('')

  // UI visibility toggle — shows/hides the help tooltip
  const [showTooltip, setShowTooltip] = useState(false)

  // Tracks submission success
  const [submitted, setSubmitted] = useState(false)

  const LIMIT = 300

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <main className="page-content contact-page" id="contact-page">
        <div className="success-card card" id="success-card">
          <CheckCircle size={36} className="success-icon" />
          <h2 className="section-heading">Message Sent!</h2>
          <p>Thanks! I'll get back to you soon.</p>
          <button className="btn-primary" id="send-another-btn"
            onClick={() => { setMessage(''); setSubmitted(false); }}>
            Send Another
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="page-content contact-page" id="contact-page">

      <div className="contact-header">
        <div>
          <h1 className="section-heading">Contact</h1>
          <p className="section-subheading">Get in touch.</p>
        </div>

        {/* Help tooltip — useState UI visibility toggle */}
        <div className="tooltip-wrapper" id="tooltip-wrapper">
          <button
            className={`help-btn ${showTooltip ? 'help-btn--active' : ''}`}
            id="help-tooltip-btn"
            onClick={() => setShowTooltip(p => !p)}
            aria-expanded={showTooltip}
          >
            {showTooltip ? <X size={14} /> : <HelpCircle size={14} />}
            {showTooltip ? 'Close' : 'Help'}
          </button>

          {showTooltip && (
            <div className="tooltip-panel card" id="help-tooltip" role="tooltip">
              <p>Fill the form and click Send. Message is limited to {LIMIT} characters. Live character count updates as you type.</p>
            </div>
          )}
        </div>
      </div>

      <form className="contact-form card" id="contact-form" onSubmit={handleSubmit} noValidate>
        <h2 className="form-title">Send a Message</h2>

        {/*
          BUG #2: This input is UNCONTROLLED.
          It is missing value={...} and onChange={...}.
          React has no way to read or control what the user types here.
          Fix: add a useState for name and wire value + onChange.
        */}
        <div className="form-group">
          <label htmlFor="contact-name" className="form-label">
            Name <span className="required">*</span>
          </label>
          <input
            type="text"
            id="contact-name"
            name="name"
            className="form-input"
            placeholder="Your name"
            required
          />
        </div>

        {/* Message — correctly controlled input with live char count */}
        <div className="form-group">
          <div className="label-row">
            <label htmlFor="contact-message" className="form-label">
              Message <span className="required">*</span>
            </label>
            <span
              className={`char-count ${message.length > LIMIT * 0.9 ? 'char-count--warn' : ''}`}
              id="char-count-display"
              aria-live="polite"
            >
              {message.length} / {LIMIT}
            </span>
          </div>
          <textarea
            id="contact-message"
            name="message"
            className="form-input form-textarea"
            placeholder="Your message…"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={LIMIT}
            required
            rows={5}
          />
        </div>

        <button
          type="submit"
          className="btn-primary submit-btn"
          id="submit-contact-btn"
          disabled={!message}
        >
          <Send size={14} /> Send
        </button>
      </form>
    </main>
  )
}
