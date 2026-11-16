import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import './TaskStatsChart.css';

const STATUS_COLORS = ['#10b981', '#f59e0b']; // Completed (emerald), Pending (amber)
const PRIORITY_COLORS = {
  high: '#ef4444',
  medium: '#3b82f6',
  low: '#10b981'
};

export default function TaskStatsChart({ tasks = [] }) {
  const total = tasks.length;
  const completed = tasks.filter((t) => Boolean(t.completed)).length;
  const pending = total - completed;

  const statusData = [
    { name: 'Completed', value: completed },
    { name: 'Pending', value: pending }
  ];

  const highPriority = tasks.filter((t) => t.priority === 'high').length;
  const mediumPriority = tasks.filter((t) => t.priority === 'medium' || !t.priority).length;
  const lowPriority = tasks.filter((t) => t.priority === 'low').length;

  const priorityData = [
    { priority: 'High', count: highPriority, fill: PRIORITY_COLORS.high },
    { priority: 'Medium', count: mediumPriority, fill: PRIORITY_COLORS.medium },
    { priority: 'Low', count: lowPriority, fill: PRIORITY_COLORS.low }
  ];

  if (total === 0) {
    return (
      <div className="task-stats-empty">
        <p>No tasks available to generate visual statistics yet.</p>
      </div>
    );
  }

  return (
    <div className="task-stats-container">
      <div className="task-stats-header">
        <h4>Visual Task Analytics (Recharts Lazy Chunk)</h4>
        <span className="task-stats-summary">
          {completed} of {total} tasks completed ({total > 0 ? Math.round((completed / total) * 100) : 0}%)
        </span>
      </div>

      <div className="task-stats-grid">
        {/* Completion Status Pie Chart */}
        <div className="task-stats-card">
          <h5>Completion Breakdown</h5>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Breakdown Bar Chart */}
        <div className="task-stats-card">
          <h5>Tasks by Priority</h5>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={priorityData} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
                <XAxis dataKey="priority" stroke="#64748b" />
                <YAxis allowDecimals={false} stroke="#64748b" />
                <Tooltip />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {priorityData.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
