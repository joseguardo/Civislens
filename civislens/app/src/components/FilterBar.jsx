import { Search, Filter, Calendar } from 'lucide-react';

export default function FilterBar({ filters, setFilters, projects }) {
  const statuses = [...new Set(projects.map(p => p.status).filter(Boolean))];
  const types = [...new Set(projects.map(p => p.type).filter(Boolean))];
  const businessModels = [...new Set(projects.map(p => p.business_model).filter(Boolean))];
  const years = [...new Set(
    projects.map(p => p.funded_date?.substring(0, 4)).filter(Boolean)
  )].sort().reverse();

  const handleYearChange = (e) => {
    setFilters({ ...filters, year: e.target.value, dateFrom: '', dateTo: '' });
  };

  const handleDateFromChange = (e) => {
    setFilters({ ...filters, dateFrom: e.target.value, year: '' });
  };

  const handleDateToChange = (e) => {
    setFilters({ ...filters, dateTo: e.target.value, year: '' });
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar proyecto..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />

          <select
            value={filters.delayStatus}
            onChange={(e) => setFilters({ ...filters, delayStatus: e.target.value })}
            className={`border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              filters.delayStatus === 'delayed' ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}
          >
            <option value="">Todos los plazos</option>
            <option value="delayed">Solo retrasados</option>
            <option value="on_time">A tiempo</option>
            <option value="closed">Cerrados</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los estados</option>
            {statuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>

          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los tipos</option>
            {types.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          <select
            value={filters.businessModel}
            onChange={(e) => setFilters({ ...filters, businessModel: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los modelos</option>
            {businessModels.map(model => (
              <option key={model} value={model}>{model}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Date filters row */}
      <div className="flex flex-wrap gap-4 items-center mt-3 pt-3 border-t border-gray-100">
        <Calendar className="w-5 h-5 text-gray-400" />

        <select
          value={filters.year}
          onChange={handleYearChange}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos los años</option>
          {years.map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>

        <span className="text-xs text-gray-400">o rango:</span>

        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500">Desde</label>
          <input
            type="month"
            value={filters.dateFrom}
            onChange={handleDateFromChange}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500">Hasta</label>
          <input
            type="month"
            value={filters.dateTo}
            onChange={handleDateToChange}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
}
