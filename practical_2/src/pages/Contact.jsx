import React, { useState } from 'react'
import {
  Send, HelpCircle, X, CheckCircle,
  Mail, MapPin, Phone
} from 'lucide-react'
import './Contact.css'

/**
 * Contact Page — Controlled Form with useState
 *
 * useState #1 — formData: captures all controlled input values in real time
 * useState #2 — showTooltip: toggles the visibility of the help tooltip
 *               (UI visibility toggle — required by the practical)
 * useState #3 — submitted: shows success state after form submission
 * useState #4 — charCount: tracks live character count of the message field
 */
export default function Contact() {
  // Controlled form state — each key maps to a form field
  const [formData, setFormData] = useState({
    name:    '',
    email:   '',
    subject: '',
    message: '',
  });

  // UI visibility toggle — shows/hides the help tooltip
  const [showTooltip, setShowTooltip] = useState(false);

  // Tracks submission success state
  const [submitted, setSubmitted] = useState(false);

  // Character limit for the message field
  const MESSAGE_LIMIT = 500;

  // Generic change handler for all controlled inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Form submit handler
  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, you'd POST to an API here
    setSubmitted(true);
  };

  // Reset form back to initial state
  const handleReset = () => {
    setFormData({ name: '', email: '', subject: '', message: '' });
    setSubmitted(false);
    setShowTooltip(false);
  };

  return (
    <main className="page-content contact-page" id="contact-page">

      {/* Page header */}
      <div className="contact-header">
        <div>
          <h1 className="section-heading">Contact</h1>
          <p className="section-subheading">
            Have a project in mind? Let's talk.
          </p>
        </div>

        {/* Help tooltip toggle — useState UI visibility */}
        <div className="tooltip-wrapper" id="tooltip-wrapper">
          <button
            className={`help-btn ${showTooltip ? 'help-btn--active' : ''}`}
            id="help-tooltip-btn"
            onClick={() => setShowTooltip(prev => !prev)}
            aria-expanded={showTooltip}
            aria-controls="help-tooltip"
            aria-label="Show help"
          >
            {showTooltip ? <X size={16} /> : <HelpCircle size={16} />}
            <span>{showTooltip ? 'Close' : 'Help'}</span>
          </button>

          {/* Conditionally rendered tooltip panel */}
          {showTooltip && (
            <div className="tooltip-panel card" id="help-tooltip" role="tooltip">
              <h4>📬 How does this form work?</h4>
              <ul>
                <li>Fill in all fields and click <strong>Send Message</strong>.</li>
                <li>Your message is limited to {MESSAGE_LIMIT} characters.</li>
                <li>A live character counter updates as you type.</li>
                <li>The form uses React <code>useState</code> — no page reload.</li>
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="contact-layout">

        {/* Left — contact info cards */}
        <aside className="contact-info" id="contact-info">
          <div className="info-card card">
            <div className="info-icon"><Mail size={20} /></div>
            <div>
              <p className="info-label">Email</p>
              <a href="mailto:alex@example.com" className="info-value">alex@example.com</a>
            </div>
          </div>
          <div className="info-card card">
            <div className="info-icon"><Phone size={20} /></div>
            <div>
              <p className="info-label">Phone</p>
              <a href="tel:+911234567890" className="info-value">+91 12345 67890</a>
            </div>
          </div>
          <div className="info-card card">
            <div className="info-icon"><MapPin size={20} /></div>
            <div>
              <p className="info-label">Location</p>
              <p className="info-value">Anand, Gujarat, India</p>
            </div>
          </div>

          {/* Live preview of typed name — demonstrates real-time state */}
          {formData.name && (
            <div className="live-preview card" id="live-name-preview">
              <p className="preview-label">✏️ Composing message as:</p>
              <p className="preview-name">{formData.name}</p>
            </div>
          )}
        </aside>

        {/* Right — contact form */}
        <section className="contact-form-section" id="contact-form-section">
          {submitted ? (
            /* Success state */
            <div className="success-card card" id="success-card">
              <div className="success-icon"><CheckCircle size={48} /></div>
              <h2>Message Sent! 🎉</h2>
              <p>
                Thanks, <strong>{formData.name}</strong>! I'll get back to you at{' '}
                <strong>{formData.email}</strong> as soon as possible.
              </p>
              <button className="btn-primary" id="send-another-btn" onClick={handleReset}>
                Send Another Message
              </button>
            </div>
          ) : (
            /* Controlled form */
            <form
              className="contact-form card"
              id="contact-form"
              onSubmit={handleSubmit}
              noValidate
            >
              <h2 className="form-title">Send a Message</h2>

              {/* Row: Name + Email */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="contact-name" className="form-label">
                    Full Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="contact-name"
                    name="name"
                    className="form-input"
                    placeholder="Alex Patel"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    autoComplete="name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="contact-email" className="form-label">
                    Email Address <span className="required">*</span>
                  </label>
                  <input
                    type="email"
                    id="contact-email"
                    name="email"
                    className="form-input"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Subject */}
              <div className="form-group">
                <label htmlFor="contact-subject" className="form-label">
                  Subject <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="contact-subject"
                  name="subject"
                  className="form-input"
                  placeholder="Project enquiry / Collaboration / Feedback…"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Message — controlled textarea with live character count */}
              <div className="form-group">
                <div className="label-row">
                  <label htmlFor="contact-message" className="form-label">
                    Message <span className="required">*</span>
                  </label>
                  {/* Live character count — updates in real time via state */}
                  <span
                    className={`char-count ${formData.message.length > MESSAGE_LIMIT * 0.9 ? 'char-count--warn' : ''}`}
                    id="char-count-display"
                    aria-live="polite"
                  >
                    {formData.message.length} / {MESSAGE_LIMIT}
                  </span>
                </div>
                <textarea
                  id="contact-message"
                  name="message"
                  className="form-input form-textarea"
                  placeholder="Tell me about your project, idea, or question…"
                  value={formData.message}
                  onChange={handleChange}
                  maxLength={MESSAGE_LIMIT}
                  required
                  rows={6}
                />
              </div>

              {/* Live message preview — shows typed content in real time */}
              {formData.message.length > 0 && (
                <div className="message-preview" id="message-preview">
                  <p className="preview-label">📝 Live preview:</p>
                  <p className="preview-text">{formData.message}</p>
                </div>
              )}

              <button
                type="submit"
                className="btn-primary submit-btn"
                id="submit-contact-btn"
                disabled={!formData.name || !formData.email || !formData.message}
              >
                <Send size={16} />
                Send Message
              </button>
            </form>
          )}
        </section>
      </div>
    </main>
  )
}
