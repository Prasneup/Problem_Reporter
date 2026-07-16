import React, { useState, useEffect } from 'react';
import { useCivicStore } from '../../stores/civicStore';
import { supabase } from '../../lib/supabase';
import { 
  X, Search, MapPin, Calendar, Info, 
  MessageSquare, Send, Shield 
} from 'lucide-react';

interface SearchResultsViewProps {
  query: string;
  onClose: () => void;
}

export const SearchResultsView: React.FC<SearchResultsViewProps> = ({ query, onClose }) => {
  const { reports, comments, addComment } = useCivicStore();
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [newCommentText, setNewCommentText] = useState('');

  useEffect(() => {
    const loadResults = async () => {
      setLoading(true);
      try {
        // Query Supabase reports table matching query on title, description, or address
        const { data: dbReports, error: dbError } = await supabase
          .from('reports')
          .select('*, report_images(*), report_videos(*)')
          .or(`title.ilike.%${query}%,description.ilike.%${query}%,address.ilike.%${query}%`);

        if (dbError) throw dbError;

        if (dbReports && dbReports.length > 0) {
          // Map to match the store Report type
          const mapped = dbReports.map(r => ({
            id: r.id,
            title: r.title,
            description: r.description,
            category: r.category,
            latitude: r.latitude,
            longitude: r.longitude,
            address: r.address,
            status: r.status,
            priority: r.priority,
            supportCount: r.support_count || 0,
            duplicateCount: r.duplicate_count || 0,
            assignedDepartment: r.assigned_department,
            budgetEstimated: Number(r.budget_estimated || 0),
            budgetSpent: Number(r.budget_spent || 0),
            createdAt: r.created_at,
            updatedAt: r.updated_at,
            images: (r.report_images || []).map((img: any) => ({ url: img.url, imageType: img.image_type })),
            videos: (r.report_videos || []).map((vid: any) => ({ url: vid.url }))
          }));
          setResults(mapped);
        } else {
          // Local fallback filter
          const filtered = reports.filter(r => 
            (r.title || '').toLowerCase().includes(query.toLowerCase()) ||
            (r.description || '').toLowerCase().includes(query.toLowerCase()) ||
            (r.address || '').toLowerCase().includes(query.toLowerCase())
          );
          setResults(filtered);
        }
      } catch (err) {
        console.warn("Database query failed, using local filter fallback:", err);
        const filtered = reports.filter(r => 
          (r.title || '').toLowerCase().includes(query.toLowerCase()) ||
          (r.description || '').toLowerCase().includes(query.toLowerCase()) ||
          (r.address || '').toLowerCase().includes(query.toLowerCase())
        );
        setResults(filtered);
      } finally {
        setLoading(false);
      }
    };

    if (query) {
      loadResults();
    }
  }, [query, reports]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() || !selectedReport) return;
    try {
      await addComment(selectedReport.id, newCommentText);
      setNewCommentText('');
    } catch (err) {
      console.error("Failed to add comment:", err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Resolved': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Submitted': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Under_Review': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'In_Progress': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Closed': return 'bg-rose-50 text-rose-700 border-rose-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="glass-panel p-6 space-y-6 font-sans relative">
      {/* Search Header */}
      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2 text-slate-800">
            <Search className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold">Global Search Results</h2>
          </div>
          <p className="text-[10px] text-slate-500 font-bold mt-0.5">
            Showing results matching keyword: <strong className="text-blue-650 font-extrabold">"{query}"</strong>
          </p>
        </div>
        <button 
          onClick={onClose}
          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Results Listing */}
      {loading ? (
        <div className="py-20 text-center text-xs font-bold text-slate-400 animate-pulse">
          Searching reports database...
        </div>
      ) : results.length === 0 ? (
        <div className="py-20 text-center space-y-2">
          <Info className="w-8 h-8 text-slate-350 mx-auto" />
          <p className="text-xs font-bold text-slate-400">No reports found matching your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Results List */}
          <div className="lg:col-span-2 space-y-4 max-h-[62vh] overflow-y-auto pr-1">
            {results.map((report) => (
              <div 
                key={report.id}
                onClick={() => setSelectedReport(report)}
                className={`bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3 hover:border-blue-500/40 hover:shadow-md transition-all cursor-pointer ${
                  selectedReport?.id === report.id ? 'ring-1 ring-blue-500 border-blue-500/40' : ''
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wide">
                      {report.category}
                    </span>
                    <h3 className="text-xs font-bold text-slate-800">{report.title}</h3>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase border ${getStatusColor(report.status)}`}>
                    {report.status}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 font-bold leading-relaxed line-clamp-2">
                  {report.description}
                </p>
                <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-slate-350" />
                  <span>{report.address}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Report Detail Sidebar */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-sm self-start min-h-[50vh] flex flex-col justify-between">
            {selectedReport ? (
              <div className="space-y-5 flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <span className="bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wide">
                        {selectedReport.category}
                      </span>
                      <h4 className="text-xs font-bold text-slate-800">{selectedReport.title}</h4>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase border ${getStatusColor(selectedReport.status)}`}>
                      {selectedReport.status}
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-500 font-bold leading-relaxed whitespace-pre-wrap">
                    {selectedReport.description}
                  </p>

                  <div className="space-y-2 border-t border-slate-200/60 pt-3 text-[10px] font-semibold text-slate-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{selectedReport.address} (Ward {selectedReport.wardId})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Reported: {new Date(selectedReport.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="w-3.5 h-3.5 text-slate-400" />
                      <span>Priority: <strong className="text-slate-850 font-bold">{selectedReport.priority}</strong></span>
                    </div>
                  </div>

                  {/* Comments feed */}
                  <div className="border-t border-slate-200/60 pt-3 space-y-3">
                    <h5 className="text-[10px] font-bold text-slate-700 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                      <span>Discussion & Comments ({(comments || []).filter(c => c.reportId === selectedReport.id).length})</span>
                    </h5>

                    <div className="space-y-2 max-h-[16vh] overflow-y-auto pr-1">
                      {(comments || []).filter(c => c.reportId === selectedReport.id).length === 0 ? (
                        <div className="text-[9px] font-bold text-slate-400 italic">No comments yet.</div>
                      ) : (
                        (comments || []).filter(c => c.reportId === selectedReport.id).map(c => (
                          <div key={c.id} className="bg-white border border-slate-150 rounded-xl p-2.5 space-y-0.5">
                            <div className="flex justify-between items-center text-[9px] font-bold text-slate-500">
                              <span className="text-slate-700">{c.userName || 'Citizen'}</span>
                              <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                            </div>
                            <p className="text-[9.5px] text-slate-600 font-semibold leading-relaxed">{c.content}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Reply Form */}
                <form onSubmit={handleAddComment} className="flex gap-1.5 border-t border-slate-200/60 pt-3">
                  <input 
                    type="text" 
                    placeholder="Write a comment..." 
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    className="flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-[9.5px] font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                    required
                  />
                  <button 
                    type="submit" 
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-[9px] p-1.5 rounded-lg flex items-center justify-center cursor-pointer"
                  >
                    <Send className="w-3 h-3" />
                  </button>
                </form>
              </div>
            ) : (
              <div className="flex-1 flex flex-col justify-center items-center text-center space-y-1.5 py-10">
                <Info className="w-6 h-6 text-slate-350" />
                <p className="text-[10px] font-bold text-slate-400">Select a report from the search list to inspect details.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
