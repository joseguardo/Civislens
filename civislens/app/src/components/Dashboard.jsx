import { useState, useMemo } from 'react';
import { Info } from 'lucide-react';
import KPICards from './KPICards';
import FilterBar from './FilterBar';
import ProjectTable from './ProjectTable';
import StatusPieChart from './charts/StatusPieChart';
import TypeBarChart from './charts/TypeBarChart';
import TimelineChart from './charts/TimelineChart';
import ReturnDistribution from './charts/ReturnDistribution';
import DelayAnalysisChart from './charts/DelayAnalysisChart';
import YearlySummaryTable from './YearlySummaryTable';
import { analyzeProjectDelay } from '../utils/delayAnalysis';

export default function Dashboard({ projects }) {
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    type: '',
    businessModel: '',
    delayStatus: '',
    year: '',
    dateFrom: '',
    dateTo: '',
  });

  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      if (filters.search) {
        const search = filters.search.toLowerCase();
        const matchesSearch =
          p.project?.toLowerCase().includes(search) ||
          p.location?.toLowerCase().includes(search) ||
          p.address?.toLowerCase().includes(search);
        if (!matchesSearch) return false;
      }
      if (filters.status && p.status !== filters.status) return false;
      if (filters.type && p.type !== filters.type) return false;
      if (filters.businessModel && p.business_model !== filters.businessModel) return false;

      // Delay status filter
      if (filters.delayStatus) {
        const delay = analyzeProjectDelay(p);
        if (delay.status !== filters.delayStatus) return false;
      }

      // Date filters
      if (filters.year) {
        if (!p.funded_date?.startsWith(filters.year)) return false;
      }
      if (filters.dateFrom) {
        if (!p.funded_date || p.funded_date < filters.dateFrom) return false;
      }
      if (filters.dateTo) {
        if (!p.funded_date || p.funded_date > filters.dateTo + '-31') return false;
      }

      return true;
    });
  }, [projects, filters]);

  return (
    <main className="max-w-7xl mx-auto px-4 py-6">
        <KPICards projects={filteredProjects} />
        <FilterBar filters={filters} setFilters={setFilters} projects={projects} />

        {/* Delay Analysis Section */}
        <div className="mb-6">
          <div className="flex items-start justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Analisis de Retrasos</h2>
          </div>

          {/* Methodology explanation */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-2">Metodologia de calculo de retrasos</p>
                <ul className="list-disc list-inside space-y-1 text-blue-700">
                  <li>
                    <strong>Fecha fin esperada</strong> = Fecha de inicio de financiacion (<code className="bg-blue-100 px-1 rounded">fund_start_date</code>) + Plazo de inversion (<code className="bg-blue-100 px-1 rounded">investment_term</code>)
                  </li>
                  <li>
                    <strong>Proyecto retrasado</strong> = Fecha actual {">"} Fecha fin esperada Y el proyecto no esta cerrado
                  </li>
                  <li>
                    Para plazos con rango (ej: "32-36 meses"), se usa el valor maximo (36 meses)
                  </li>
                  <li>
                    Los proyectos con estado <code className="bg-blue-100 px-1 rounded">CLOSED</code> se excluyen del analisis de retrasos
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <DelayAnalysisChart projects={filteredProjects} />
        </div>

        {/* Yearly Summary */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Resumen Anual</h2>
          <YearlySummaryTable projects={filteredProjects} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <StatusPieChart projects={filteredProjects} />
          <TypeBarChart projects={filteredProjects} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <TimelineChart projects={filteredProjects} />
          <ReturnDistribution projects={filteredProjects} />
        </div>

        <ProjectTable projects={filteredProjects} />
    </main>
  );
}
