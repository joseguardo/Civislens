import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function WecityCityChart({ projects }) {
  const cityCounts = projects.reduce((acc, p) => {
    const city = p.ciudad || 'Otro';
    acc[city] = (acc[city] || 0) + 1;
    return acc;
  }, {});

  const data = Object.entries(cityCounts)
    .map(([city, count]) => ({ city, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return (
    <div className="bg-white rounded-lg shadow p-4 h-80">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Ciudades</h3>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="city" type="category" width={100} tick={{ fontSize: 12 }} />
          <Tooltip formatter={(value) => [value, 'Proyectos']} />
          <Bar dataKey="count" fill="#F59E0B" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
