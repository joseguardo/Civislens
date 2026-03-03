import { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, ChevronRight, MapPin, AlertTriangle, CheckCircle } from 'lucide-react';
import { analyzeProjectDelay } from '../utils/delayAnalysis';

const STATUS_COLORS = {
  FUNDED: 'bg-blue-100 text-blue-800',
  FORMALIZED: 'bg-green-100 text-green-800',
  CLOSED: 'bg-gray-100 text-gray-800',
};

export default function ProjectTable({ projects }) {
  const [sortConfig, setSortConfig] = useState({ key: 'daysDelayed', direction: 'desc' });
  const [expandedId, setExpandedId] = useState(null);

  const projectsWithDelay = useMemo(() => {
    return projects.map(p => ({
      ...p,
      _delay: analyzeProjectDelay(p),
    }));
  }, [projects]);

  const sortedProjects = [...projectsWithDelay].sort((a, b) => {
    let aVal, bVal;

    if (sortConfig.key === 'daysDelayed') {
      aVal = a._delay.daysDelayed || (a._delay.daysRemaining ? -a._delay.daysRemaining : -9999);
      bVal = b._delay.daysDelayed || (b._delay.daysRemaining ? -b._delay.daysRemaining : -9999);
    } else {
      aVal = a[sortConfig.key];
      bVal = b[sortConfig.key];
    }

    if (sortConfig.key === 'funded_eur' || sortConfig.key === 'investors') {
      aVal = aVal || 0;
      bVal = bVal || 0;
    }

    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return null;
    return sortConfig.direction === 'asc' ? (
      <ChevronUp className="w-4 h-4 inline" />
    ) : (
      <ChevronDown className="w-4 h-4 inline" />
    );
  };

  const formatCurrency = (value) => {
    if (!value) return '-';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatDelay = (delay) => {
    if (delay.status === 'closed') return { text: 'Cerrado', color: 'text-gray-500', icon: null };
    if (delay.status === 'delayed') {
      const months = Math.floor(delay.daysDelayed / 30);
      return {
        text: `${months}m retraso`,
        color: 'text-red-600',
        icon: <AlertTriangle className="w-4 h-4 text-red-500" />,
      };
    }
    if (delay.status === 'on_time') {
      const months = Math.floor(delay.daysRemaining / 30);
      return {
        text: `${months}m restantes`,
        color: 'text-green-600',
        icon: <CheckCircle className="w-4 h-4 text-green-500" />,
      };
    }
    return { text: '-', color: 'text-gray-400', icon: null };
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-8"></th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('project')}
              >
                Proyecto <SortIcon columnKey="project" />
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('daysDelayed')}
              >
                Plazo <SortIcon columnKey="daysDelayed" />
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('status')}
              >
                Estado <SortIcon columnKey="status" />
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('funded_eur')}
              >
                Financiado <SortIcon columnKey="funded_eur" />
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('investors')}
              >
                Inversores <SortIcon columnKey="investors" />
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('return_pct')}
              >
                Rentabilidad <SortIcon columnKey="return_pct" />
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedProjects.map((project) => {
              const delayInfo = formatDelay(project._delay);
              return (
                <>
                  <tr
                    key={project.id}
                    className={`hover:bg-gray-50 cursor-pointer ${project._delay.status === 'delayed' ? 'bg-red-50' : ''}`}
                    onClick={() => setExpandedId(expandedId === project.id ? null : project.id)}
                  >
                    <td className="px-4 py-4">
                      <ChevronRight
                        className={`w-4 h-4 text-gray-400 transition-transform ${
                          expandedId === project.id ? 'rotate-90' : ''
                        }`}
                      />
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm font-medium text-gray-900">{project.project}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {project.location}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        {delayInfo.icon}
                        <span className={`text-sm font-medium ${delayInfo.color}`}>
                          {delayInfo.text}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400">
                        {project.investment_term && `Plazo: ${project.investment_term}m`}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[project.status] || 'bg-gray-100'}`}>
                        {project.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {formatCurrency(project.funded_eur)}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {project.investors?.toLocaleString() || '-'}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {project.return_pct || '-'}
                    </td>
                  </tr>
                  {expandedId === project.id && (
                    <tr key={`${project.id}-details`}>
                      <td colSpan={7} className="px-4 py-4 bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Detalles</h4>
                            <dl className="text-sm space-y-1">
                              <div className="flex justify-between">
                                <dt className="text-gray-500">Tipo:</dt>
                                <dd className="text-gray-900">{project.type || '-'}</dd>
                              </div>
                              <div className="flex justify-between">
                                <dt className="text-gray-500">Modelo:</dt>
                                <dd className="text-gray-900">{project.business_model || '-'}</dd>
                              </div>
                              <div className="flex justify-between">
                                <dt className="text-gray-500">Tipo Inversion:</dt>
                                <dd className="text-gray-900">{project.investment_type || '-'}</dd>
                              </div>
                              <div className="flex justify-between">
                                <dt className="text-gray-500">Direccion:</dt>
                                <dd className="text-gray-900">{project.address || '-'}</dd>
                              </div>
                            </dl>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Fechas y Plazos</h4>
                            <dl className="text-sm space-y-1">
                              <div className="flex justify-between">
                                <dt className="text-gray-500">Inicio:</dt>
                                <dd className="text-gray-900">{project.fund_start_date || '-'}</dd>
                              </div>
                              <div className="flex justify-between">
                                <dt className="text-gray-500">Plazo:</dt>
                                <dd className="text-gray-900">{project.investment_term ? `${project.investment_term} meses` : '-'}</dd>
                              </div>
                              <div className="flex justify-between">
                                <dt className="text-gray-500">Fin esperado:</dt>
                                <dd className={`font-medium ${project._delay.status === 'delayed' ? 'text-red-600' : 'text-gray-900'}`}>
                                  {project._delay.expectedEnd?.toLocaleDateString('es-ES') || '-'}
                                </dd>
                              </div>
                              {project._delay.daysDelayed && (
                                <div className="flex justify-between">
                                  <dt className="text-gray-500">Dias retraso:</dt>
                                  <dd className="text-red-600 font-bold">{project._delay.daysDelayed}</dd>
                                </div>
                              )}
                            </dl>
                          </div>
                          {project.economic_summary?.length > 0 && (
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">Resumen Economico</h4>
                              <dl className="text-sm space-y-1">
                                {project.economic_summary.map((item, idx) => (
                                  <div key={idx} className="flex justify-between">
                                    <dt className="text-gray-500">{item.label}:</dt>
                                    <dd className="text-gray-900">{item.value}</dd>
                                  </div>
                                ))}
                              </dl>
                            </div>
                          )}
                          {project.timeline?.length > 0 && (
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">Timeline</h4>
                              <ul className="text-sm space-y-1">
                                {project.timeline.map((item, idx) => (
                                  <li key={idx} className="flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${item.completado ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                    <span className="text-gray-500">{item.fecha}:</span>
                                    <span className="text-gray-900">{item.hito}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
      {sortedProjects.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          No se encontraron proyectos con los filtros seleccionados.
        </div>
      )}
    </div>
  );
}
