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
    <div className="space-y-6">
      <div className="glass-panel p-5 flex justify-between items-center">
        <div>
          <h2 className="text-base font-bold text-slate-100">District Administrator Control Room</h2>
          <p className="text-xs text-slate-400">Holistic monitoring, emergency dispatch response protocols, and inter-municipality comparisons for Dang District.</p>
        </div>
      </div>

      {emergencyReports.length > 0 && (
        <div className="bg-red-950/40 border border-red-800/80 rounded-xl p-4 text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-red-400">
            <ShieldAlert className="w-4.5 h-4.5 text-red-500 animate-pulse" />
            <span>CRITICAL DISTRICT EMERGENCY ALERTS ({emergencyReports.length})</span>
          </div>
          <div className="space-y-1.5 font-mono text-[10px] text-slate-300">
            {emergencyReports.map(e => (
              <div key={e.id} className="flex justify-between border-b border-red-900/30 pb-1.5">
                <span>⚡ {e.title} ({e.address})</span>
                <span className="text-red-400 font-bold bg-red-900/35 px-1 py-0.2 rounded">DISPATCH IMMEDIATE</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between bg-slate-900/50 border border-slate-800 rounded-lg p-2.5">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Map className="w-4 h-4 text-blue-400" /> Map Intelligence:
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
                  className={`text-[9px] font-bold px-2 py-1 rounded transition-colors ${mapMode === btn.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          <div className="h-[320px] rounded-xl overflow-hidden border border-slate-800">
            <LeafletMap
              reports={reports}
              showHeatmap={mapMode === 'heatmap'}
              showGisLayers={mapMode === 'gis'}
            />
          </div>
        </div>

        <div className="lg:col-span-1 glass-panel p-5 space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Municipality Leaderboard</h3>
          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
            {MUNICIPALITIES.map((muni) => {
              const muniReports = reports.filter(r => r.municipalityId === muni.id);
              const resolved = muniReports.filter(r => r.status === 'Resolved').length;
              const rate = muniReports.length > 0 ? Math.round((resolved / muniReports.length) * 100) : 100;

              return (
                <div key={muni.id} className="p-3 bg-slate-900/30 border border-slate-850 rounded-lg text-xs space-y-2">
                  <div className="flex justify-between font-bold text-slate-300">
                    <span>{muni.name}</span>
                    <span className="text-blue-400 font-mono">{rate}% Resolved</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-1 border border-slate-800">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${rate}%` }}></div>
                  </div>
                  <div className="flex justify-between text-[9px] text-slate-500 font-mono">
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
