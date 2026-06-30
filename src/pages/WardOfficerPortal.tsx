import React, { useState } from 'react';
import { useCivicStore } from '../stores/civicStore';
import { formatNepalTime } from '../utils/civicUtils';
import { UserCheck } from 'lucide-react';

export const WardOfficerPortal: React.FC<{ activeView: string }> = () => {
  const { reports, assignInspector, updateReportStatus, currentUser } = useCivicStore();
  const [selectedReportId, setSelectedReportId] = useState<string | undefined>(undefined);
  const [assignedNotes, setAssignedNotes] = useState('');

  const inspectors = [
    { id: 'p-inspector', name: 'Hari Prasad Devkota', department: 'Roads & Sanitation' },
    { id: 'ins-2', name: 'Ramesh Chaudhary', department: 'Water & Irrigation' },
    { id: 'ins-3', name: 'Binod Bhandari', department: 'Electricity & Lighting' }
  ];

  const wardId = currentUser.wardId || 15;
  const muniId = currentUser.municipalityId || 'ghorahi';

  const wardReports = reports.filter(r => r.wardId === wardId && r.municipalityId === muniId);
  const selectedReport = reports.find(r => r.id === selectedReportId) || wardReports[0];

  const handleAssign = (inspectorId: string, name: string) => {
    if (!selectedReport) return;
    assignInspector(selectedReport.id, inspectorId, name, assignedNotes);
    setAssignedNotes('');
  };

  const handleUpdateStatus = (id: string, status: typeof reports[0]['status']) => {
    updateReportStatus(id, status, `Ward Officer Action: Marked as ${status.replace('_', ' ')}`);
  };

  return (
    <div className="space-y-6">
      <div className="glass-panel p-5 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-100">Ward Officer Inbox • {muniId.toUpperCase()} Ward {wardId}</h2>
          <p className="text-xs text-slate-400">Review community validations, perform triage audits, manage department pipelines, and deploy inspectors.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 glass-panel p-4 space-y-4 max-h-[500px] overflow-y-auto">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ward Reports Inbox ({wardReports.length})</h3>
          <div className="space-y-3">
            {wardReports.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-500">
                <span>No issues reported in this ward.</span>
              </div>
            ) : (
              wardReports.map(r => (
                <div
                  key={r.id}
                  onClick={() => setSelectedReportId(r.id)}
                  className={`p-3 rounded-lg border text-xs cursor-pointer transition-colors ${selectedReport?.id === r.id
                      ? 'bg-slate-800/60 border-blue-500/50'
                      : 'bg-slate-900/30 border-slate-850 hover:bg-slate-800/30'
                    }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-slate-200">{r.title}</span>
                    <span className={`text-[8px] px-1 py-0.5 rounded font-mono ${r.priority === 'Critical' || r.priority === 'Emergency' ? 'bg-red-950 text-red-400' : 'bg-slate-850 text-slate-400'
                      }`}>{r.priority}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 line-clamp-1">{r.address}</div>
                  <div className="flex justify-between items-center text-[9px] text-slate-500 mt-2">
                    <span>{r.category}</span>
                    <span className="bg-slate-800 text-blue-400 px-1.5 py-0.5 rounded text-[8px] font-mono">
                      {r.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {selectedReport ? (
            <div className="glass-panel p-5 space-y-5">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="text-base font-bold text-slate-100">{selectedReport.title}</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-mono">📍 {selectedReport.address} • Submitted: {formatNepalTime(selectedReport.createdAt)}</p>
                </div>
                <span className="bg-blue-950/40 border border-blue-900 text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded">{selectedReport.status}</span>
              </div>

              <p className="text-xs text-slate-300 bg-slate-950/60 border border-slate-900 rounded p-3 leading-relaxed">{selectedReport.description}</p>

              <div className="space-y-2.5">
                <h4 className="text-[10px] uppercase font-bold text-slate-500">Perform Triage Audit</h4>
                <div className="flex flex-wrap gap-2 text-xs font-semibold">
                  <button type="button" onClick={() => handleUpdateStatus(selectedReport.id, 'Under_Review')} className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg transition-colors">Mark Under Review</button>
                  <button type="button" onClick={() => handleUpdateStatus(selectedReport.id, 'Verified')} className="bg-emerald-950/40 hover:bg-emerald-900/40 text-emerald-400 border border-emerald-800 px-3 py-1.5 rounded-lg transition-colors">Approve & Verify</button>
                  <button type="button" onClick={() => handleUpdateStatus(selectedReport.id, 'Rejected')} className="bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 px-3 py-1.5 rounded-lg transition-colors">Spam / Reject</button>
                </div>
              </div>

              <div className="border-t border-slate-800/80 pt-4 space-y-3">
                <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-blue-400" />
                  Deploy Field Inspector
                </h4>
                <input
                  type="text"
                  placeholder="Task instructions (e.g., assess potholes, fill with rapid concrete)..."
                  value={assignedNotes}
                  onChange={e => setAssignedNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-300 focus:outline-none"
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                  {inspectors.map(ins => (
                    <button
                      key={ins.id}
                      type="button"
                      onClick={() => handleAssign(ins.id, ins.name)}
                      disabled={selectedReport.status === 'Resolved'}
                      className="bg-slate-900 hover:bg-slate-850 border border-slate-800 p-2.5 rounded-lg text-left text-xs transition-all hover:border-blue-500/40"
                    >
                      <div className="font-bold text-slate-200">{ins.name}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{ins.department}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-panel p-10 text-center text-slate-500 text-xs">
              <span>Select an active complaint from the inbox list.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default WardOfficerPortal;
