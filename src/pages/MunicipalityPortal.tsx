import React from 'react';
import { useCivicStore } from '../stores/civicStore';
import { CategoryBarChart, ResolutionLineChart } from '../components/charts/WidgetCharts';
import { calculateWardHealth } from '../utils/civicUtils';
import { Landmark, TrendingUp, BarChart3, Receipt } from 'lucide-react';

export const MunicipalityPortal: React.FC<{ activeView: string }> = ({ activeView }) => {
  const { reports, budgets, currentUser } = useCivicStore();

  const muniId = currentUser.municipalityId || 'ghorahi';
  const muniBudgets = budgets.filter(b => b.municipalityId === muniId);
  const muniReports = reports.filter(r => r.municipalityId === muniId);

  const totalAllocated = muniBudgets.reduce((acc, b) => acc + b.allocated, 0);
  const totalSpent = muniBudgets.reduce((acc, b) => acc + b.spent, 0);

  if (activeView === 'muni-budgets') {
    return (
      <div className="glass-panel p-6 space-y-6 font-sans">
        <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
          <Receipt className="w-5 h-5 text-blue-600" />
          <h2 className="text-base font-bold text-slate-800">Ward Budget Management Ledger</h2>
        </div>
        <div className="space-y-4">
          {muniBudgets.map(b => {
            const percent = Math.min(100, Math.round((b.spent / b.allocated) * 100));
            return (
              <div key={b.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-700 font-bold">
                  <span>Ward {b.wardId} Infrastructure Budget</span>
                  <span>रू {b.spent.toLocaleString()} / {b.allocated.toLocaleString()} spent</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                  <div className="bg-blue-600 h-full rounded-full transition-all duration-300" style={{ width: `${percent}%` }}></div>
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-mono font-bold">
                  <span>Usage: {percent}%</span>
                  <span>Remaining: रू {(b.allocated - b.spent).toLocaleString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      <div className="glass-panel p-5">
        <h2 className="text-base font-bold text-slate-800">Municipal Governance Overview • {muniId.toUpperCase()}</h2>
        <p className="text-xs text-slate-500 font-semibold font-sans">Track cross-ward resolution performance, monitor budget expenditures, and review city infrastructure diagnostics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase">Total Muni Budget</span>
            <h3 className="text-lg font-bold text-slate-800 mt-1">रू {totalAllocated.toLocaleString()}</h3>
          </div>
          <Landmark className="w-8 h-8 text-blue-600 opacity-40" />
        </div>
        <div className="glass-panel p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase">Total Spent</span>
            <h3 className="text-lg font-bold text-slate-800 mt-1">रू {totalSpent.toLocaleString()}</h3>
          </div>
          <TrendingUp className="w-8 h-8 text-emerald-600 opacity-40" />
        </div>
        <div className="glass-panel p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase">Muni Active Issues</span>
            <h3 className="text-lg font-bold text-slate-800 mt-1">{muniReports.filter(r => r.status !== 'Resolved').length} / {muniReports.length}</h3>
          </div>
          <BarChart3 className="w-8 h-8 text-indigo-600 opacity-40" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 glass-panel p-5 space-y-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Infrastructure Health Leaderboard</h3>
          <div className="space-y-3">
            {[2, 5, 12, 15].map((wardNum) => {
              const health = calculateWardHealth(reports, wardNum, muniId);
              let color = 'text-emerald-600';
              if (health < 50) color = 'text-rose-600';
              else if (health < 80) color = 'text-amber-600';
              return (
                <div key={wardNum} className="flex justify-between items-center p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                  <span className="font-bold text-slate-700">Ward {wardNum}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-[10px] font-bold">Health Index:</span>
                    <span className={`font-bold ${color} font-mono`}>{health}/100</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          <CategoryBarChart reports={muniReports} />
          <ResolutionLineChart reports={muniReports} />
        </div>
      </div>
    </div>
  );
};
export default MunicipalityPortal;
