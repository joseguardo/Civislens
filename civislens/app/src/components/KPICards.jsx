import { TrendingUp, Users, Wallet, Calendar, AlertTriangle, Clock } from 'lucide-react';
import { getDelayStats } from '../utils/delayAnalysis';

export default function KPICards({ projects }) {
  const totalFunded = projects.reduce((sum, p) => sum + (p.funded_eur || 0), 0);
  const totalInvestors = projects.reduce((sum, p) => sum + (p.investors || 0), 0);

  const returnsWithValues = projects.filter(p => p.return_pct);
  const avgReturn = returnsWithValues.length > 0
    ? returnsWithValues.reduce((sum, p) => {
        const val = parseFloat(p.return_pct.replace('%', '').replace(',', '.'));
        return sum + (isNaN(val) ? 0 : val);
      }, 0) / returnsWithValues.length
    : 0;

  const delayStats = getDelayStats(projects);

  const formatCurrency = (value) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    return `${(value / 1000).toFixed(0)}K`;
  };

  const cards = [
    {
      title: 'Total Financiado',
      value: `€${formatCurrency(totalFunded)}`,
      icon: Wallet,
      color: 'bg-blue-500',
    },
    {
      title: 'Total Inversores',
      value: totalInvestors.toLocaleString(),
      icon: Users,
      color: 'bg-green-500',
    },
    {
      title: 'Proyectos Retrasados',
      value: delayStats.delayed.length,
      subtitle: `${delayStats.delayRate.toFixed(0)}% de activos`,
      icon: AlertTriangle,
      color: 'bg-red-500',
    },
    {
      title: 'Retraso Medio',
      value: `${delayStats.avgDelayMonths}m`,
      subtitle: `${Math.round(delayStats.avgDelayDays)} dias`,
      icon: Clock,
      color: 'bg-orange-500',
    },
    {
      title: 'Rentabilidad Media',
      value: `${avgReturn.toFixed(1)}%`,
      icon: TrendingUp,
      color: 'bg-purple-500',
    },
    {
      title: 'Proyectos',
      value: projects.length,
      icon: Calendar,
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
