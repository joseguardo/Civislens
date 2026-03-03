import { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, ChevronRight, MapPin, ExternalLink } from 'lucide-react';

const STATUS_COLORS = {
  'En curso': 'bg-amber-100 text-amber-800',
  'Terminadas': 'bg-green-100 text-green-800',
};

const RATING_COLORS = {
  'AAA': 'bg-emerald-100 text-emerald-800',
  'AA': 'bg-blue-100 text-blue-800',
  'A': 'bg-amber-100 text-amber-800',
};

export default function WecityProjectTable({ projects }) {
  const [sortConfig, setSortConfig] = useState({ key: '_financiado', direction: 'desc' });
  const [expandedId, setExpandedId] = useState(null);

  const sortedProjects = useMemo(() => {
    return [...projects].sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];

      if (typeof aVal === 'number' || typeof bVal === 'number') {
        aVal = aVal || 0;
        bVal = bVal || 0;
      }
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [projects, sortConfig]);

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
    if (value == null) return '-';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 w-8"></th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('nombre')}>
                Proyecto <SortIcon columnKey="nombre" />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('estado')}>
                Estado <SortIcon columnKey="estado" />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('tipo_inmueble')}>
                Tipo <SortIcon columnKey="tipo_inmueble" />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('rating')}>
                Rating <SortIcon columnKey="rating" />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('_financiado')}>
                Financiado <SortIcon columnKey="_financiado" />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('_rentabilidad_anual')}>
                Rent. Anual <SortIcon columnKey="_rentabilidad_anual" />
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('_plazo')}>
                Plazo <SortIcon columnKey="_plazo" />
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedProjects.map((project) => (
              <>
                <tr
                  key={project._id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => setExpandedId(expandedId === project._id ? null : project._id)}
                >
                  <td className="px-4 py-4">
                    <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${expandedId === project._id ? 'rotate-90' : ''}`} />
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm font-medium text-gray-900">{project.nombre}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {project.ciudad}, {project.pais}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[project.estado] || 'bg-gray-100'}`}>
                      {project.estado}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900">{project.tipo_inmueble || '-'}</td>
                  <td className="px-4 py-4">
                    {project.rating ? (
                      <span className={`px-2 py-1 text-xs font-bold rounded-full ${RATING_COLORS[project.rating] || 'bg-gray-100'}`}>
                        {project.rating}
                      </span>
                    ) : '-'}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900">{formatCurrency(project._financiado)}</td>
                  <td className="px-4 py-4 text-sm text-gray-900">
                    {project._rentabilidad_anual != null ? `${project._rentabilidad_anual}%` : project.rentabilidad_anual || '-'}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900">
                    {project.plazo_estimado || '-'}
                  </td>
                </tr>
                {expandedId === project._id && (
                  <tr key={`${project._id}-details`}>
                    <td colSpan={8} className="px-4 py-4 bg-gray-50">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Detalles</h4>
                          <dl className="text-sm space-y-1">
                            <div className="flex justify-between">
                              <dt className="text-gray-500">Tipo Inversion:</dt>
                              <dd className="text-gray-900">{project.tipo_inversion || '-'}</dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="text-gray-500">Pais:</dt>
                              <dd className="text-gray-900">{project.pais || '-'}</dd>
                            </div>
                          </dl>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Garantia</h4>
                          <dl className="text-sm space-y-1">
                            <div className="flex justify-between">
                              <dt className="text-gray-500">Codigo:</dt>
                              <dd className="text-gray-900">{project.garantia_codigo || '-'}</dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="text-gray-500">Descripcion:</dt>
                              <dd className="text-gray-900">{project.garantia_descripcion || '-'}</dd>
                            </div>
                          </dl>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Rentabilidad</h4>
                          <dl className="text-sm space-y-1">
                            <div className="flex justify-between">
                              <dt className="text-gray-500">Anual:</dt>
                              <dd className="text-gray-900">{project.rentabilidad_anual || '-'}</dd>
                            </div>
                            <div className="flex justify-between">
                              <dt className="text-gray-500">Total:</dt>
                              <dd className="text-gray-900">{project.rentabilidad_total || '-'}</dd>
                            </div>
                            {project.url && (
                              <a
                                href={project.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-blue-600 hover:text-blue-800 mt-2"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <ExternalLink className="w-3 h-3" />
                                Ver en WeCity
                              </a>
                            )}
                          </dl>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
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
