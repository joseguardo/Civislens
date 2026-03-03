import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { getDelayStats } from '../../utils/delayAnalysis';

const STATUS_COLORS = {
  delayed: '#EF4444',
  on_time: '#10B981',
  closed: '#6B7280',
};

export default function DelayAnalysisChart({ projects }) {
  const stats = getDelayStats(projects);

  const pieData = [
    { name: 'Retrasados', value: stats.delayed.length, color: STATUS_COLORS.delayed },
    { name: 'A tiempo', value: stats.onTime.length, color: STATUS_COLORS.on_time },
    { name: 'Cerrados', value: stats.closed.length, color: STATUS_COLORS.closed },
  ].filter(d => d.value > 0);

  const barData = Object.entries(stats.delayBuckets).map(([range, count]) => ({
    range,
    count,
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {/* Delay Status Pie */}
      <div className="bg-white rounded-lg shadow p-4 h-80">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Estado de Proyectos</h3>
        <p className="text-sm text-gray-500 mb-2">
          {stats.delayed.length} retrasados de {stats.delayed.length + stats.onTime.length} activos ({stats.delayRate.toFixed(1)}%)
        </p>
        <ResponsiveContainer width="100%" height="80%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={70}
              paddingAngle={3}
              dataKey="value"
              label={({ name, value }) => `${name}: ${value}`}
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Delay Distribution */}
      <div className="bg-white rounded-lg shadow p-4 h-80">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Distribucion de Retrasos</h3>
        <p className="text-sm text-gray-500 mb-2">
          Retraso medio: {stats.avgDelayMonths} meses ({Math.round(stats.avgDelayDays)} dias)
        </p>
        <ResponsiveContainer width="100%" height="80%">
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="range" tick={{ fontSize: 11 }} />
            <YAxis />
            <Tooltip formatter={(value) => [value, 'Proyectos']} />
            <Bar dataKey="count" fill="#EF4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
