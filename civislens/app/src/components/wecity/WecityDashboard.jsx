import { useState, useMemo } from 'react';
import WecityKPICards from './WecityKPICards';
import WecityFilterBar from './WecityFilterBar';
import WecityProjectTable from './WecityProjectTable';
import WecityYearlySummaryTable from './WecityYearlySummaryTable';
import WecityStatusPie from './charts/WecityStatusPie';
import WecityTypeBar from './charts/WecityTypeBar';
import WecityRatingChart from './charts/WecityRatingChart';
import WecityReturnDistribution from './charts/WecityReturnDistribution';
import WecityCityChart from './charts/WecityCityChart';

export default function WecityDashboard({ projects }) {
  const [filters, setFilters] = useState({
    search: '',
    estado: '',
    tipo: '',
    rating: '',
    pais: '',
    year: '',
  });

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      if (filters.search) {
        const search = filters.search.toLowerCase();
        const matches =
          p.nombre?.toLowerCase().includes(search) ||
          p.ciudad?.toLowerCase().includes(search);
        if (!matches) return false;
      }
      if (filters.estado && p.estado !== filters.estado) return false;
      if (filters.tipo && p.tipo_inmueble !== filters.tipo) return false;
      if (filters.rating && p.rating !== filters.rating) return false;
      if (filters.pais && p.pais !== filters.pais) return false;
      if (filters.year && p.year !== Number(filters.year)) return false;
      return true;
    });
  }, [projects, filters]);

  return (
    <main className="max-w-7xl mx-auto px-4 py-6">
      <WecityKPICards projects={filteredProjects} />
      <WecityFilterBar filters={filters} setFilters={setFilters} projects={projects} />

      {/* Yearly Summary */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Resumen Anual</h2>
        <WecityYearlySummaryTable projects={filteredProjects} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <WecityStatusPie projects={filteredProjects} />
        <WecityRatingChart projects={filteredProjects} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <WecityTypeBar projects={filteredProjects} />
        <WecityCityChart projects={filteredProjects} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mb-6">
        <WecityReturnDistribution projects={filteredProjects} />
      </div>

      <WecityProjectTable projects={filteredProjects} />
    </main>
  );
}
