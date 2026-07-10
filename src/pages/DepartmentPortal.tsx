import React, { useState } from 'react';
import { useCivicStore } from '../stores/civicStore';
import type { PriorityLevel, ReportStatus } from '../types';
import { 
  Briefcase, CheckCircle, Clock, FileText, Send, 
  MapPin, Check
} from 'lucide-react';

export const DepartmentPortal: React.FC = () => {
  const { reports, currentUser, resolveReportByDepartment, updateReportStatus } = useCivicStore();
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  // Resolution Update States
  const [targetStatus, setTargetStatus] = useState<ReportStatus>('In_Progress');
  const [notes, setNotes] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [success, setSuccess] = useState(false);

  const selectedReport = reports.find(r => r.id === selectedReportId);

  // Filter reports belonging strictly to this department officer's Mahashakha
  const deptReports = reports.filter(r => r.assignedDepartment === currentUser.department);

  const assignedCount = deptReports.filter(r => r.status === 'Assigned').length;
  const progressCount = deptReports.filter(r => r.status === 'In_Progress').length;
  const resolvedCount = deptReports.filter(r => r.status === 'Resolved').length;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReportId) return;

    if (targetStatus === 'Resolved') {
      await resolveReportByDepartment(selectedReportId, notes, proofUrl || undefined);
    } else {
      await updateReportStatus(selectedReportId, targetStatus, notes);
    }

    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setSelectedReportId(null);
      setNotes('');
      setProofUrl('');
    }, 2000);
  };

  const getStatusBadge = (status: ReportStatus) => {
    switch (status) {
      case 'Assigned':
        return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'In_Progress':
        return 'bg-indigo-50 text-indigo-600 border-indigo-100 animate-pulse';
      case 'Resolved':
        return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Closed':
        return 'bg-slate-100 text-slate-500 border-slate-200';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  const getPriorityBadge = (priority: PriorityLevel) => {
    switch (priority) {
      case 'Emergency':
        return 'bg-red-50 text-red-600 border-red-200 font-extrabold';
      case 'Critical':
        return 'bg-rose-50 text-rose-600 border-rose-150 font-bold';
      case 'High':
        return 'bg-orange-50 text-orange-600 border-orange-100';
      case 'Medium':
        return 'bg-blue-50 text-blue-600 border-blue-100';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 font-sans select-none text-slate-700">
      
      {/* 1. Header Banner */}
      <div className="glass-panel p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-blue-600" />
            <span>Mahashakha Workspace Portal</span>
          </h2>
          <p className="text-xs text-slate-500 font-semibold mt-1">Logged in: <span className="font-extrabold text-blue-600">{currentUser.name}</span> | Department: <span className="font-extrabold text-slate-800">{currentUser.department || 'Not Specified'}</span></p>
        </div>
        <div className="text-[10px] bg-slate-50 border border-slate-200 text-slate-500 px-3 py-1.5 rounded-lg font-mono font-bold">
          OFFICER ID: {currentUser.id.toUpperCase()}
        </div>
      </div>

      {/* 2. Statistical KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Assigned Cases', val: deptReports.length, color: 'bg-slate-50 text-slate-600', border: 'border-slate-200', icon: FileText },
          { label: 'Pending Action', val: assignedCount, color: 'bg-blue-50 text-blue-600', border: 'border-blue-100', icon: Clock },
          { label: 'Work In Progress', val: progressCount, color: 'bg-indigo-50 text-indigo-600', border: 'border-indigo-100', icon: Send },
          { label: 'Completed Resolutions', val: resolvedCount, color: 'bg-emerald-50 text-emerald-600', border: 'border-emerald-100', icon: CheckCircle }
        ].map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className={`bg-white border ${kpi.border} rounded-2xl p-4 flex items-center justify-between shadow-sm`}>
              <div className="space-y-1">
                <span className="text-[9px] text-slate-400 font-extrabold uppercase block">{kpi.label}</span>
                <h3 className="text-lg font-bold text-slate-800 font-mono leading-none mt-1">{kpi.val}</h3>
              </div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${kpi.color}`}>
                <Icon className="w-4.5 h-4.5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Main Action Layout (Complaint Queue & Resolution Panel) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Department Assigned Queue */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 flex flex-col shadow-sm">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 pb-3 border-b border-slate-100">
            Assigned Complaints Queue ({deptReports.length})
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/50">
                  <th className="py-3 px-3">Complaint Details</th>
                  <th className="py-3 px-3">Priority</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 font-mono">Est Budget</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {deptReports.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-slate-400 font-bold">
                      No complaints currently assigned to your department.
                    </td>
                  </tr>
                ) : (
                  deptReports.map((r) => (
                    <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50/50 text-slate-600 font-semibold">
                      <td className="py-3.5 px-3 min-w-[200px]">
                        <div className="font-bold text-slate-800 leading-tight">{r.title}</div>
                        <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                          <MapPin className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate max-w-[200px]">{r.address}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className={`px-2 py-0.5 border rounded-lg text-[9px] ${getPriorityBadge(r.priority)}`}>
                          {r.priority}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className={`px-2 py-0.5 border rounded-lg text-[9px] font-extrabold uppercase tracking-wide ${getStatusBadge(r.status)}`}>
                          {r.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-mono text-[10px] text-slate-700">
                        रू {r.budgetEstimated}
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <button 
                          onClick={() => {
                            setSelectedReportId(r.id);
                            setTargetStatus(r.status === 'Assigned' ? 'In_Progress' : r.status);
                          }}
                          className="bg-blue-600 text-white hover:bg-blue-700 px-3.5 py-1 rounded-xl text-[10px] font-extrabold cursor-pointer transition-colors shadow-sm"
                        >
                          Process
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Resolution Panel */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col shadow-sm">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 pb-3 border-b border-slate-100">
            Resolution & Action Form
          </h3>

          {!selectedReportId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <Briefcase className="w-8 h-8 text-slate-350 mb-2.5" />
              <div className="text-xs font-bold text-slate-700">No Complaint Selected</div>
              <p className="text-[10px] text-slate-400 mt-1 max-w-[200px]">Click "Process" on any complaint in your queue to update its progress or resolve it.</p>
            </div>
          ) : (
            <form onSubmit={handleUpdate} className="space-y-4 flex-1 flex flex-col text-xs font-bold">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1.5 text-slate-700">
                <div className="text-slate-800 font-extrabold truncate text-xs">{selectedReport?.title}</div>
                <div className="text-[10px] text-slate-400 font-bold truncate">Location: {selectedReport?.address}</div>
                
                {/* Visual Image Carousel */}
                {selectedReport?.images && selectedReport.images.length > 0 && (
                  <div className="mt-2.5">
                    <span className="text-[9px] font-bold text-slate-500">CITIZEN EVIDENCE:</span>
                    <div className="mt-1 flex gap-1.5 overflow-x-auto py-1">
                      {selectedReport.images.map((img, i) => (
                        <div key={i} className="relative w-12 h-12 rounded border border-slate-200 overflow-hidden shrink-0">
                          <img src={img.url} alt="complaint proof" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Status Update Dropdown */}
              <div className="space-y-1.5">
                <label className="text-slate-500 block">Update Status:</label>
                <select 
                  value={targetStatus} 
                  onChange={(e) => setTargetStatus(e.target.value as ReportStatus)} 
                  className="w-full bg-slate-50 border border-slate-255 rounded-xl p-2.5 text-xs text-slate-700 font-bold focus:bg-white focus:outline-none"
                >
                  {['In_Progress', 'Resolved'].map(s => (
                    <option key={s} value={s}>{s.replace('_', ' ')}</option>
                  ))}
                </select>
              </div>

              {/* Resolution proof upload */}
              {targetStatus === 'Resolved' && (
                <div className="space-y-1.5">
                  <label className="text-slate-500 block">Resolution Image Proof URL (Optional):</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Or paste resolution image link..." 
                      value={proofUrl} 
                      onChange={(e) => setProofUrl(e.target.value)} 
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-700 font-bold focus:bg-white focus:outline-none placeholder-slate-400" 
                    />
                  </div>
                </div>
              )}

              {/* Progress/Resolution Remarks */}
              <div className="space-y-1.5 flex-1 flex flex-col">
                <label className="text-slate-500 block">Work Resolution Remarks:</label>
                <textarea 
                  required
                  rows={3} 
                  placeholder="Describe resolution details or current progress status..." 
                  value={notes} 
                  onChange={(e) => setNotes(e.target.value)} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-700 font-bold focus:bg-white focus:outline-none flex-1 placeholder-slate-400" 
                />
              </div>

              {/* Submit Update button */}
              <button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {success ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Progress Updated!</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Update Complaint Status</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default DepartmentPortal;
