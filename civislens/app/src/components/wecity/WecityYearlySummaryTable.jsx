import { useMemo } from 'react';

const STATUS_COLORS = {
  'En curso': 'bg-amber-100 text-amber-800',
  'Terminadas': 'bg-green-100 text-green-800',
};

const TYPE_COLORS = {
  'Préstamo': 'bg-indigo-50 text-indigo-700',
  'Plusvalía': 'bg-amber-50 text-amber-700',
};

export default function WecityYearlySummaryTable({ projects }) {
  const { rows, totals, allStatuses, allTypes } = useMemo(() => {
    const byYear = {};

    projects.forEach(p => {
      const year = p._year;
      if (!year) return;

      if (!byYear[year]) byYear[year] = { count: 0, funded: 0, statuses: {}, types: {} };
      byYear[year].count += 1;
      byYear[year].funded += p._financiado || 0;

      const status = p.estado || 'N/A';
      byYear[year].statuses[status] = (byYear[year].statuses[status] || 0) + 1;

      const type = p.tipo_inversion || 'N/A';
      byYear[year].types[type] = (byYear[year].types[type] || 0) + 1;
    });

    const allStatuses = [...new Set(projects.map(p => p.estado).filter(Boolean))].sort();
    const allTypes = [...new Set(projects.map(p => p.tipo_inversion).filter(Boolean))].sort();

    const rows = Object.entries(byYear)
      .map(([year, data]) => ({ year, ...data }))
      .sort((a, b) => String(b.year).localeCompare(String(a.year)));

    const totals = {
      count: rows.reduce((s, r) => s + r.count, 0),
      funded: rows.reduce((s, r) => s + r.funded, 0),
      statuses: {},
      types: {},
    };
    allStatuses.forEach(st => {
      totals.statuses[st] = rows.reduce((s, r) => s + (r.statuses[st] || 0), 0);
    });
    allTypes.forEach(t => {
      totals.types[t] = rows.reduce((s, r) => s + (r.types[t] || 0), 0);
    });

    return { rows, totals, allStatuses, allTypes };
  }, [projects]);

  const formatCurrency = (value) => {
    if (value >= 1000000) return `€${(value / 1000000).toFixed(1)}M`;
    return `€${(value / 1000).toFixed(0)}K`;
  };

  if (rows.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500 mb-6">
        No hay datos para mostrar con los filtros seleccionados.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Año</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Proyectos</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Financiado</th>
              {allStatuses.map(st => (
                <th key={st} className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{st}</th>
              ))}
              {allTypes.map(t => (
                <th key={t} className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t}</th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rows.map(row => (
              <tr key={row.year} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-semibold text-gray-900">{row.year}</td>
                <td className="px-4 py-3 text-sm text-right text-gray-900 font-medium">{row.count}</td>
                <td className="px-4 py-3 text-sm text-right text-gray-900">{formatCurrency(row.funded)}</td>
                {allStatuses.map(st => (
                  <td key={st} className="px-4 py-3 text-right">
                    {row.statuses[st] ? (
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${STATUS_COLORS[st] || 'bg-gray-100'}`}>
                        {row.statuses[st]}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-300">-</span>
                    )}
                  </td>
                ))}
                {allTypes.map(t => (
                  <td key={t} className="px-4 py-3 text-right">
                    {row.types[t] ? (
                      <span className={`px-2 py-0.5 text-xs font-medium rounded ${TYPE_COLORS[t] || 'bg-gray-50'}`}>
                        {row.types[t]}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-300">-</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50">
            <tr className="font-bold">
              <td className="px-4 py-3 text-sm text-gray-900">Total</td>
              <td className="px-4 py-3 text-sm text-right text-gray-900">{totals.count}</td>
              <td className="px-4 py-3 text-sm text-right text-gray-900">{formatCurrency(totals.funded)}</td>
              {allStatuses.map(st => (
                <td key={st} className="px-4 py-3 text-sm text-right text-gray-900">{totals.statuses[st] || 0}</td>
              ))}
              {allTypes.map(t => (
                <td key={t} className="px-4 py-3 text-sm text-right text-gray-900">{totals.types[t] || 0}</td>
              ))}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
