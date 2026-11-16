import { useState, memo } from 'react';
import {
  CheckCircle2,
  Circle,
  RotateCcw,
  Calendar,
  Trash2,
  Edit3,
  X,
  Check
} from 'lucide-react';
import './TaskItem.css';

const TaskItem = memo(function TaskItem({
  task,
  onToggleComplete,
  onEdit,
  onDeleteRequest,
  saving
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description || '');
  const [editPriority, setEditPriority] = useState(task.priority || 'medium');

  const handleSaveEdit = async () => {
    if (!editTitle.trim()) return;
    try {
      await onEdit(task._id, {
        title: editTitle.trim(),
        description: editDescription.trim(),
        priority: editPriority
      });
      setIsEditing(false);
    } catch {
      // handled by useTasks hook
    }
  };

  const handleCancelEdit = () => {
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setEditPriority(task.priority || 'medium');
    setIsEditing(false);
  };

  const isOptimistic = Boolean(task.isOptimistic);
  const isDone = Boolean(task.completed);

  const formattedDate = task.createdAt
    ? new Date(task.createdAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : 'Just now';

  return (
    <div
      className={`task-card glass-panel ${isDone ? 'task-done' : 'task-pending'} ${
        isOptimistic ? 'task-optimistic' : ''
      }`}
    >
      {isEditing ? (
        <div className="task-edit-mode">
          <div className="edit-header">
            <h4>Edit Task</h4>
            <button
              type="button"
              className="edit-close-btn"
              onClick={handleCancelEdit}
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>

          <div className="edit-fields">
            <input
              type="text"
              className="edit-input"
              placeholder="Task title..."
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              disabled={saving}
              autoFocus
            />

            <textarea
              className="edit-textarea"
              placeholder="Description (optional)..."
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              disabled={saving}
              rows="3"
            />

            <div className="edit-controls-bar">
              <div className="edit-priority-selector">
                <label htmlFor={`edit-priority-${task._id}`}>Priority:</label>
                <select
                  id={`edit-priority-${task._id}`}
                  className="edit-select"
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value)}
                  disabled={saving}
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>

              <div className="edit-btns">
                <button
                  type="button"
                  className="btn-cancel-edit"
                  onClick={handleCancelEdit}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-save"
                  onClick={handleSaveEdit}
                  disabled={saving || !editTitle.trim()}
                >
                  <Check size={14} /> Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="task-view-layout">
          {/* Status Quick Check Area */}
          <div className="task-status-toggle-col">
            <button
              type="button"
              className={`status-circle-btn ${isDone ? 'is-done' : 'is-pending'}`}
              onClick={() => !isOptimistic && onToggleComplete(task._id, !isDone)}
              disabled={isOptimistic || saving}
              title={isDone ? 'Mark as Pending' : 'Mark as Done'}
            >
              {isDone ? (
                <CheckCircle2 size={24} className="icon-check" />
              ) : (
                <Circle size={24} className="icon-circle" />
              )}
            </button>
          </div>

          {/* Main Content Area */}
          <div className="task-body-col">
            <div className="task-meta-top">
              {/* Prominent Done vs Pending Status Badge */}
              <span
                className={`task-status-badge ${isDone ? 'badge-done' : 'badge-pending'}`}
              >
                {isDone ? '✓ Done' : '⏳ Pending'}
              </span>

              {/* Priority Badge */}
              <span className={`task-priority-tag priority-${task.priority || 'medium'}`}>
                {task.priority || 'medium'} priority
              </span>

              {isOptimistic && <span className="syncing-indicator">Saving...</span>}
            </div>

            <h3 className={`task-title-text ${isDone ? 'title-done' : ''}`}>
              {task.title}
            </h3>

            {task.description && (
              <p className={`task-desc-text ${isDone ? 'desc-done' : ''}`}>
                {task.description}
              </p>
            )}

            <div className="task-footer-info">
              <span className="task-date-info">
                <Calendar size={13} /> {formattedDate}
              </span>
            </div>
          </div>

          {/* Action Buttons Column */}
          <div className="task-actions-col">
            {/* Direct One-Click Done / Pending Toggle Button */}
            <button
              type="button"
              className={`action-btn-pill ${isDone ? 'btn-reopen' : 'btn-mark-done'}`}
              onClick={() => !isOptimistic && onToggleComplete(task._id, !isDone)}
              disabled={isOptimistic || saving}
            >
              {isDone ? (
                <>
                  <RotateCcw size={13} />
                  <span>Undo</span>
                </>
              ) : (
                <>
                  <Check size={13} />
                  <span>Mark Done</span>
                </>
              )}
            </button>

            <div className="task-secondary-actions">
              <button
                type="button"
                className="icon-action-btn edit-btn"
                onClick={() => setIsEditing(true)}
                disabled={isOptimistic || saving}
                title="Edit Task"
              >
                <Edit3 size={15} />
              </button>

              <button
                type="button"
                className="icon-action-btn delete-btn"
                onClick={() => onDeleteRequest(task)}
                disabled={isOptimistic || saving}
                title="Delete Task"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default TaskItem;
