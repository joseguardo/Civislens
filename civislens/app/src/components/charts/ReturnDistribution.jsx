import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ReturnDistribution({ projects }) {
  const buckets = {
    '0-5%': 0,
    '5-10%': 0,
    '10-15%': 0,
    '15-20%': 0,
    '20-25%': 0,
    '25%+': 0,
  };

  projects.forEach(p => {
    if (!p.return_pct) return;
    const val = parseFloat(p.return_pct.replace('%', '').replace(',', '.'));
    if (isNaN(val)) return;

    if (val < 5) buckets['0-5%']++;
    else if (val < 10) buckets['5-10%']++;
    else if (val < 15) buckets['10-15%']++;
    else if (val < 20) buckets['15-20%']++;
    else if (val < 25) buckets['20-25%']++;
    else buckets['25%+']++;
  });

  const data = Object.entries(buckets).map(([range, count]) => ({
    range,
    count,
  }));

  return (
    <div className="bg-white rounded-lg shadow p-4 h-80">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribucion de Rentabilidad</h3>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="range" />
          <YAxis />
          <Tooltip formatter={(value) => [value, 'Proyectos']} />
          <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
