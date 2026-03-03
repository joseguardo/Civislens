import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function WecityReturnDistribution({ projects }) {
  const buckets = {
    '0-5%': 0,
    '5-8%': 0,
    '8-10%': 0,
    '10-12%': 0,
    '12-15%': 0,
    '15%+': 0,
  };

  projects.forEach(p => {
    const val = p._rentabilidad_anual;
    if (val == null) return;

    if (val < 5) buckets['0-5%']++;
    else if (val < 8) buckets['5-8%']++;
    else if (val < 10) buckets['8-10%']++;
    else if (val < 12) buckets['10-12%']++;
    else if (val < 15) buckets['12-15%']++;
    else buckets['15%+']++;
  });

  const data = Object.entries(buckets).map(([range, count]) => ({ range, count }));

  return (
    <div className="bg-white rounded-lg shadow p-4 h-80">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribucion de Rentabilidad Anual</h3>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="range" />
          <YAxis />
          <Tooltip formatter={(value) => [value, 'Proyectos']} />
          <Bar dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
