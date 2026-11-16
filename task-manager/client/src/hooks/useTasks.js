import { useState, useEffect, useCallback } from 'react';
import { getTasks, createTask, updateTask, deleteTask } from '../api/api';

export function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ id: Date.now(), message, type });
  }, []);

  const clearToast = useCallback(() => {
    setToast(null);
  }, []);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTasks();
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load tasks:', err);
      setError(err.message || 'Failed to connect to backend server');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Optimistic create
  const addTask = useCallback(async (taskData) => {
    setSaving(true);
    setActionError(null);

    const tempId = `_tmp-${Date.now()}`;
    const optimisticTask = {
      _id: tempId,
      ...taskData,
      completed: false,
      priority: taskData.priority || 'medium',
      createdAt: new Date().toISOString(),
      isOptimistic: true
    };

    // 1. Optimistic insert
    setTasks((prev) => [optimisticTask, ...prev]);

    try {
      // 2. Server call
      const created = await createTask(taskData);
      // 3. Replace temp task with confirmed server document
      setTasks((prev) =>
        prev.map((t) => (t._id === tempId ? created : t))
      );
      showToast('Task created successfully', 'success');
      return created;
    } catch (err) {
      console.error('Task creation failed:', err);
      // 4. Rollback on failure
      setTasks((prev) => prev.filter((t) => t._id !== tempId));
      const msg = err.details?.length ? err.details.join(', ') : err.message;
      setActionError(msg);
      showToast(`Creation failed: ${msg}`, 'error');
      throw err;
    } finally {
      setSaving(false);
    }
  }, [showToast]);

  const editTask = useCallback(async (id, updates) => {
    setSaving(true);
    setActionError(null);
    try {
      const updated = await updateTask(id, updates);
      setTasks((prev) => prev.map((t) => (t._id === id ? updated : t)));
      showToast('Task updated successfully', 'success');
      return updated;
    } catch (err) {
      console.error('Task update failed:', err);
      const msg = err.details?.length ? err.details.join(', ') : err.message;
      setActionError(msg);
      showToast(`Update failed: ${msg}`, 'error');
      throw err;
    } finally {
      setSaving(false);
    }
  }, [showToast]);

  const removeTask = useCallback(async (id) => {
    setSaving(true);
    setActionError(null);
    try {
      await deleteTask(id);
      setTasks((prev) => prev.filter((t) => t._id !== id));
      showToast('Task deleted successfully', 'success');
    } catch (err) {
      console.error('Task deletion failed:', err);
      const msg = err.details?.length ? err.details.join(', ') : err.message;
      setActionError(msg);
      showToast(`Delete failed: ${msg}`, 'error');
      throw err;
    } finally {
      setSaving(false);
    }
  }, [showToast]);

  return {
    tasks,
    loading,
    error,
    saving,
    actionError,
    toast,
    fetchTasks,
    addTask,
    editTask,
    removeTask,
    clearToast
  };
}
