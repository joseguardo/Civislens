import { Wallet, Clock, TrendingUp, Building, CheckCircle, Play } from 'lucide-react';

export default function WecityKPICards({ projects }) {
  const totalFunded = projects.reduce((sum, p) => sum + (p._financiado || 0), 0);
  const enCurso = projects.filter(p => p.estado === 'En curso').length;
  const terminadas = projects.filter(p => p.estado === 'Terminadas').length;

  const withReturn = projects.filter(p => p._rentabilidad_anual != null);
  const avgReturn = withReturn.length > 0
    ? withReturn.reduce((sum, p) => sum + p._rentabilidad_anual, 0) / withReturn.length
    : 0;

  const withTerm = projects.filter(p => p._plazo != null);
  const avgTerm = withTerm.length > 0
    ? withTerm.reduce((sum, p) => sum + p._plazo, 0) / withTerm.length
    : 0;

  const ratingCounts = projects.reduce((acc, p) => {
    if (p.rating) acc[p.rating] = (acc[p.rating] || 0) + 1;
    return acc;
  }, {});

  const formatCurrency = (value) => {
    if (value >= 1000000) return `€${(value / 1000000).toFixed(1)}M`;
    return `€${(value / 1000).toFixed(0)}K`;
  };

  const cards = [
    {
      title: 'Total Financiado',
      value: formatCurrency(totalFunded),
      icon: Wallet,
      color: 'bg-blue-500',
    },
    {
      title: 'En Curso',
      value: enCurso,
      icon: Play,
      color: 'bg-amber-500',
    },
    {
      title: 'Terminadas',
      value: terminadas,
      icon: CheckCircle,
      color: 'bg-green-500',
    },
    {
      title: 'Rentabilidad Media',
      value: `${avgReturn.toFixed(1)}%`,
      subtitle: 'anual',
      icon: TrendingUp,
      color: 'bg-purple-500',
    },
    {
      title: 'Plazo Medio',
      value: `${avgTerm.toFixed(0)}m`,
      icon: Clock,
      color: 'bg-orange-500',
    },
    {
      title: 'Ratings',
      value: `${ratingCounts['AAA'] || 0}/${ratingCounts['AA'] || 0}/${ratingCounts['A'] || 0}`,
      subtitle: 'AAA/AA/A',
      icon: Building,
      color: 'bg-gray-500',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
      {cards.map((card) => (
        <div
          key={card.title}
          className="bg-white rounded-lg shadow p-4 flex items-center gap-3"
        >
          <div className={`${card.color} p-2 rounded-lg`}>
            <card.icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs text-gray-500">{card.title}</p>
            <p className="text-xl font-bold text-gray-900">{card.value}</p>
            {card.subtitle && (
              <p className="text-xs text-gray-400">{card.subtitle}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
