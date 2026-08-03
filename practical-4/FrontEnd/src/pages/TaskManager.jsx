import React, { useState, useEffect } from 'react';
import './TaskManager.css';

export default function TaskManager() {
    const [tasks, setTasks] = useState([]);
    const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0 });
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(true);

    const API_URL = 'http://localhost:5000/tasks';

    const fetchTasksAndStats = async () => {
        try {
            const [tasksRes, statsRes] = await Promise.all([
                fetch(API_URL),
                fetch(`${API_URL}/stats`)
            ]);
            const tasksData = await tasksRes.json();
            const statsData = await statsRes.json();
            setTasks(tasksData);
            setStats(statsData);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching tasks:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasksAndStats();
    }, []);

    const handleAddTask = async (e) => {
        e.preventDefault();
        if (!title.trim()) return;

        try {
            const res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, description })
            });

            if (res.ok) {
                setTitle('');
                setDescription('');
                fetchTasksAndStats();
            } else {
                const err = await res.json();
                alert(`Error: ${err.error}`);
            }
        } catch (error) {
            console.error('Error adding task:', error);
        }
    };

    const handleToggleComplete = async (id, currentStatus) => {
        try {
            const res = await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ completed: !currentStatus })
            });
            if (res.ok) fetchTasksAndStats();
        } catch (error) {
            console.error('Error updating task:', error);
        }
    };

    const handleDeleteTask = async (id) => {
        if (!window.confirm('Are you sure you want to delete this task?')) return;
        try {
            const res = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) fetchTasksAndStats();
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    return (
        <div className="task-manager-container page-content">
            <div className="glass-panel header-panel">
                <h1 className="tm-title">Task Manager Pro</h1>
                <div className="stats-container">
                    <div className="stat-card">
                        <span className="stat-value">{stats.total}</span>
                        <span className="stat-label">Total</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-value">{stats.completed}</span>
                        <span className="stat-label">Completed</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-value">{stats.pending}</span>
                        <span className="stat-label">Pending</span>
                    </div>
                </div>
            </div>

            <div className="glass-panel add-task-panel">
                <h2>Add New Task</h2>
                <form onSubmit={handleAddTask} className="task-form">
                    <input
                        type="text"
                        className="tm-input"
                        placeholder="Task Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                    <input
                        type="text"
                        className="tm-input"
                        placeholder="Task Description (Optional)"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                    <button type="submit" className="tm-btn-primary">Add Task</button>
                </form>
            </div>

            <div className="glass-panel list-panel">
                <h2>Your Tasks</h2>
                {loading ? (
                    <div className="loading-state">Loading tasks...</div>
                ) : tasks.length === 0 ? (
                    <div className="empty-state">No tasks available. Add one above!</div>
                ) : (
                    <div className="task-list">
                        {tasks.map(task => (
                            <div key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                                <div className="task-info">
                                    <h3 className="task-title-text">{task.title}</h3>
                                    {task.description && <p className="task-desc-text">{task.description}</p>}
                                </div>
                                <div className="task-actions">
                                    <button 
                                        className="icon-btn complete-btn" 
                                        onClick={() => handleToggleComplete(task.id, task.completed)}
                                        title="Toggle Complete"
                                    >
                                        {task.completed ? '↩️' : '✓'}
                                    </button>
                                    <button 
                                        className="icon-btn delete-btn" 
                                        onClick={() => handleDeleteTask(task.id)}
                                        title="Delete Task"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
