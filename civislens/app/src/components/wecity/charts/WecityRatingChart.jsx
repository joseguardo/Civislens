import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const RATING_COLORS = {
  'AAA': '#10B981',
  'AA': '#3B82F6',
  'A': '#F59E0B',
};

export default function WecityRatingChart({ projects }) {
  const ratingData = projects.reduce((acc, p) => {
    if (!p.rating) return acc;
    if (!acc[p.rating]) acc[p.rating] = { count: 0, amount: 0 };
    acc[p.rating].count += 1;
    acc[p.rating].amount += p._financiado || 0;
    return acc;
  }, {});

  const data = ['AAA', 'AA', 'A']
    .filter(r => ratingData[r])
    .map(rating => ({
      rating,
      proyectos: ratingData[rating].count,
      financiado: ratingData[rating].amount / 1000000,
    }));

  return (
    <div className="bg-white rounded-lg shadow p-4 h-80">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Por Rating</h3>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="rating" />
          <YAxis />
          <Tooltip
            formatter={(value, name) => [
              name === 'financiado' ? `€${value.toFixed(2)}M` : value,
              name === 'financiado' ? 'Financiado' : 'Proyectos',
            ]}
          />
          <Bar dataKey="proyectos" name="proyectos" radius={[4, 4, 0, 0]}>
            {data.map((entry) => (
              <Cell key={entry.rating} fill={RATING_COLORS[entry.rating] || '#8884d8'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
