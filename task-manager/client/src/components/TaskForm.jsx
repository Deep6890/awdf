import { useState } from 'react';
import { Plus, Tag, AlignLeft, Sparkles, Loader2 } from 'lucide-react';
import { generateDescription } from '../api/api';
import './TaskForm.css';

export default function TaskForm({ onAddTask, saving }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [validationError, setValidationError] = useState('');

  // AI Description Generator state (P13)
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMessage, setAiMessage] = useState('');
  const [isAiGenerated, setIsAiGenerated] = useState(false);

  const handleGenerateAiDescription = async () => {
    if (!title.trim() || aiLoading) return;
    setAiLoading(true);
    setAiMessage('');

    try {
      const res = await generateDescription(title.trim());
      if (res?.fallback) {
        setAiMessage(
          res.message || 'AI suggestion is unavailable right now. You can write the description yourself.'
        );
        setIsAiGenerated(false);
      } else if (res?.description) {
        setDescription(res.description);
        setIsAiGenerated(true);
      }
    } catch (err) {
      if (err.status === 429) {
        setAiMessage('Please wait before requesting another AI suggestion.');
      } else {
        setAiMessage('AI suggestion is unavailable right now. You can write the description yourself.');
      }
      setIsAiGenerated(false);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setValidationError('Please enter a task title');
      return;
    }
    setValidationError('');

    try {
      await onAddTask({
        title: title.trim(),
        description: description.trim(),
        priority
      });
      setTitle('');
      setDescription('');
      setPriority('medium');
      setAiMessage('');
      setIsAiGenerated(false);
    } catch {
      // Handled by hook
    }
  };

  return (
    <form className="task-form-panel glass-panel" onSubmit={handleSubmit}>
      <div className="form-header-line">
        <h3 className="form-heading">
          <Plus size={18} className="heading-plus-icon" /> Add New Task
        </h3>
        <span className="char-count-pill">{title.length} / 100</span>
      </div>

      {validationError && (
        <div className="form-error-banner" role="alert">
          {validationError}
        </div>
      )}

      <div className="form-inputs-grid">
        <div className="input-group title-group">
          <input
            type="text"
            className="task-input-field"
            placeholder="What needs to be done?"
            value={title}
            maxLength={100}
            onChange={(e) => {
              setTitle(e.target.value);
              if (validationError) setValidationError('');
            }}
            disabled={saving}
            required
          />
        </div>

        <div className="input-group priority-group">
          <div className="priority-label-row">
            <Tag size={13} />
            <span>Priority:</span>
          </div>
          <div className="priority-options">
            {['low', 'medium', 'high'].map((p) => (
              <button
                key={p}
                type="button"
                className={`priority-chip priority-chip--${p} ${
                  priority === p ? 'active' : ''
                }`}
                onClick={() => setPriority(p)}
                disabled={saving}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Description Area with AI Assistant Header */}
      <div className="form-desc-container">
        <div className="desc-header-row">
          <div className="desc-title-label">
            <AlignLeft size={14} />
            <span>Description (Optional):</span>
          </div>

          {/* AI Description Trigger Button (P13) */}
          <button
            type="button"
            className="btn-ai-generate"
            onClick={handleGenerateAiDescription}
            disabled={saving || aiLoading || !title.trim()}
            title={
              !title.trim()
                ? 'Enter a title first to generate a description'
                : 'Generate a concise description using Groq AI'
            }
          >
            {aiLoading ? (
              <>
                <Loader2 size={13} className="spin-icon" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Sparkles size={13} />
                <span>Generate with AI</span>
              </>
            )}
          </button>
        </div>

        <textarea
          className="task-textarea-field"
          placeholder="Add extra details, notes, or click 'Generate with AI' above..."
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            // If user manually clears or edits, allow normal state
          }}
          rows="2"
          disabled={saving}
        />

        {/* AI Disclaimer or Notification */}
        {isAiGenerated && (
          <div className="ai-disclaimer-pill" role="status">
            <Sparkles size={12} />
            <span>AI-generated suggestion — please review before saving.</span>
          </div>
        )}

        {aiMessage && (
          <div className="ai-notice-box" role="status">
            <span>{aiMessage}</span>
          </div>
        )}
      </div>

      <div className="form-footer-actions">
        <button
          type="submit"
          className="submit-task-primary-btn"
          disabled={saving || !title.trim()}
        >
          {saving ? 'Saving Task...' : '+ Create Task'}
        </button>
      </div>
    </form>
  );
}
