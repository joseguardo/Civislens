import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const TYPE_LABELS = {
  'Residencial': 'Residencial',
  'COMMERCIAL_OFFICE': 'Comercial/Oficinas',
  'INDUSTRIAL_UNIT': 'Industrial',
};

export default function TypeBarChart({ projects }) {
  const typeFunding = projects.reduce((acc, p) => {
    const type = p.type || 'Otro';
    acc[type] = (acc[type] || 0) + (p.funded_eur || 0);
    return acc;
  }, {});

  const data = Object.entries(typeFunding)
    .map(([type, amount]) => ({
      type: TYPE_LABELS[type] || type,
      amount: amount / 1000000,
    }))
    .sort((a, b) => b.amount - a.amount);

  return (
    <div className="bg-white rounded-lg shadow p-4 h-80">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Financiacion por Tipo (M€)</h3>
      <ResponsiveContainer width="100%" height="85%">
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" />
          <YAxis dataKey="type" type="category" width={120} />
          <Tooltip
            formatter={(value) => [`€${value.toFixed(2)}M`, 'Financiado']}
          />
          <Bar dataKey="amount" fill="#3B82F6" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
