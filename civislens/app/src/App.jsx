import { useState, useMemo } from 'react';
import Dashboard from './components/Dashboard';
import WecityDashboard from './components/wecity/WecityDashboard';
import urbanitaeProjects from './data/projects.json';
import wecityRaw from './data/wecity_oportunidades_financiadas.json';
import { parseWecityProjects } from './utils/wecityParser';

const TABS = [
  { id: 'urbanitae', label: 'Urbanitae' },
  { id: 'wecity', label: 'WeCity' },
];

function App() {
  const [activeTab, setActiveTab] = useState('urbanitae');
  const wecityProjects = useMemo(() => parseWecityProjects(wecityRaw), []);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">CivisLens</h1>
          <p className="text-gray-500 mt-1">
            Analisis de proyectos de crowdfunding inmobiliario
          </p>
          <nav className="flex gap-1 mt-4">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {activeTab === 'urbanitae' && <Dashboard projects={urbanitaeProjects} />}
      {activeTab === 'wecity' && <WecityDashboard projects={wecityProjects} />}
    </div>
  );
}

export default App;
