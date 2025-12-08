import { useAppStore } from '@/stores/appStore';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const statusColors = {
  backlog: '#64748b',
  todo: '#94a3b8',
  'in-progress': '#3b82f6',
  review: '#f59e0b',
  done: '#10b981',
};

const statusLabels = {
  backlog: 'Backlog',
  todo: 'To Do',
  'in-progress': 'In Progress',
  review: 'In Review',
  done: 'Done',
};

export function TaskDistribution() {
  const tasks = useAppStore((state) => state.tasks);

  const data = Object.entries(statusColors).map(([status, color]) => ({
    name: statusLabels[status as keyof typeof statusLabels],
    value: tasks.filter((t) => t.status === status).length,
    color,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.6 }}
      className="bg-card rounded-xl border border-border p-6"
    >
      <h2 className="text-lg font-semibold mb-6">Task Distribution</h2>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '14px',
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => (
                <span className="text-sm text-muted-foreground">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-2xl font-bold">{tasks.length}</p>
          <p className="text-xs text-muted-foreground">Total Tasks</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-success">
            {tasks.filter((t) => t.status === 'done').length}
          </p>
          <p className="text-xs text-muted-foreground">Completed</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-info">
            {tasks.filter((t) => t.status === 'in-progress').length}
          </p>
          <p className="text-xs text-muted-foreground">In Progress</p>
        </div>
      </div>
    </motion.div>
  );
}
