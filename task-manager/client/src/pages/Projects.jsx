import { useState, useMemo, useCallback, lazy, Suspense } from 'react';
import {
  Search,
  X,
  CheckCircle2,
  Clock,
  ListTodo,
  ArrowUpDown,
  Sparkles,
  CheckCheck,
  RefreshCw,
  BarChart3
} from 'lucide-react';
import { useTasks } from '../hooks/useTasks';
import { useAuth } from '../context/AuthContext';
import TaskForm from '../components/TaskForm';
import TaskList from '../components/TaskList';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';
import Toast from '../components/Toast';
import './Projects.css';

// Lazy-loaded heavy chart component (separate chunk)
const TaskStatsChart = lazy(() => import('../components/TaskStatsChart'));

export default function Projects() {
  const {
    tasks,
    loading,
    error,
    saving,
    toast,
    fetchTasks,
    addTask,
    editTask,
    removeTask,
    clearToast
  } = useTasks();

  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusTab, setStatusTab] = useState('all'); // 'all' | 'pending' | 'done'
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'priority' | 'title'
  const [showStats, setShowStats] = useState(false); // Toggle for lazy Recharts bundle

  // Dynamic statistics
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => Boolean(t.completed)).length;
    const pending = total - completed;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, pending, percent };
  }, [tasks]);

  // Filtering & Sorting
  const filteredTasks = useMemo(() => {
    const priorityWeight = { high: 3, medium: 2, low: 1 };

    return tasks
      .filter((task) => {
        // Search filter
        const matchesSearch =
          task.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.description?.toLowerCase().includes(searchQuery.toLowerCase());

        // Priority filter
        const matchesPriority =
          priorityFilter === 'all' || task.priority === priorityFilter;

        // Status tab filter
        const matchesStatus =
          statusTab === 'all' ||
          (statusTab === 'done' && Boolean(task.completed)) ||
          (statusTab === 'pending' && !task.completed);

        return matchesSearch && matchesPriority && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        }
        if (sortBy === 'oldest') {
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        }
        if (sortBy === 'priority') {
          return (
            (priorityWeight[b.priority] || 2) -
            (priorityWeight[a.priority] || 2)
          );
        }
        if (sortBy === 'title') {
          return (a.title || '').localeCompare(b.title || '');
        }
        return 0;
      });
  }, [tasks, searchQuery, priorityFilter, statusTab, sortBy]);

  // Bulk action: Mark all visible pending tasks as done
  const handleMarkAllVisibleDone = useCallback(async () => {
    const pendingList = filteredTasks.filter((t) => !t.completed);
    for (const t of pendingList) {
      await editTask(t._id, { completed: true });
    }
  }, [filteredTasks, editTask]);

  const resetFilters = useCallback(() => {
    setSearchQuery('');
    setPriorityFilter('all');
    setStatusTab('all');
    setSortBy('newest');
  }, []);

  const handleToggleComplete = useCallback(
    (id, completed) => {
      editTask(id, { completed });
    },
    [editTask]
  );

  const handleEdit = useCallback(
    (id, updates) => {
      return editTask(id, updates);
    },
    [editTask]
  );

  const handleDelete = useCallback(
    (id) => {
      return removeTask(id);
    },
    [removeTask]
  );

  return (
    <main className="page-content projects-page" id="projects-page">
      {/* Top Banner / Dashboard Header */}
      <div className="taskmanager-dashboard-card glass-panel">
        <div className="dashboard-header-line">
          <div>
            <div className="title-row">
              <h1 className="dashboard-title">Task Manager</h1>
              <span className="live-status-pill">
                <span className="pulse-dot"></span> Live Sync
              </span>
            </div>
            <p className="dashboard-subtitle">
              Manage your tasks, track completion, and stay organized.
            </p>
          </div>

          {user?.email && (
            <div className="user-profile-badge">
              <span className="user-role-tag">Account</span>
              <span className="user-email-display">{user.email}</span>
            </div>
          )}
        </div>

        {/* 3 Metric Cards */}
        <div className="metrics-grid">
          <div
            className={`metric-card ${statusTab === 'all' ? 'metric-card--active' : ''}`}
            onClick={() => setStatusTab('all')}
            role="button"
            tabIndex={0}
            title="Click to show all tasks"
          >
            <div className="metric-icon metric-icon--total">
              <ListTodo size={22} />
            </div>
            <div className="metric-data">
              <span className="metric-value">{stats.total}</span>
              <span className="metric-label">Total Tasks</span>
            </div>
          </div>

          <div
            className={`metric-card metric-card--done ${
              statusTab === 'done' ? 'metric-card--active' : ''
            }`}
            onClick={() => setStatusTab('done')}
            role="button"
            tabIndex={0}
            title="Click to show Done tasks"
          >
            <div className="metric-icon metric-icon--done">
              <CheckCircle2 size={22} />
            </div>
            <div className="metric-data">
              <span className="metric-value">{stats.completed}</span>
              <span className="metric-label">Done (Completed)</span>
            </div>
          </div>

          <div
            className={`metric-card metric-card--pending ${
              statusTab === 'pending' ? 'metric-card--active' : ''
            }`}
            onClick={() => setStatusTab('pending')}
            role="button"
            tabIndex={0}
            title="Click to show Pending tasks"
          >
            <div className="metric-icon metric-icon--pending">
              <Clock size={22} />
            </div>
            <div className="metric-data">
              <span className="metric-value">{stats.pending}</span>
              <span className="metric-label">Pending</span>
            </div>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="completion-progress-panel">
          <div className="progress-labels">
            <span className="progress-title">
              <Sparkles size={14} /> Overall Completion
            </span>
            <span className="progress-percent-text">
              {stats.completed} of {stats.total} Done ({stats.percent}%)
            </span>
          </div>
          <div className="progress-bar-track">
            <div
              className="progress-bar-fill"
              style={{ width: `${stats.percent}%` }}
              aria-valuenow={stats.percent}
              aria-valuemin="0"
              aria-valuemax="100"
            ></div>
          </div>
        </div>

        {/* Toggle Lazy Visual Stats (Recharts) */}
        <div className="stats-toggle-row">
          <button
            type="button"
            className={`btn-toggle-stats ${showStats ? 'active' : ''}`}
            onClick={() => setShowStats((prev) => !prev)}
            aria-expanded={showStats}
          >
            <BarChart3 size={15} />
            <span>{showStats ? 'Hide Visual Analytics' : 'Show Visual Analytics (Recharts)'}</span>
          </button>
        </div>
      </div>

      {/* Lazy Loaded Task Analytics Chart */}
      {showStats && (
        <Suspense
          fallback={
            <div className="stats-loading-fallback glass-panel">
              <Spinner message="Loading chart analytics bundle on demand..." />
            </div>
          }
        >
          <TaskStatsChart tasks={tasks} />
        </Suspense>
      )}

      {/* Task Creation Form */}
      <TaskForm onAddTask={addTask} saving={saving} />

      {/* Control Bar: Tabs + Search + Filters */}
      <div className="controls-panel glass-panel">
        {/* Status Filter Tabs: All, Pending, Done */}
        <div className="status-tabs-row" role="tablist">
          <button
            type="button"
            className={`status-tab-btn ${statusTab === 'all' ? 'active' : ''}`}
            onClick={() => setStatusTab('all')}
            role="tab"
            aria-selected={statusTab === 'all'}
          >
            All Tasks
            <span className="tab-count-badge">{stats.total}</span>
          </button>

          <button
            type="button"
            className={`status-tab-btn tab-pending ${
              statusTab === 'pending' ? 'active' : ''
            }`}
            onClick={() => setStatusTab('pending')}
            role="tab"
            aria-selected={statusTab === 'pending'}
          >
            Pending
            <span className="tab-count-badge">{stats.pending}</span>
          </button>

          <button
            type="button"
            className={`status-tab-btn tab-done ${
              statusTab === 'done' ? 'active' : ''
            }`}
            onClick={() => setStatusTab('done')}
            role="tab"
            aria-selected={statusTab === 'done'}
          >
            ✓ Done
            <span className="tab-count-badge">{stats.completed}</span>
          </button>
        </div>

        {/* Search & Select Controls */}
        <div className="filters-inputs-row">
          <div className="search-box-wrapper">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              className="search-input-field"
              placeholder="Search tasks by title or details..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => setSearchQuery('')}
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="selects-group">
            <select
              className="control-select"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              title="Filter by priority"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>

            <div className="sort-wrapper">
              <ArrowUpDown size={14} className="sort-icon" />
              <select
                className="control-select sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                title="Sort tasks"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="priority">Priority (High → Low)</option>
                <option value="title">Title (A → Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Quick Bulk Action Banner when viewing Pending with items */}
        {statusTab === 'pending' && stats.pending > 0 && (
          <div className="bulk-actions-bar">
            <span>Showing {stats.pending} pending tasks</span>
            <button
              type="button"
              className="bulk-action-btn"
              onClick={handleMarkAllVisibleDone}
              disabled={saving}
            >
              <CheckCheck size={14} /> Mark All Visible Done
            </button>
          </div>
        )}
      </div>

      {/* Loading & Error States */}
      {loading && <Spinner message="Connecting & loading tasks..." />}

      {error && !loading && (
        <ErrorMessage message={error} onRetry={fetchTasks} />
      )}

      {/* Main Task List */}
      {!loading && !error && (
        <>
          {filteredTasks.length === 0 ? (
            <div className="empty-state-panel glass-panel">
              {statusTab === 'done' && stats.completed === 0 ? (
                <div className="empty-state-content">
                  <div className="empty-icon">🎯</div>
                  <h3>No Completed Tasks Yet</h3>
                  <p>
                    When you finish a task, click <strong>"Mark Done"</strong> on
                    its card to celebrate your progress!
                  </p>
                  <button
                    type="button"
                    className="btn-switch-tab"
                    onClick={() => setStatusTab('pending')}
                  >
                    View Pending Tasks
                  </button>
                </div>
              ) : statusTab === 'pending' && stats.pending === 0 && stats.total > 0 ? (
                <div className="empty-state-content">
                  <div className="empty-icon">🎉</div>
                  <h3>All Caught Up!</h3>
                  <p>Great job! Every task on your list has been completed.</p>
                  <button
                    type="button"
                    className="btn-switch-tab"
                    onClick={() => setStatusTab('all')}
                  >
                    View All Tasks
                  </button>
                </div>
              ) : searchQuery || priorityFilter !== 'all' ? (
                <div className="empty-state-content">
                  <div className="empty-icon">🔍</div>
                  <h3>No Matching Tasks</h3>
                  <p>No tasks match your current search or priority filter.</p>
                  <button
                    type="button"
                    className="btn-switch-tab"
                    onClick={resetFilters}
                  >
                    <RefreshCw size={13} /> Reset Filters
                  </button>
                </div>
              ) : (
                <div className="empty-state-content">
                  <div className="empty-icon">📝</div>
                  <h3>Your Task List is Empty</h3>
                  <p>Use the form above to create your first task!</p>
                </div>
              )}
            </div>
          ) : (
            <TaskList
              tasks={filteredTasks}
              onToggleComplete={handleToggleComplete}
              onEdit={handleEdit}
              onDelete={handleDelete}
              saving={saving}
            />
          )}
        </>
      )}

      {/* Notifications Toast */}
      <Toast toast={toast} onClose={clearToast} />
    </main>
  );
}
