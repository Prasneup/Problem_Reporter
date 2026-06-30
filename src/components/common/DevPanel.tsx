import React from 'react';
import { useCivicStore } from '../../stores/civicStore';
import type { UserRole } from '../../types';
import { Wifi, WifiOff, UserCheck, RotateCcw, Shield } from 'lucide-react';

export const DevPanel: React.FC = () => {
  const { currentUser, setUserRole, isOnline, setOnlineStatus } = useCivicStore();

  const roles: UserRole[] = [
    'Citizen',
    'Community Verifier',
    'Field Inspector',
    'Ward Officer',
    'Municipality Officer',
    'District Administrator',
    'Super Admin'
  ];

  const handleReset = () => {
    localStorage.removeItem('dang-smart-city-store');
    window.location.reload();
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] bg-slate-950/90 border-t border-slate-800 text-slate-300 px-4 py-2 flex flex-wrap items-center justify-between gap-4 backdrop-blur-md shadow-2xl">
      <div className="flex items-center gap-2">
        <Shield className="w-5 h-5 text-blue-500 animate-pulse" />
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Dev Sandbox:</span>
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded px-2 py-1">
          <UserCheck className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-semibold text-slate-200">
            {currentUser.name} ({currentUser.role})
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs text-slate-400">Quick Switch Role:</span>
        <select
          value={currentUser.role}
          onChange={(e) => setUserRole(e.target.value as UserRole)}
          className="bg-slate-900 border border-slate-800 text-xs rounded px-2.5 py-1 text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
        >
          {roles.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>

        <button
          onClick={() => setOnlineStatus(!isOnline)}
          className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded transition-all duration-200 ${isOnline
              ? 'bg-emerald-950/50 border border-emerald-800 text-emerald-400 hover:bg-emerald-900/40'
              : 'bg-rose-950/50 border border-rose-800 text-rose-400 hover:bg-rose-900/40'
            }`}
        >
          {isOnline ? (
            <>
              <Wifi className="w-3.5 h-3.5" />
              <span>Online Mode</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5 animate-bounce" />
              <span>Offline Mode</span>
            </>
          )}
        </button>

        <button
          onClick={handleReset}
          title="Reset local changes"
          className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs rounded px-2 py-1.5 transition-colors text-slate-400 hover:text-slate-200"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Db</span>
        </button>
      </div>
    </div>
  );
};
export default DevPanel;
