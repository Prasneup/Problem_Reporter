import React, { useState } from 'react';
import { useCivicStore } from '../../stores/civicStore';
import { Database, Download, Code, RefreshCw, Key } from 'lucide-react';

export const OpenDataPortal: React.FC = () => {
  const { reports, budgets } = useCivicStore();
  const [apiKey, setApiKey] = useState('dng_public_live_42a8b9f1ec2a');
  const [activeEndpoint, setActiveEndpoint] = useState('/api/public/reports');
  const [apiResponse, setApiResponse] = useState<string>('');
  const [loadingApi, setLoadingApi] = useState(false);

  const generateApiKey = () => {
    const chars = 'abcdef0123456789';
    let key = 'dng_public_live_';
    for (let i = 0; i < 16; i++) {
      key += chars[Math.floor(Math.random() * chars.length)];
    }
    setApiKey(key);
  };

  const handleTestApi = (endpoint: string) => {
    setActiveEndpoint(endpoint);
    setLoadingApi(true);
    setTimeout(() => {
      setLoadingApi(false);
      if (endpoint === '/api/public/reports') {
        const publicReports = reports.map(r => ({
          id: r.id,
          category: r.category,
          municipality: r.municipalityId,
          ward: r.wardId,
          status: r.status,
          priority: r.priority,
          supporters: r.supportCount,
          latitude: r.latitude,
          longitude: r.longitude
        }));
        setApiResponse(JSON.stringify(publicReports.slice(0, 3), null, 2) + '\n\n// ... truncated for preview');
      } else if (endpoint === '/api/public/budgets') {
        setApiResponse(JSON.stringify(budgets, null, 2));
      } else {
        const stats = {
          total_reports: reports.length,
          resolved_reports: reports.filter(r => r.status === 'Resolved').length,
          active_reports: reports.filter(r => r.status !== 'Resolved').length,
          emergency_reports: reports.filter(r => r.isEmergency).length,
        };
        setApiResponse(JSON.stringify(stats, null, 2));
      }
    }, 400);
  };

  const downloadCSV = () => {
    const headers = 'ID,Title,Category,Municipality,Ward,Status,Priority,Supporters,Lat,Lng\n';
    const rows = reports.map(r => 
      `"${r.id}","${r.title.replace(/"/g, '""')}","${r.category}","${r.municipalityId}",${r.wardId},"${r.status}","${r.priority}",${r.supportCount},${r.latitude},${r.longitude}`
    ).join('\n');
    
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'dang_civic_reports_opendata.csv');
    a.click();
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="glass-panel p-6">
        <div className="flex items-center gap-3">
          <Database className="w-6 h-6 text-blue-600" />
          <div>
            <h2 className="text-xl font-bold text-slate-800">Open Government Data & API</h2>
            <p className="text-xs text-slate-500 font-semibold">Public data access in compliance with Nepal’s Right to Information (RTI) provisions.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <div className="glass-panel p-5 space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Key className="w-4 h-4 text-blue-600" />
              API Authentication
            </h3>
            <p className="text-[11px] text-slate-400 font-bold">Developers must include this key in the header: <code>X-API-Key</code></p>
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                readOnly 
                value={apiKey} 
                className="bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 text-[10px] font-mono text-slate-700 flex-1 select-all focus:outline-none font-bold" 
              />
              <button 
                onClick={generateApiKey}
                className="p-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded transition-colors text-slate-600 cursor-pointer"
                title="Regenerate Key"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
            
            <div className="border-t border-slate-100 pt-3">
              <div className="flex justify-between text-[10px] text-slate-500 font-bold mb-1">
                <span>Rate Limits:</span>
                <span className="text-slate-750 font-bold">120 / 150 min</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200">
                <div className="bg-blue-600 h-full rounded-full" style={{ width: '80%' }}></div>
              </div>
            </div>
          </div>

          <div className="glass-panel p-5 space-y-3">
            <h3 className="text-sm font-bold text-slate-800 font-sans">Public Datasets</h3>
            <p className="text-[11px] text-slate-500 font-semibold font-sans">Download complete structured reports in standard CSV format for GIS applications or analysis.</p>
            <button 
              onClick={downloadCSV}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-3 rounded-lg text-xs transition-colors shadow-sm cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Download Reports CSV
            </button>
          </div>
        </div>

        <div className="md:col-span-2 glass-panel p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Code className="w-4 h-4 text-blue-600" />
              API Playground & Sandbox
            </h3>
            <span className="text-[10px] text-slate-400 font-mono font-bold">Status: ACTIVE</span>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {['/api/public/reports', '/api/public/budgets', '/api/public/statistics'].map((endpoint) => (
              <button
                key={endpoint}
                onClick={() => handleTestApi(endpoint)}
                className={`text-[10px] font-mono px-3 py-1.5 rounded transition-all cursor-pointer ${
                  activeEndpoint === endpoint
                    ? 'bg-blue-600 text-white font-bold'
                    : 'bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                }`}
              >
                GET {endpoint}
              </button>
            ))}
          </div>

          <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-4 font-mono text-xs overflow-y-auto max-h-[300px] relative min-h-[180px]">
            {loadingApi && (
              <div className="absolute inset-0 bg-slate-50/70 flex items-center justify-center text-slate-500 gap-2 font-bold">
                <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                <span>Fetching data...</span>
              </div>
            )}
            <pre className="text-blue-600 whitespace-pre-wrap font-bold">
              {apiResponse || '// Select an endpoint above and click or wait for response'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
export default OpenDataPortal;
