import React, { useState } from 'react';
import { useCivicStore } from '../stores/civicStore';
import { ShieldCheck, UserCog, Settings, History, Check } from 'lucide-react';
import { formatNepalTime } from '../utils/civicUtils';

export const SuperAdminPortal: React.FC<{ activeView: string }> = ({ activeView }) => {
  const { reports } = useCivicStore();
  const [pointsRate, setPointsRate] = useState('10');
  const [escalationLimit, setEscalationLimit] = useState('25');
  const [savedSettings, setSavedSettings] = useState(false);

  const getAuditLogs = () => {
    const logs = [
      { id: 'l1', user: 'Ram Bahadur', role: 'Citizen', action: 'SUBMIT_REPORT', table: 'reports', record: 'r-1', time: '2026-06-01T10:30:00Z' },
      { id: 'l2', user: 'Krishna Raj Oli', role: 'Ward Officer', action: 'ASSIGN_INSPECTOR', table: 'assignments', record: 'a-1', time: '2026-06-02T09:00:00Z' },
      { id: 'l3', user: 'Ram Bahadur', role: 'Citizen', action: 'UPVOTE_REPORT', table: 'support_votes', record: 'r-1', time: '2026-06-03T11:15:00Z' },
      { id: 'l4', user: 'Sita Kumari', role: 'Community Verifier', action: 'VERIFY_REPORT', table: 'verification_logs', record: 'v-2', time: '2026-05-25T08:15:00Z' }
    ];
    reports.forEach((r, idx) => {
      if (r.id.startsWith('r-') && r.id !== 'r-1' && r.id !== 'r-2' && r.id !== 'r-3') {
        logs.unshift({
          id: `l-dyn-${idx}`,
          user: 'Ram Bahadur',
          role: 'Citizen',
          action: 'CREATE_REPORT',
          table: 'reports',
          record: r.id,
          time: r.createdAt
        });
      }
    });
    return logs;
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSettings(true);
    setTimeout(() => setSavedSettings(false), 2000);
  };

  if (activeView === 'super-users') {
    return (
      <div className="glass-panel p-6 font-sans">
        <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
          <UserCog className="w-5 h-5 text-blue-600" />
          Role-Based Access Control (RBAC)
        </h2>
        <div className="overflow-x-auto text-xs text-slate-600">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/50">
                <th className="py-3 px-3">Account Name</th>
                <th className="py-3 px-3">Role/Permissions</th>
                <th className="py-3 px-3">Reputation Points</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Ram Bahadur Thapa', role: 'Citizen', pts: '120' },
                { name: 'Sita Kumari Chaudhary', role: 'Community Verifier', pts: '450' },
                { name: 'Hari Prasad Devkota', role: 'Field Inspector', pts: '0' },
                { name: 'Krishna Raj Oli', role: 'Ward Officer', pts: '0' }
              ].map((user, idx) => (
                <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/50">
                  <td className="py-3 px-3 font-bold text-slate-800">{user.name}</td>
                  <td className="py-3 px-3">
                    <span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-blue-600 font-mono text-[10px] font-bold">
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono font-bold">{user.pts} pts</td>
                  <td className="py-3 px-3 text-right">
                    <button type="button" className="text-[10px] text-blue-650 hover:underline font-bold">Edit User</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (activeView === 'super-audits') {
    return (
      <div className="glass-panel p-6 space-y-4 font-sans">
        <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <History className="w-5 h-5 text-blue-600" />
          Audit Logs
        </h2>
        <div className="space-y-3 font-mono text-[10px] text-slate-500 max-h-[400px] overflow-y-auto pr-1">
          {getAuditLogs().map((log) => (
            <div key={log.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-between gap-4 font-bold text-slate-600">
              <div>
                <span className="text-blue-600 font-bold">[{log.action}]</span>{' '}
                <span>user={log.user} ({log.role}) table={log.table} key={log.record}</span>
              </div>
              <span className="text-slate-400 shrink-0">{formatNepalTime(log.time)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      <div className="glass-panel p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-emerald-600 animate-pulse" />
          <div>
            <h2 className="text-base font-bold text-slate-800">Super Administrator Dashboard</h2>
            <p className="text-xs text-slate-500 font-semibold">Manage environment settings, toggle global configurations, and inspect automated audit registers.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Settings className="w-4 h-4 text-blue-600" /> System Settings Configuration
          </h3>
          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div className="space-y-2">
              <label className="text-slate-500 block font-bold">Reward Points Rate (per verified report):</label>
              <input type="number" value={pointsRate} onChange={e => setPointsRate(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-700 focus:outline-none focus:bg-white" />
            </div>
            <div className="space-y-2">
              <label className="text-slate-500 block font-bold">Auto-Escalation Threshold (Supports count):</label>
              <input type="number" value={escalationLimit} onChange={e => setEscalationLimit(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-700 focus:outline-none focus:bg-white" />
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg transition-colors shadow-sm text-xs flex items-center justify-center gap-1.5 cursor-pointer">
              {savedSettings ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Settings Saved!</span>
                </>
              ) : (
                <span>Save System Parameters</span>
              )}
            </button>
          </form>
        </div>

        <div className="glass-panel p-5 space-y-3">
          <h3 className="text-sm font-bold text-slate-800">Database Engine Integrations</h3>
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5 text-xs text-slate-650 font-bold">
            <div className="flex justify-between">
              <span>Row Level Security (RLS)</span>
              <span className="text-emerald-600 font-bold font-mono">ENABLED</span>
            </div>
            <div className="flex justify-between">
              <span>Realtime Subscriptions</span>
              <span className="text-emerald-600 font-bold font-mono">ON</span>
            </div>
            <div className="flex justify-between">
              <span>Active Database Tables</span>
              <span className="text-slate-400 font-mono">13 Tables</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default SuperAdminPortal;
