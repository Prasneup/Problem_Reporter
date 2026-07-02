import React, { useState } from 'react';
import { useCivicStore } from '../stores/civicStore';
import { LeafletMap } from '../components/maps/LeafletMap';
import { MUNICIPALITIES } from '../constants/municipalities';
import { Map, ShieldAlert } from 'lucide-react';

export const DistrictAdminPortal: React.FC<{ activeView: string }> = () => {
  const { reports } = useCivicStore();
  const [mapMode, setMapMode] = useState<'markers' | 'heatmap' | 'gis'>('heatmap');

  const emergencyReports = reports.filter(r => r.priority === 'Emergency' && r.status !== 'Resolved');

  return (
    <div className="space-y-6 font-sans">
      <div className="glass-panel p-5 flex justify-between items-center">
        <div>
          <h2 className="text-base font-bold text-slate-800">District Administrator Control Room</h2>
          <p className="text-xs text-slate-500 font-semibold">Holistic monitoring, emergency dispatch response protocols, and inter-municipality comparisons for Dang District.</p>
        </div>
      </div>

      {emergencyReports.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-red-600">
            <ShieldAlert className="w-4.5 h-4.5 text-red-500 animate-pulse" />
            <span>CRITICAL DISTRICT EMERGENCY ALERTS ({emergencyReports.length})</span>
          </div>
          <div className="space-y-1.5 font-mono text-[10px] text-red-800">
            {emergencyReports.map(e => (
              <div key={e.id} className="flex justify-between border-b border-red-100 pb-1.5">
                <span>⚡ {e.title} ({e.address})</span>
                <span className="text-red-700 font-extrabold bg-red-100 px-1 py-0.2 rounded">DISPATCH IMMEDIATE</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between bg-slate-100 border border-slate-200 rounded-xl p-2.5">
            <span className="text-xs font-extrabold text-slate-700 flex items-center gap-1.5">
              <Map className="w-4 h-4 text-blue-600" /> Map Intelligence:
            </span>
            <div className="flex gap-2">
              {(
                [
                  { id: 'markers', label: 'Markers' },
                  { id: 'heatmap', label: 'Density Heatmap' },
                  { id: 'gis', label: 'GIS Overlays' },
                ] as const
              ).map((btn) => (
                <button
                  key={btn.id}
                  type="button"
                  onClick={() => setMapMode(btn.id)}
                  className={`text-[9px] font-bold px-2 py-1 rounded transition-colors cursor-pointer ${mapMode === btn.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-200/80 text-slate-600 hover:bg-slate-350'
                    }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          <div className="h-[320px] rounded-xl overflow-hidden border border-slate-200">
            <LeafletMap
              reports={reports}
              showHeatmap={mapMode === 'heatmap'}
              showGisLayers={mapMode === 'gis'}
            />
          </div>
        </div>

        <div className="lg:col-span-1 glass-panel p-5 space-y-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Municipality Leaderboard</h3>
          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
            {MUNICIPALITIES.map((muni) => {
              const muniReports = reports.filter(r => r.municipalityId === muni.id);
              const resolved = muniReports.filter(r => r.status === 'Resolved').length;
              const rate = muniReports.length > 0 ? Math.round((resolved / muniReports.length) * 100) : 100;

              return (
                <div key={muni.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2">
                  <div className="flex justify-between font-bold text-slate-700">
                    <span>{muni.name}</span>
                    <span className="text-blue-600 font-mono">{rate}% Resolved</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1 border border-slate-200">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${rate}%` }}></div>
                  </div>
                  <div className="flex justify-between text-[9px] text-slate-400 font-mono font-bold">
                    <span>Active issues: {muniReports.length - resolved}</span>
                    <span>Total filed: {muniReports.length}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
export default DistrictAdminPortal;
