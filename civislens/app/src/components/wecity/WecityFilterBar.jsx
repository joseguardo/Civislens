import { Search, Filter, Calendar } from 'lucide-react';

export default function WecityFilterBar({ filters, setFilters, projects }) {
  const estados = [...new Set(projects.map(p => p.estado).filter(Boolean))];
  const tipos = [...new Set(projects.map(p => p.tipo_inmueble).filter(Boolean))];
  const ratings = [...new Set(projects.map(p => p.rating).filter(Boolean))].sort().reverse();
  const paises = [...new Set(projects.map(p => p.pais).filter(Boolean))];
  const years = [...new Set(projects.map(p => p._year).filter(Boolean))].sort((a, b) => b - a);

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
            value={filters.year}
            onChange={(e) => setFilters({ ...filters, year: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los años</option>
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          <select
            value={filters.estado}
            onChange={(e) => setFilters({ ...filters, estado: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los estados</option>
            {estados.map(e => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>

          <select
            value={filters.tipo}
            onChange={(e) => setFilters({ ...filters, tipo: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los tipos</option>
            {tipos.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>

          <select
            value={filters.rating}
            onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los ratings</option>
            {ratings.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>

          <select
            value={filters.pais}
            onChange={(e) => setFilters({ ...filters, pais: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos los paises</option>
            {paises.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
