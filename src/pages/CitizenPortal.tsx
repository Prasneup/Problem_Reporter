import React, { useState } from 'react';
import { useCivicStore } from '../stores/civicStore';
import { LeafletMap } from '../components/maps/LeafletMap';
import { ReportForm } from '../components/forms/ReportForm';
import { formatNepalTime } from '../utils/civicUtils';
import { ThumbsUp, MessageSquare, AlertTriangle, CheckCircle, RefreshCw, User } from 'lucide-react';

export const CitizenPortal: React.FC<{ activeView: string }> = ({ activeView }) => {
  const { reports, comments, addComment, supportReport, currentUser, reopenReport } = useCivicStore();
  const [selectedReportId, setSelectedReportId] = useState<string | undefined>(undefined);
  const [newCommentText, setNewCommentText] = useState('');
  
  const [reopenId, setReopenId] = useState<string | null>(null);
  const [reopenNotes, setReopenNotes] = useState('');
  const [reopenImg, setReopenImg] = useState('');

  const citizenReports = reports.filter(r => r.reporterId === currentUser.id);
  const resolvedCount = citizenReports.filter(r => r.status === 'Resolved').length;

  const handleReopen = (id: string) => {
    reopenReport(id, reopenNotes, reopenImg || 'https://images.unsplash.com/photo-1594913785162-e6785b4938a2?w=800&auto=format&fit=crop&q=60');
    setReopenId(null);
    setReopenNotes('');
    setReopenImg('');
  };

  if (activeView === 'report-form') {
    return (
      <div className="glass-panel p-6">
        <h2 className="text-base font-bold text-slate-100 mb-1">Submit Civic Infrastructure Problem</h2>
        <p className="text-xs text-slate-400 mb-6">Select a category, point the location on the map, and upload an image to alert the ward office.</p>
        <ReportForm onSuccess={() => window.location.reload()} />
      </div>
    );
  }

  if (activeView === 'my-reports') {
    return (
      <div className="glass-panel p-6">
        <h2 className="text-base font-bold text-slate-100 mb-4">My Submitted Reports ({citizenReports.length})</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                <th className="py-3 px-2">Title</th>
                <th className="py-3 px-2">Category</th>
                <th className="py-3 px-2">Status</th>
                <th className="py-3 px-2">Budget (Est/Spent)</th>
                <th className="py-3 px-2">Date Submitted</th>
                <th className="py-3 px-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {citizenReports.map(r => (
                <tr key={r.id} className="border-b border-slate-900 hover:bg-slate-900/30 text-slate-300">
                  <td className="py-3 px-2 font-bold">{r.title}</td>
                  <td className="py-3 px-2">{r.category}</td>
                  <td className="py-3 px-2">
                    <span className="px-2 py-0.5 rounded text-[9px] font-semibold bg-slate-800 text-blue-400 border border-slate-700">
                      {r.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-2 font-mono">रू {r.budgetEstimated} / {r.budgetSpent}</td>
                  <td className="py-3 px-2">{formatNepalTime(r.createdAt).split(',')[0]}</td>
                  <td className="py-3 px-2 text-right">
                    {r.status === 'Resolved' && (
                      <button 
                        onClick={() => setReopenId(r.id)} 
                        className="bg-rose-950 border border-rose-800 hover:bg-rose-900 text-rose-300 px-2.5 py-1 rounded font-semibold text-[10px] transition-colors"
                      >
                        Reopen Issue
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {reopenId && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 w-full max-w-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-200">Reopen Resolved Complaint</h3>
              <textarea placeholder="Describe why this is still unresolved..." value={reopenNotes} onChange={e => setReopenNotes(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-300" rows={3} />
              <input type="text" placeholder="Upload Reopen Photo URL" value={reopenImg} onChange={e => setReopenImg(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-300" />
              <div className="flex justify-end gap-2 text-xs font-bold">
                <button onClick={() => setReopenId(null)} className="px-3 py-1.5 border border-slate-800 rounded hover:bg-slate-800 text-slate-400">Cancel</button>
                <button onClick={() => handleReopen(reopenId)} className="px-3 py-1.5 bg-blue-600 rounded hover:bg-blue-700 text-white">Reopen</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  const selectedReport = reports.find(r => r.id === selectedReportId) || reports[0];
  const selectedReportComments = comments.filter(c => c.reportId === selectedReport?.id);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Reputation Points', val: currentUser.reputationPoints, icon: User, color: 'text-blue-400' },
          { label: 'My Submissions', val: citizenReports.length, icon: AlertTriangle, color: 'text-amber-400' },
          { label: 'Resolved Complaints', val: resolvedCount, icon: CheckCircle, color: 'text-emerald-400' },
          { label: 'District Active Issues', val: reports.filter(r => r.status !== 'Resolved').length, icon: RefreshCw, color: 'text-indigo-400' }
        ].map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="glass-panel p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">{kpi.label}</span>
                <h3 className="text-xl font-bold text-slate-100 mt-1">{kpi.val}</h3>
              </div>
              <Icon className={`w-8 h-8 ${kpi.color} opacity-40`} />
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 glass-panel p-4 space-y-4 max-h-[500px] overflow-y-auto">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Civic Feed</h3>
          <div className="space-y-3">
            {reports.map(r => (
              <div 
                key={r.id} 
                onClick={() => setSelectedReportId(r.id)}
                className={`p-3 rounded-lg border text-xs cursor-pointer transition-all duration-200 ${
                  selectedReport?.id === r.id 
                    ? 'bg-slate-800/60 border-blue-500/50' 
                    : 'bg-slate-900/30 border-slate-800/80 hover:bg-slate-800/20'
                }`}
              >
                <div className="flex justify-between font-bold text-slate-200">
                  <span>{r.title}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded ${r.priority === 'Emergency' ? 'bg-red-950 border border-red-800 text-red-400' : 'bg-slate-800 border border-slate-700 text-slate-300'}`}>
                    {r.priority}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">{r.description}</p>
                <div className="flex items-center justify-between text-[9px] text-slate-500 mt-3 font-mono">
                  <span>{r.category} • Ward {r.wardId}</span>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); supportReport(r.id); }}
                      className="flex items-center gap-0.5 hover:text-blue-400 transition-colors"
                    >
                      <ThumbsUp className="w-3 h-3" /> {r.supportCount}
                    </button>
                    <span className="flex items-center gap-0.5"><MessageSquare className="w-3 h-3" /> {comments.filter(c => c.reportId === r.id).length}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="h-[280px] rounded-xl overflow-hidden border border-slate-800">
            <LeafletMap reports={reports} activeReportId={selectedReport?.id} />
          </div>

          {selectedReport && (
            <div className="glass-panel p-5 space-y-4">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="text-base font-bold text-slate-100">{selectedReport.title}</h3>
                  <p className="text-[10px] text-slate-500 font-mono mt-1">📍 {selectedReport.address} • Submitted: {formatNepalTime(selectedReport.createdAt)}</p>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-blue-400 border border-slate-700">{selectedReport.status.replace('_', ' ')}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{selectedReport.description}</p>

              <div className="border-t border-slate-800/80 pt-4 space-y-3">
                <h4 className="text-xs font-bold text-slate-400">Comments & Activity Logs</h4>
                <div className="space-y-2.5 max-h-36 overflow-y-auto">
                  {selectedReportComments.map(c => (
                    <div key={c.id} className={`p-2.5 rounded text-xs ${c.isOfficialUpdate ? 'bg-blue-950/20 border border-blue-900/40' : 'bg-slate-900 border border-slate-850'}`}>
                      <div className="flex justify-between font-bold text-slate-300 text-[10px]">
                        <span>{c.userName} ({c.userRole})</span>
                        <span className="text-slate-500">{formatNepalTime(c.createdAt).split(',')[0]}</span>
                      </div>
                      <p className="text-slate-400 mt-1">{c.content}</p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input type="text" placeholder="Write a comment..." value={newCommentText} onChange={e => setNewCommentText(e.target.value)} className="flex-1 bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-300 focus:outline-none" />
                  <button onClick={() => { if(newCommentText) { addComment(selectedReport.id, newCommentText); setNewCommentText(''); } }} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-2 rounded text-xs transition-colors">Post</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default CitizenPortal;
