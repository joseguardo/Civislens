import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function TimelineChart({ projects }) {
  const projectsByMonth = projects.reduce((acc, p) => {
    if (!p.funded_date) return acc;
    const month = p.funded_date.substring(0, 7);
    if (!acc[month]) {
      acc[month] = { count: 0, amount: 0 };
    }
    acc[month].count += 1;
    acc[month].amount += p.funded_eur || 0;
    return acc;
  }, {});

  const data = Object.entries(projectsByMonth)
    .map(([month, stats]) => ({
      month,
      proyectos: stats.count,
      financiado: stats.amount / 1000000,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));

  return (
    <div className="bg-white rounded-lg shadow p-4 h-80">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Proyectos por Mes</h3>
      <ResponsiveContainer width="100%" height="85%">
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis />
          <Tooltip
            formatter={(value, name) => [
              name === 'financiado' ? `€${value.toFixed(2)}M` : value,
              name === 'financiado' ? 'Financiado' : 'Proyectos'
            ]}
          />
          <Area
            type="monotone"
            dataKey="proyectos"
            stackId="1"
            stroke="#3B82F6"
            fill="#93C5FD"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
