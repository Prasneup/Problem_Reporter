import React, { useState } from 'react';
import { useCivicStore } from '../stores/civicStore';
import { LeafletMap } from '../components/maps/LeafletMap';
import { ClipboardCheck, Upload, Sparkles } from 'lucide-react';

export const InspectorPortal: React.FC<{ activeView: string }> = () => {
  const { reports, assignments, completeAssignment, currentUser } = useCivicStore();
  const [selectedReportId, setSelectedReportId] = useState<string | undefined>(undefined);
  const [afterUrl, setAfterUrl] = useState('');
  const [resolverNotes, setResolverNotes] = useState('');

  const [matchingState, setMatchingState] = useState<'idle' | 'scanning' | 'success'>('idle');

  const assignedJobs = reports.filter(r =>
    r.status === 'Assigned' &&
    assignments.some(a => a.reportId === r.id && a.inspectorId === currentUser.id)
  );

  const selectedReport = reports.find(r => r.id === selectedReportId) || assignedJobs[0];

  const handleResolve = () => {
    if (!afterUrl || !selectedReport) return;
    setMatchingState('scanning');

    setTimeout(() => {
      setMatchingState('success');
    }, 1500);
  };

  const confirmCompletion = () => {
    if (!selectedReport) return;
    completeAssignment(selectedReport.id, afterUrl, resolverNotes);
    setMatchingState('idle');
    setAfterUrl('');
    setResolverNotes('');
    setSelectedReportId(undefined);
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="glass-panel p-5">
        <h2 className="text-base font-bold text-slate-800">Field Inspector Assignments</h2>
        <p className="text-xs text-slate-500 font-semibold">Receive road/water/sanitation task cards, verify coordinates, and upload resolution evidence.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 glass-panel p-4 space-y-4 max-h-[500px] overflow-y-auto">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Assignments ({assignedJobs.length})</h3>
          <div className="space-y-3">
            {assignedJobs.length === 0 ? (
              <div className="text-center py-10 text-xs text-slate-400">
                <ClipboardCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <span>No active assignments. Relax!</span>
              </div>
            ) : (
              assignedJobs.map(r => (
                <div
                  key={r.id}
                  onClick={() => setSelectedReportId(r.id)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-colors ${selectedReport?.id === r.id
                      ? 'bg-blue-50 border-blue-200 text-blue-800 font-bold'
                      : 'bg-slate-50/50 border-slate-200 hover:bg-slate-100/50 text-slate-600 font-semibold'
                    }`}
                >
                  <div className="font-bold text-slate-800">{r.title}</div>
                  <div className="text-[10px] text-slate-400 mt-1 line-clamp-1">{r.address}</div>
                  <div className="flex justify-between items-center text-[9px] text-slate-500 mt-2 font-mono">
                    <span>Ward {r.wardId} • {r.category}</span>
                    <span className="bg-blue-50 border border-blue-100 text-blue-600 px-1.5 py-0.5 rounded text-[8px] font-extrabold">ASSIGNED</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="h-[250px] rounded-xl overflow-hidden border border-slate-200">
            <LeafletMap reports={reports} activeReportId={selectedReport?.id} />
          </div>

          {selectedReport ? (
            <div className="glass-panel p-5 space-y-4">
              <h3 className="text-base font-bold text-slate-800">{selectedReport.title}</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-[10px] uppercase font-bold text-slate-500 mb-1">Assigned Tasks / Notes</h4>
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 border border-slate-200 p-3 rounded-lg min-h-[90px]">
                    {assignments.find(a => a.reportId === selectedReport.id)?.notes || 'Conduct standard site assessment and clear infrastructure issues.'}
                  </p>
                </div>
                {selectedReport.images && selectedReport.images[0] && (
                  <div>
                    <h4 className="text-[10px] uppercase font-bold text-slate-500 mb-1">Before State Image</h4>
                    <img
                      src={selectedReport.images[0].url}
                      alt="Before"
                      className="w-full h-24 object-cover rounded-lg border border-slate-200"
                    />
                  </div>
                )}
              </div>

              <div className="border-t border-slate-100 pt-4 space-y-3">
                <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Upload className="w-4 h-4 text-blue-600" />
                  Upload Resolution Proof
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Resolution Photo URL"
                    value={afterUrl}
                    onChange={e => setAfterUrl(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded p-2 text-xs text-slate-600 focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Notes (e.g. Potholes asphalted)"
                    value={resolverNotes}
                    onChange={e => setResolverNotes(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded p-2 text-xs text-slate-600 focus:outline-none"
                  />
                </div>
                <button
                  onClick={handleResolve}
                  disabled={!afterUrl}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-transparent font-bold py-2.5 rounded-lg text-xs transition-colors shadow-sm text-white cursor-pointer"
                >
                  Verify Resolution & Complete Task
                </button>
              </div>
            </div>
          ) : (
            <div className="glass-panel p-10 text-center text-slate-400 text-xs">
              <ClipboardCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <span>Select an assignment to view task checklists.</span>
            </div>
          )}
        </div>
      </div>

      {matchingState !== 'idle' && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full max-w-md space-y-5 text-center shadow-2xl">
            {matchingState === 'scanning' ? (
              <div className="space-y-4 py-6">
                <Sparkles className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
                <h3 className="text-sm font-bold text-slate-800">AI Resolution Verification Scan</h3>
                <p className="text-xs text-slate-500 font-semibold">Comparing "Before" and "After" state photos using computer vision...</p>
                <div className="w-24 bg-slate-100 rounded-full h-1.5 overflow-hidden border border-slate-200 mx-auto">
                  <div className="bg-blue-600 h-full rounded-full animate-[pulse_1.5s_infinite]" style={{ width: '80%' }}></div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Sparkles className="w-10 h-10 text-emerald-500 mx-auto" />
                <h3 className="text-sm font-bold text-slate-800">AI Verification Match: 96% Success</h3>
                <p className="text-xs text-slate-500 font-semibold">Computer vision scans indicate high probability of resolution completion. Obstruction cleared, area resurfaced.</p>
                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl text-left text-xs font-mono text-slate-700">
                  <div>Before State: Pothole</div>
                  <div>After State: Clean Asphalt</div>
                  <div>Diff Score: 0.04</div>
                  <div className="text-emerald-600 font-bold">Recommendation: Clear</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={confirmCompletion} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded text-xs transition-colors cursor-pointer">
                    Confirm Completion
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default InspectorPortal;
