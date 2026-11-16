import { useState, useCallback, memo } from 'react';
import TaskItem from './TaskItem';
import ConfirmDialog from './ConfirmDialog';
import './TaskList.css';

const TaskList = memo(function TaskList({
  tasks,
  onToggleComplete,
  onEdit,
  onDelete,
  saving
}) {
  const [taskToDelete, setTaskToDelete] = useState(null);

  const handleDeleteRequest = useCallback((task) => {
    setTaskToDelete(task);
  }, []);

  const handleConfirmDelete = async () => {
    if (taskToDelete) {
      await onDelete(taskToDelete._id);
      setTaskToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setTaskToDelete(null);
  };

  if (!tasks || tasks.length === 0) {
    return (
      <div className="task-empty-state glass-panel">
        <p className="empty-text">No tasks found. Create one above to get started!</p>
      </div>
    );
  }

  return (
    <div className="task-list-wrapper">
      <div className="task-list-items">
        {tasks.map((task) => (
          <TaskItem
            key={task._id}
            task={task}
            onToggleComplete={onToggleComplete}
            onEdit={onEdit}
            onDeleteRequest={handleDeleteRequest}
            saving={saving}
          />
        ))}
      </div>

      <ConfirmDialog
        isOpen={Boolean(taskToDelete)}
        title="Delete Task"
        message={`Are you sure you want to delete "${taskToDelete?.title}"? This cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  );
});

export default TaskList;
