import React, { useState } from 'react';
import { useCivicStore } from '../stores/civicStore';
import { LeafletMap } from '../components/maps/LeafletMap';
import { CheckCircle2, ShieldAlert, AlertCircle, Award } from 'lucide-react';

export const VerifierPortal: React.FC<{ activeView: string }> = () => {
  const { reports, updateReportStatus, addComment, currentUser } = useCivicStore();
  const [selectedReportId, setSelectedReportId] = useState<string | undefined>(undefined);
  const [verifyNotes, setVerifyNotes] = useState('');

  const queue = reports.filter(r => r.status === 'Submitted' || r.status === 'AI_Flagged');
  const selectedReport = reports.find(r => r.id === selectedReportId) || queue[0];

  const handleVerify = (id: string, action: 'Approve' | 'Reject') => {
    const nextStatus = action === 'Approve' ? 'Verified' : 'Rejected';
    const logNotes = `Community Verifier Verification: ${verifyNotes || 'Validated by community trusted citizen.'}`;
    updateReportStatus(id, nextStatus, logNotes);
    addComment(id, `[Verified] ${logNotes}`);
    setVerifyNotes('');
  };

  return (
    <div className="space-y-6">
      <div className="glass-panel p-5 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-100">Community Verifier Panel</h2>
          <p className="text-xs text-slate-400">Review, inspect, and approve submissions to maintain high report standards in Dang District.</p>
        </div>
        <div className="flex items-center gap-1.5 bg-blue-950/40 border border-blue-900 px-3 py-1.5 rounded-lg text-xs text-blue-400">
          <Award className="w-4 h-4" />
          <span className="font-semibold">{currentUser.reputationPoints} Reputation Points</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 glass-panel p-4 space-y-4 max-h-[500px] overflow-y-auto">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Verification Queue ({queue.length})</h3>
          <div className="space-y-3">
            {queue.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">
                <CheckCircle2 className="w-8 h-8 text-emerald-500/40 mx-auto mb-2" />
                <span>All reports verified for now!</span>
              </div>
            ) : (
              queue.map(r => (
                <div
                  key={r.id}
                  onClick={() => setSelectedReportId(r.id)}
                  className={`p-3 rounded-lg border text-xs cursor-pointer transition-colors ${selectedReport?.id === r.id
                      ? 'bg-slate-800/60 border-blue-500/50'
                      : 'bg-slate-900/30 border-slate-850 hover:bg-slate-800/30'
                    }`}
                >
                  <div className="font-bold text-slate-200">{r.title}</div>
                  <div className="text-[10px] text-slate-400 mt-1 line-clamp-1">{r.address}</div>
                  <div className="flex justify-between items-center text-[9px] text-slate-500 mt-2 font-mono">
                    <span>Ward {r.wardId} • {r.category}</span>
                    <span className="bg-slate-800 text-amber-400 px-1.5 py-0.5 rounded text-[8px]">
                      {r.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="h-[250px] rounded-xl overflow-hidden border border-slate-800">
            <LeafletMap reports={reports} activeReportId={selectedReport?.id} />
          </div>

          {selectedReport ? (
            <div className="glass-panel p-5 space-y-4">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="text-base font-bold text-slate-100">{selectedReport.title}</h3>
                  <p className="text-[10px] text-slate-400 font-mono mt-1">📍 {selectedReport.address}</p>
                </div>
                <span className="bg-slate-950 border border-slate-800 text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded">
                  {selectedReport.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-[10px] uppercase font-bold text-slate-500 mb-1">Issue Description</h4>
                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 border border-slate-900 p-3 rounded-lg min-h-[90px]">{selectedReport.description}</p>
                </div>
                {selectedReport.images && selectedReport.images[0] && (
                  <div>
                    <h4 className="text-[10px] uppercase font-bold text-slate-500 mb-1">Report Image Attachment</h4>
                    <img
                      src={selectedReport.images[0].url}
                      alt="Attachment"
                      className="w-full h-24 object-cover rounded-lg border border-slate-800"
                    />
                  </div>
                )}
              </div>

              <div className="border-t border-slate-800/80 pt-4 space-y-3">
                <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-blue-400" />
                  Perform Verification Audit
                </h4>
                <input
                  type="text"
                  placeholder="Provide audit notes or resolution validation comments..."
                  value={verifyNotes}
                  onChange={e => setVerifyNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-xs text-slate-300 focus:outline-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleVerify(selectedReport.id, 'Approve')}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded text-xs transition-colors shadow-sm"
                  >
                    Confirm Report Existence (Approve)
                  </button>
                  <button
                    onClick={() => handleVerify(selectedReport.id, 'Reject')}
                    className="bg-rose-900 hover:bg-rose-800 text-white font-bold py-2 px-4 rounded text-xs transition-colors"
                  >
                    Reject Report (Fake / Spam)
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-panel p-10 text-center text-slate-500 text-xs">
              <AlertCircle className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <span>Select an item from the sidebar queue to start auditing.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default VerifierPortal;
