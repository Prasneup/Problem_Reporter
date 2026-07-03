import React, { useState, useEffect } from 'react';
import { useCivicStore } from '../stores/civicStore';
import { LeafletMap } from '../components/maps/LeafletMap';
import { formatNepalTime } from '../utils/civicUtils';
import type { PriorityLevel, ReportStatus } from '../types';
import { 
  ShieldAlert, ShieldCheck, Clock, FileText, Send, 
  MapPin, CheckCircle, Search, Filter, AlertCircle, PlayCircle
} from 'lucide-react';

export const AdminPortal: React.FC = () => {
  const { reports, assignDepartment } = useCivicStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [filterPriority, setFilterPriority] = useState<string>('All');
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  // Manual Routing States
  const [routeDept, setRouteDept] = useState('');
  const [routePriority, setRoutePriority] = useState<PriorityLevel>('Medium');
  const [routeRemarks, setRouteRemarks] = useState('');
  const [routeSuccess, setRouteSuccess] = useState(false);

  // Selected Report details
  const selectedReport = reports.find(r => r.id === selectedReportId);

  // Categories and Departments Mapping list
  const departments = [
    { name: 'Sanitation / Waste Management Mahashakha', email: 'garbage@ghorahimun.demo', key: 'Garbage / Waste Management' },
    { name: 'Road & Infrastructure Division', email: 'roads@ghorahimun.demo', key: 'Road Damage' },
    { name: 'Water Supply Department', email: 'water@ghorahimun.demo', key: 'Water Supply Problems' },
    { name: 'Drainage Department', email: 'drainage@ghorahimun.demo', key: 'Drainage / Sewer' },
    { name: 'Electrical Department', email: 'electric@ghorahimun.demo', key: 'Street Light / Electricity' },
    { name: 'Nepal Police / Traffic Police', email: 'police@ghorahimun.demo', key: 'Accident / Traffic Emergency' },
    { name: 'Fire Response Department', email: 'fire@ghorahimun.demo', key: 'Fire Emergency' },
    { name: 'Nepal Police', email: 'safety@ghorahimun.demo', key: 'Public Safety / Crime' }
  ];

  // Auto-detect routing selection and priority level when a report is selected
  useEffect(() => {
    if (selectedReport) {
      // Find matching department for report category
      const matched = departments.find(d => d.key === selectedReport.category);
      setRouteDept(matched ? matched.name : departments[0].name);

      // Auto force priority to Emergency for specific categories
      const isAutoEmergency = ['Accident / Traffic Emergency', 'Fire Emergency', 'Public Safety / Crime'].includes(selectedReport.category);
      setRoutePriority(isAutoEmergency ? 'Emergency' : selectedReport.priority);
      setRouteRemarks('');
      setRouteSuccess(false);
    }
  }, [selectedReportId]);

  // Statistics calculation
  const totalReports = reports.length;
  const newReports = reports.filter(r => r.status === 'Submitted').length;
  const pendingReports = reports.filter(r => r.status === 'Under_Review').length;
  const assignedReports = reports.filter(r => r.status === 'Assigned' || r.status === 'In_Progress').length;
  const resolvedReports = reports.filter(r => r.status === 'Resolved').length;
  const emergencyReports = reports.filter(r => r.priority === 'Emergency').length;

  // Filtered reports
  const filteredReports = reports.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || r.category === filterCategory;
    const matchesStatus = filterStatus === 'All' || r.status === filterStatus;
    const matchesPriority = filterPriority === 'All' || r.priority === filterPriority;
    return matchesSearch && matchesCategory && matchesStatus && matchesPriority;
  });

  const handleRouteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReportId) return;

    await assignDepartment(selectedReportId, routeDept, routeRemarks, routePriority, 'Assigned');
    setRouteSuccess(true);
    setTimeout(() => {
      setRouteSuccess(false);
      setSelectedReportId(null);
    }, 2000);
  };

  const getStatusBadge = (status: ReportStatus) => {
    switch (status) {
      case 'Submitted':
        return 'bg-yellow-50 text-yellow-600 border-yellow-100';
      case 'Under_Review':
        return 'bg-amber-50 text-amber-600 border-amber-200';
      case 'Assigned':
        return 'bg-blue-50 text-blue-600 border-blue-150';
      case 'In_Progress':
        return 'bg-indigo-50 text-indigo-600 border-indigo-100 animate-pulse';
      case 'Resolved':
        return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Closed':
        return 'bg-slate-100 text-slate-500 border-slate-200';
      default:
        return 'bg-slate-50 text-slate-500 border-slate-100';
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
        return 'bg-slate-100 text-slate-650 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 font-sans select-none text-slate-700">
      
      {/* 1. Header Banner */}
      <div className="glass-panel p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-blue-600" />
            <span>Ghorahi Sub-Metropolitan Admin Command Center</span>
          </h2>
          <p className="text-xs text-slate-500 font-semibold mt-1">Review community complaints, enforce manual department forwarding, and inspect active budgets.</p>
        </div>
        <div className="text-[10px] bg-blue-50 text-blue-600 border border-blue-100 px-3 py-1.5 rounded-lg font-mono font-bold select-none">
          MUNICIPALITY CODE: GHORAHI-082
        </div>
      </div>

      {/* 2. Statistical KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        {[
          { label: 'Total Reports', val: totalReports, color: 'bg-slate-50 text-slate-600', border: 'border-slate-200', icon: FileText },
          { label: 'New Submitted', val: newReports, color: 'bg-yellow-50 text-yellow-600', border: 'border-yellow-100', icon: Clock },
          { label: 'Under Review', val: pendingReports, color: 'bg-amber-50 text-amber-600', border: 'border-amber-150', icon: AlertCircle },
          { label: 'Assigned / In Transit', val: assignedReports, color: 'bg-blue-50 text-blue-600', border: 'border-blue-100', icon: Send },
          { label: 'Resolved Issues', val: resolvedReports, color: 'bg-emerald-50 text-emerald-600', border: 'border-emerald-100', icon: CheckCircle },
          { label: 'Emergency Alerts', val: emergencyReports, color: 'bg-red-50 text-red-600', border: 'border-red-150 animate-pulse', icon: ShieldAlert }
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

      {/* 3. Main Dashboard Layout (GIS Map & Forwarding Pane) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Live GIS Map Component */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 flex flex-col shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Live GIS Map Dashboard</h3>
              <p className="text-[10px] text-slate-400 mt-0.5 font-semibold">Real-time color-coded complaint layout inside Ghorahi</p>
            </div>
            <div className="flex gap-4 text-[9px] text-slate-500 font-bold">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> Emergency</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Pending</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> Assigned</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Resolved</span>
            </div>
          </div>
          <div className="h-[320px] rounded-xl overflow-hidden border border-slate-200">
            <LeafletMap reports={reports} activeReportId={selectedReportId || undefined} />
          </div>
        </div>

        {/* Manual Department Forwarding Pane */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col shadow-sm">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 pb-3 border-b border-slate-100">
            Manual Department Routing Panel
          </h3>

          {!selectedReportId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <Send className="w-8 h-8 text-slate-350 mb-2.5" />
              <div className="text-xs font-bold text-slate-650">No Report Selected</div>
              <p className="text-[10px] text-slate-400 mt-1 max-w-[200px]">Click on the "Forward" button of any submitted complaint in the list below to route it to a department.</p>
            </div>
          ) : (
            <form onSubmit={handleRouteSubmit} className="space-y-3.5 flex-1 flex flex-col text-xs font-bold">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1.5 text-slate-600">
                <div className="text-slate-800 font-extrabold truncate text-xs">{selectedReport?.title}</div>
                <div className="text-[10px] text-slate-400 font-bold">Category: {selectedReport?.category}</div>
                <div className="text-[10px] text-slate-400 font-bold truncate">Location: {selectedReport?.address}</div>
                
                {/* Embedded Video Evidence Player */}
                {selectedReport?.images && selectedReport.images.length > 0 && (
                  <div className="mt-2.5 flex items-center gap-2">
                    <span className="text-[9px] font-bold text-blue-650 bg-blue-50 border border-blue-150 px-2 py-0.5 rounded">Evidence Attached</span>
                    {selectedReport.images[0].url.endsWith('.mp4') && (
                      <span className="text-[9px] font-bold text-red-650 bg-red-50 border border-red-150 px-2 py-0.5 rounded flex items-center gap-1">
                        <PlayCircle className="w-3 h-3" /> Video proof
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Department Dropdown Selector */}
              <div className="space-y-1.5">
                <label className="text-slate-500 block">Forward to Ghorahi Mahashakha:</label>
                <select 
                  required
                  value={routeDept} 
                  onChange={(e) => setRouteDept(e.target.value)} 
                  className="w-full bg-slate-50 border border-slate-255 rounded-xl p-2.5 text-xs text-slate-700 font-bold focus:bg-white focus:outline-none"
                >
                  {departments.map((d, idx) => (
                    <option key={idx} value={d.name}>{d.name} ({d.email})</option>
                  ))}
                </select>
              </div>

              {/* Priority Select */}
              <div className="space-y-1.5">
                <label className="text-slate-500 block">Set Processing Priority:</label>
                <select 
                  value={routePriority} 
                  onChange={(e) => setRoutePriority(e.target.value as PriorityLevel)} 
                  className="w-full bg-slate-50 border border-slate-255 rounded-xl p-2.5 text-xs text-slate-700 font-bold focus:bg-white focus:outline-none"
                >
                  {['Low', 'Medium', 'High', 'Emergency'].map(p => (
                    <option key={p} value={p}>{p} Priority</option>
                  ))}
                </select>
              </div>

              {/* Remarks notes */}
              <div className="space-y-1.5 flex-1 flex flex-col">
                <label className="text-slate-500 block">Urgent Action Remarks:</label>
                <textarea 
                  required
                  rows={2} 
                  placeholder="e.g. Please dispatch sanitary crew to clear blocked drain immediately..." 
                  value={routeRemarks} 
                  onChange={(e) => setRouteRemarks(e.target.value)} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-700 font-bold focus:bg-white focus:outline-none flex-1 placeholder-slate-400" 
                />
              </div>

              {/* Submit Forward button */}
              <button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {routeSuccess ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Report Forwarded!</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Forward to Department</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* 4. Filter & Search Controls */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Active Ghorahi Complaints Queue</h3>
          <div className="flex items-center gap-2 w-full md:w-auto flex-1 md:flex-none">
            <div className="relative flex-1 md:w-64">
              <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search className="w-3.5 h-3.5 text-slate-450" />
              </span>
              <input 
                type="text" 
                placeholder="Search by Title or Address..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="w-full bg-slate-50 border border-slate-250 rounded-xl py-1.5 pl-8.5 pr-3 text-xs font-bold text-slate-700 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500 transition-colors" 
              />
            </div>
          </div>
        </div>

        {/* Filter Badges Row */}
        <div className="flex flex-wrap gap-3.5 text-[10px] font-bold text-slate-500 bg-slate-50/50 p-3 rounded-xl border border-slate-200/60">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-450" />
            <span>Filters:</span>
          </div>
          
          {/* Category Filter */}
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-700 font-bold focus:outline-none">
            <option value="All">All Categories</option>
            {['Garbage / Waste Management', 'Road Damage', 'Water Supply Problems', 'Drainage / Sewer', 'Street Light / Electricity', 'Public Infrastructure', 'Accident / Traffic Emergency', 'Fire Emergency', 'Public Safety / Crime'].map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-700 font-bold focus:outline-none">
            <option value="All">All Statuses</option>
            {['Submitted', 'Under_Review', 'Assigned', 'In_Progress', 'Resolved', 'Closed'].map(s => (
              <option key={s} value={s}>{s.replace('_', ' ')}</option>
            ))}
          </select>

          {/* Priority Filter */}
          <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-700 font-bold focus:outline-none">
            <option value="All">All Priorities</option>
            {['Low', 'Medium', 'High', 'Emergency'].map(p => (
              <option key={p} value={p}>{p} Priority</option>
            ))}
          </select>
        </div>

        {/* 5. Reports Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/50 select-none">
                <th className="py-3 px-3">Complaint Details</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Urgency Priority</th>
                <th className="py-3 px-3">Assigned Department</th>
                <th className="py-3 px-3">Current Status</th>
                <th className="py-3 px-3">Created Date</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400 font-bold">
                    No matching complaints found in Ghorahi.
                  </td>
                </tr>
              ) : (
                filteredReports.map((r) => (
                  <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50/50 text-slate-600 font-semibold">
                    <td className="py-3.5 px-3 min-w-[200px]">
                      <div className="font-bold text-slate-800 leading-tight">{r.title}</div>
                      <div className="text-[10px] text-slate-450 mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate max-w-[220px]">{r.address}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-[11px] font-bold text-slate-700">{r.category}</td>
                    <td className="py-3.5 px-3">
                      <span className={`px-2 py-0.5 border rounded-lg text-[9px] ${getPriorityBadge(r.priority)}`}>
                        {r.priority}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-700 font-bold truncate max-w-[150px]">
                      {r.assignedDepartment || (
                        <span className="text-slate-400 italic">Not Assigned</span>
                      )}
                    </td>
                    <td className="py-3.5 px-3">
                      <span className={`px-2 py-0.5 border rounded-lg text-[9px] font-extrabold uppercase tracking-wide ${getStatusBadge(r.status)}`}>
                        {r.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-mono text-[10px] text-slate-400">
                      {formatNepalTime(r.createdAt).split(',')[0]}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      {r.status === 'Submitted' || r.status === 'Under_Review' ? (
                        <button 
                          onClick={() => setSelectedReportId(r.id)}
                          className="bg-blue-600 text-white hover:bg-blue-700 px-3 py-1 rounded-xl text-[10px] font-extrabold cursor-pointer transition-colors shadow-sm inline-flex items-center gap-1"
                        >
                          <Send className="w-3 h-3" />
                          <span>Forward</span>
                        </button>
                      ) : (
                        <button 
                          onClick={() => setSelectedReportId(r.id)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-655 px-3 py-1 rounded-xl text-[10px] font-bold cursor-pointer transition-colors border border-slate-250 inline-flex items-center gap-1"
                        >
                          <span>Review</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPortal;
