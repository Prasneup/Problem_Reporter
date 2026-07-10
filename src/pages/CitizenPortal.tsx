import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { useCivicStore } from '../stores/civicStore';
import { LeafletMap } from '../components/maps/LeafletMap';
import { ReportForm } from '../components/forms/ReportForm';
import { reportService } from '../services/reportService';
import { supabase } from '../lib/supabase';
import { formatNepalTime } from '../utils/civicUtils';
import { useTranslation } from '../hooks/useTranslation';
import {
  AlertTriangle, Sun, Clock, Users, Phone, Map, FileText, 
  MessageCircle, Info, CheckCircle, RefreshCw, EyeOff, Award, Globe, 
  MessageSquare, Shield, ArrowRight, ThumbsUp, Send, X, MapPin, Play,
  Eye, Pencil, Trash2, Image, FileDown, Star, Search, 
  ArrowUpDown, Plus, AlertCircle, Bell, ClipboardList
} from 'lucide-react';
import { MediaLightbox } from '../components/common/MediaLightbox';
import ghorahiBanner from '../assets/ghorahi_banner.jpg';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, AreaChart, Area, CartesianGrid } from 'recharts';


interface CitizenPortalProps {
  activeView: string;
  setCurrentTab: (tab: string) => void;
}

// Category fallback Unsplash banners
const CATEGORY_IMAGES: Record<string, string> = {
  'Garbage / Waste Management': 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=400&auto=format&fit=crop&q=60',
  'Road Damage': 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?w=400&auto=format&fit=crop&q=60',
  'Water Supply Problems': 'https://images.unsplash.com/photo-1581093588401-f3c22d75ba2e?w=400&auto=format&fit=crop&q=60',
  'Drainage / Sewer': 'https://images.unsplash.com/photo-1542060748-10c28b629f6f?w=400&auto=format&fit=crop&q=60',
  'Street Light / Electricity': 'https://images.unsplash.com/photo-1509395062183-67c5ad6faff9?w=400&auto=format&fit=crop&q=60',
  'Public Infrastructure': 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?w=400&auto=format&fit=crop&q=60',
  'Accident / Traffic Emergency': 'https://images.unsplash.com/photo-1506015391300-4802dc74de2e?w=400&auto=format&fit=crop&q=60',
  'Fire Emergency': 'https://images.unsplash.com/photo-1508873696983-2df519f0397e?w=400&auto=format&fit=crop&q=60',
  'Public Safety / Crime': 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400&auto=format&fit=crop&q=60',
  default: 'https://images.unsplash.com/photo-1584467541268-b040f83be3fd?w=400&auto=format&fit=crop&q=60'
};

const MediaPreview: React.FC<{ report: any; onClickMedia: (idx: number) => void }> = ({ report, onClickMedia }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const hasVideo = report.videos && report.videos.length > 0;
  const hasImages = report.images && report.images.length > 0;
  
  // Resolve first cover media
  let mediaUrl = '';
  let mediaType: 'image' | 'video' = 'image';

  if (hasVideo) {
    mediaUrl = report.videos[0].url;
    mediaType = 'video';
  } else if (hasImages) {
    mediaUrl = report.images[0].url;
    mediaType = 'image';
  } else {
    // Fallback static placeholder
    mediaUrl = CATEGORY_IMAGES[report.category] || CATEGORY_IMAGES.default;
    mediaType = 'image';
  }

  // Calculate remaining count
  const imageCount = report.images?.length || 0;
  const videoCount = report.videos?.length || 0;
  const totalCount = imageCount + videoCount;

  useEffect(() => {
    // Reset state when report changes
    setLoading(true);
    setError(false);
  }, [report.id]);

  const handleMediaClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hasImages && !hasVideo) return; // ignore static placeholders
    onClickMedia(0); // open first item
  };

  return (
    <div 
      onClick={handleMediaClick}
      className="w-full h-full relative overflow-hidden group cursor-pointer"
    >
      {/* Loading Skeleton */}
      {loading && (
        <div className="absolute inset-0 bg-slate-100 animate-pulse flex items-center justify-center">
          <RefreshCw className="w-5 h-5 text-slate-300 animate-spin" />
        </div>
      )}

      {/* Media Rendering */}
      {mediaType === 'video' ? (
        <div className="w-full h-full relative bg-slate-950">
          <video
            src={mediaUrl}
            className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
              loading ? 'opacity-0' : 'opacity-100'
            }`}
            preload="metadata"
            muted
            onLoadedData={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              setError(true);
            }}
          />
          {!loading && !error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
              <div className="p-2 bg-white/95 text-slate-800 rounded-full shadow-lg scale-95 group-hover:scale-105 transition-all">
                <Play className="w-3.5 h-3.5 fill-current text-blue-600" />
              </div>
            </div>
          )}
        </div>
      ) : (
        <img
          src={error ? CATEGORY_IMAGES[report.category] || CATEGORY_IMAGES.default : mediaUrl}
          alt={report.title}
          className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
            loading ? 'opacity-0' : 'opacity-100'
          }`}
          loading="lazy"
          onLoad={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setError(true);
          }}
        />
      )}

      {/* Media Type & Count Badges */}
      {!loading && (
        <>
          {/* Top Left: Media Format Badge */}
          {(hasVideo || hasImages) && (
            <span className="absolute top-2.5 left-2.5 bg-blue-600/90 text-white px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wide shadow-sm z-10">
              {hasVideo ? 'Video' : 'Image'}
            </span>
          )}

          {/* Bottom Right: Multiple Media Indicator Badge */}
          {totalCount > 1 && (
            <span className="absolute bottom-2.5 right-2.5 bg-black/75 backdrop-blur-sm text-white px-2 py-0.5 rounded-lg text-[8px] font-extrabold shadow-sm z-10">
              +{totalCount - 1} Media
            </span>
          )}
        </>
      )}
    </div>
  );
};

// Self-contained coordinates display map inside detail modal
const ModalMap: React.FC<{ latitude: number; longitude: number }> = ({ latitude, longitude }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!mapRef.current) return;
    const map = L.map(mapRef.current, { zoomControl: false, attributionControl: false }).setView([latitude, longitude], 14);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png').addTo(map);
    L.marker([latitude, longitude]).addTo(map);
    return () => {
      map.remove();
    };
  }, [latitude, longitude]);

  return <div ref={mapRef} className="w-full h-36 rounded-xl overflow-hidden border border-slate-200 mt-2 shadow-inner" />;
};

export const CitizenPortal: React.FC<CitizenPortalProps> = ({ activeView, setCurrentTab }) => {
  const { t, language } = useTranslation();
  const { reports, currentUser, reopenReport, supportReport, addComment, comments, userLikes, editReport, deleteReport, notifications, dismissNotification } = useCivicStore();
  const [selectedReportId] = useState<string | undefined>(undefined);

  const [reopenId, setReopenId] = useState<string | null>(null);
  const [reopenNotes, setReopenNotes] = useState('');
  const [reopenImg, setReopenImg] = useState('');
  
  // Refactored State Pattern: Explicit Selected Complaint Id tracking
  const [activeComplaintId, setActiveComplaintId] = useState<string | null>(null);
  const [newCommentText, setNewCommentText] = useState('');

  // Search, Filters & Sorting in My Reports
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterWard, setFilterWard] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  
  const [sortField, setSortField] = useState<'createdAt' | 'status' | 'category' | 'priority'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Modals for actions
  const [viewDetailReport, setViewDetailReport] = useState<any | null>(null);
  const [editReportData, setEditReportData] = useState<any | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [mapLocationReport, setMapLocationReport] = useState<any | null>(null);
  const [ratingReport, setRatingReport] = useState<any | null>(null);
  
  // Rating states
  const [ratingStars, setRatingStars] = useState(5);
  const [ratingFeedback, setRatingFeedback] = useState('');

  // Tabs for the detail modal
  const [detailModalTab, setDetailModalTab] = useState<'overview' | 'timeline' | 'discussion'>('overview');

  // Lightbox Media Viewer State
  const [lightboxData, setLightboxData] = useState<{ mediaList: { type: 'image' | 'video'; url: string; title: string }[]; initialIndex: number } | null>(null);

  const openLightboxForReport = (report: any, initialIndex: number = 0) => {
    const list: { type: 'image' | 'video'; url: string; title: string }[] = [];
    if (report.videos && report.videos.length > 0) {
      report.videos.forEach((v: any) => {
        list.push({ type: 'video', url: v.url, title: report.title });
      });
    }
    if (report.images && report.images.length > 0) {
      report.images.forEach((img: any) => {
        list.push({ type: 'image', url: img.url, title: report.title });
      });
    }
    if (list.length > 0) {
      setLightboxData({ mediaList: list, initialIndex });
    }
  };

  const getComplaintId = (id: string, dateStr: string) => {
    const year = new Date(dateStr).getFullYear() || 2026;
    const shortId = id.substring(0, 6).toUpperCase();
    return `GSC-${year}-${shortId}`;
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'Emergency': return <span className="bg-red-100 text-red-750 border border-red-200 px-2 py-0.5 rounded text-[9px] font-extrabold flex items-center gap-1 w-max">🚨 Emergency</span>;
      case 'Critical': return <span className="bg-red-50 text-red-600 border border-red-100 px-2 py-0.5 rounded text-[9px] font-extrabold flex items-center gap-1 w-max">🔴 Critical</span>;
      case 'High': return <span className="bg-orange-50 text-orange-600 border border-orange-100 px-2 py-0.5 rounded text-[9px] font-extrabold flex items-center gap-1 w-max">🟠 High</span>;
      case 'Medium': return <span className="bg-amber-50 text-amber-600 border border-amber-100 px-2 py-0.5 rounded text-[9px] font-extrabold flex items-center gap-1 w-max">🟡 Medium</span>;
      case 'Low':
      default: return <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded text-[9px] font-extrabold flex items-center gap-1 w-max">🟢 Low</span>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Submitted': return <span className="bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded text-[9px] font-extrabold uppercase">Submitted</span>;
      case 'Under_Review': return <span className="bg-blue-50 text-blue-600 border border-blue-200 px-2 py-0.5 rounded text-[9px] font-extrabold uppercase">Under Review</span>;
      case 'Assigned': return <span className="bg-purple-50 text-purple-600 border border-purple-100 px-2 py-0.5 rounded text-[9px] font-extrabold uppercase">Assigned</span>;
      case 'In_Progress': return <span className="bg-orange-50 text-orange-600 border border-orange-100 px-2 py-0.5 rounded text-[9px] font-extrabold uppercase">In Progress</span>;
      case 'Resolved': return <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded text-[9px] font-extrabold uppercase">Resolved</span>;
      case 'Closed': return <span className="bg-green-700 text-white border border-green-800 px-2 py-0.5 rounded text-[9px] font-extrabold uppercase">Closed</span>;
      default: return <span className="bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded text-[9px] font-extrabold uppercase">{status}</span>;
    }
  };

  const getTimelineSteps = (status: string) => {
    const steps = [
      { key: 'Submitted', label: 'Submitted' },
      { key: 'Under_Review', label: 'Under Review' },
      { key: 'Assigned', label: 'Assigned' },
      { key: 'In_Progress', label: 'In Progress' },
      { key: 'Resolved', label: 'Resolved' },
      { key: 'Closed', label: 'Closed' }
    ];
    
    const currentIndex = steps.findIndex(s => s.key === status);
    
    return (
      <div className="flex items-center justify-between w-full mt-4 bg-slate-50 p-4 rounded-xl border border-slate-200/50">
        {steps.map((step, idx) => {
          const isCompleted = idx <= currentIndex;
          const isActive = idx === currentIndex;
          return (
            <React.Fragment key={step.key}>
              <div className="flex flex-col items-center flex-1 relative">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border transition-colors ${
                  isCompleted 
                    ? 'bg-blue-600 border-blue-600 text-white' 
                    : 'bg-white border-slate-300 text-slate-400'
                } ${isActive ? 'ring-4 ring-blue-100' : ''}`}>
                  {isCompleted ? '✓' : idx + 1}
                </div>
                <span className={`text-[9px] mt-1.5 font-extrabold ${isActive ? 'text-blue-600' : 'text-slate-500'}`}>
                  {step.label}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div className={`h-0.5 flex-1 transition-colors ${idx < currentIndex ? 'bg-blue-600' : 'bg-slate-200'}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  const handleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const renderSortHeader = (label: string, field: typeof sortField) => {
    const isCurrent = sortField === field;
    return (
      <th 
        onClick={() => handleSort(field)}
        className="py-3 px-3 cursor-pointer hover:bg-slate-100/80 transition-colors select-none group text-left font-semibold text-slate-500"
      >
        <div className="flex items-center gap-1">
          <span>{label}</span>
          <ArrowUpDown className={`w-3.5 h-3.5 transition-opacity ${isCurrent ? 'opacity-100 text-blue-600' : 'opacity-0 group-hover:opacity-60'}`} />
        </div>
      </th>
    );
  };

  const handleDownloadPDF = (r: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Please allow popups to download/print the receipt.");
      return;
    }
    const bsId = getComplaintId(r.id, r.createdAt);
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(window.location.origin + '/app/reports/' + r.id)}`;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>${bsId} - Municipal Complaint Receipt</title>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #333; }
            .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #1e3a8a; padding-bottom: 20px; margin-bottom: 30px; }
            .logo-section { display: flex; align-items: center; gap: 15px; }
            .logo-placeholder { width: 60px; height: 60px; background: #1e3a8a; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 24px; }
            .title-section h1 { font-size: 20px; margin: 0; color: #1e3a8a; }
            .title-section p { font-size: 11px; margin: 5px 0 0 0; color: #666; font-weight: bold; }
            .complaint-id { text-align: right; }
            .complaint-id h2 { font-size: 18px; margin: 0; color: #d97706; }
            .complaint-id p { font-size: 11px; margin: 5px 0 0 0; color: #888; }
            .grid { display: grid; grid-template-cols: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
            .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; }
            .card h3 { font-size: 13px; margin: 0 0 10px 0; color: #1e3a8a; border-bottom: 1px solid #cbd5e1; padding-bottom: 5px; text-transform: uppercase; }
            .field { display: flex; margin-bottom: 8px; font-size: 12px; }
            .field-label { font-weight: bold; width: 120px; color: #555; }
            .field-value { flex: 1; }
            .description { font-size: 12px; line-height: 1.5; background: #fff; padding: 10px; border-radius: 4px; border: 1px dashed #cbd5e1; }
            .qr-section { display: flex; flex-direction: column; align-items: center; justify-content: center; }
            .qr-code { width: 100px; height: 100px; border: 1px solid #e2e8f0; padding: 5px; border-radius: 4px; }
            .footer { border-top: 1px solid #e2e8f0; padding-top: 15px; margin-top: 40px; text-align: center; font-size: 11px; color: #888; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo-section">
              <div class="logo-placeholder">🇳🇵</div>
              <div class="title-section">
                <h1>Ghorahi Sub-Metropolitan City Office</h1>
                <p>Municipal Grievance Redressal & Smart City Portal</p>
              </div>
            </div>
            <div class="complaint-id">
              <h2>${bsId}</h2>
              <p>Receipt Generated: ${new Date().toLocaleDateString()}</p>
            </div>
          </div>
          
          <div class="grid">
            <div class="card">
              <h3>Citizen & Grievance Info</h3>
              <div class="field"><span class="field-label">Reported By:</span><span class="field-value">${currentUser.name}</span></div>
              <div class="field"><span class="field-label">Email / Phone:</span><span class="field-value">${currentUser.email} / ${currentUser.phone || 'N/A'}</span></div>
              <div class="field"><span class="field-label">Category:</span><span class="field-value">${r.category}</span></div>
              <div class="field"><span class="field-label">Priority:</span><span class="field-value">${r.priority}</span></div>
              <div class="field"><span class="field-label">Status:</span><span class="field-value">${r.status}</span></div>
            </div>
            
            <div class="card qr-section">
              <img class="qr-code" src="${qrCodeUrl}" alt="QR verification" />
              <p style="font-size: 9px; color: #666; margin-top: 8px; font-weight: bold;">Scan to verify status online</p>
            </div>
          </div>

          <div class="card" style="margin-bottom: 30px;">
            <h3>Complaint Details</h3>
            <div class="field"><span class="field-label">Subject Title:</span><span class="field-value" style="font-weight: bold;">${r.title}</span></div>
            <div class="field"><span class="field-label">Description:</span><span class="field-value" class="description">${r.description}</span></div>
            <div class="field"><span class="field-label">Address:</span><span class="field-value">${r.address}</span></div>
            <div class="field"><span class="field-label">Ward Number:</span><span class="field-value">Ward ${r.wardId}</span></div>
            <div class="field"><span class="field-label">GPS Coords:</span><span class="field-value">${r.latitude.toFixed(6)}, ${r.longitude.toFixed(6)}</span></div>
          </div>

          <div class="grid">
            <div class="card">
              <h3>Resolution & Budget</h3>
              <div class="field"><span class="field-label">Assigned Dept:</span><span class="field-value">${r.assignedDepartment || 'Under Review / Unassigned'}</span></div>
              <div class="field"><span class="field-label">Budget Allocated:</span><span class="field-value">Rs. ${r.budgetEstimated.toLocaleString()}</span></div>
              <div class="field"><span class="field-label">Budget Spent:</span><span class="field-value">Rs. ${r.budgetSpent.toLocaleString()}</span></div>
            </div>
            
            <div class="card">
              <h3>Official Disclaimer</h3>
              <p style="font-size: 11px; line-height: 1.4; color: #666; margin: 0;">
                This receipt is dynamically generated by the Smart City Problem Reporter portal. The municipality executive office will verify and assign an engineer or department officer to address the reported problem within 3 business days. Please keep this receipt ID for reference when calling our hotline at 1111.
              </p>
            </div>
          </div>

          <div class="footer">
            <p>Ghorahi Municipality Executive Office, Dang District, Nepal | Phone: 082-560111 | Email: info@ghorahimun.gov.np</p>
            <p>© 2026 Ghorahi Sub-Metropolitan Portal. All Rights Reserved.</p>
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const renderActionButton = (icon: React.ReactNode, tooltip: string, onClick: () => void, className = 'bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600') => (
    <button
      onClick={onClick}
      title={tooltip}
      className={`p-1.5 rounded-lg transition-all duration-200 shadow-sm hover:-translate-y-0.5 cursor-pointer flex items-center justify-center ${className}`}
    >
      {icon}
    </button>
  );

  // Local dialog overlays
  const [showEmergencyDialog, setShowEmergencyDialog] = useState(false);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);

  const citizenReports = reports.filter(r => r.reporterId === currentUser.id);

  const handleReopen = (id: string) => {
    reopenReport(id, reopenNotes, reopenImg || 'https://images.unsplash.com/photo-1594913785162-e6785b4938a2?w=800&auto=format&fit=crop&q=60');
    setReopenId(null);
    setReopenNotes('');
    setReopenImg('');
  };

  const handleLike = (reportId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent opening details modal
    supportReport(reportId);
  };

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeComplaintId || !newCommentText.trim()) return;
    try {
      await addComment(activeComplaintId, newCommentText.trim());
      setNewCommentText('');
    } catch (err) {
      console.error('Error posting comment:', err);
    }
  };

  const activeComplaint = reports.find(r => r.id === activeComplaintId);

  // Dynamically calculate status breakdowns for the Grievance Pipeline
  const totalCount = reports.length || 1;
  const registeredCount = reports.filter(r => r.status === 'Submitted').length;
  const resolvedCount = reports.filter(r => r.status === 'Resolved').length;
  const pendingCount = reports.filter(r => r.status === 'Under_Review').length;
  const processingCount = reports.filter(r => r.status === 'In_Progress' || r.status === 'Assigned').length;
  const rejectedCount = reports.filter(r => r.status === 'Closed').length; 
  const directResolvedCount = reports.filter(r => r.status === 'Resolved' && r.budgetSpent === 0).length + 2; 

  const pctRegistered = Math.round((registeredCount / totalCount) * 100);
  const pctResolved = Math.round((resolvedCount / totalCount) * 100);
  const pctPending = Math.round((pendingCount / totalCount) * 100);
  const pctProcessing = Math.round((processingCount / totalCount) * 100);
  const pctRejected = Math.round((rejectedCount / totalCount) * 100);
  const pctDirect = Math.round((directResolvedCount / totalCount) * 100);

  // Dynamic Weather & Nepal Date
  const getLocalDateString = () => {
    const today = new Date();
    const weekday = today.toLocaleDateString(language === 'en' ? 'en-US' : 'ne-NP', { weekday: 'short' });
    const day = today.toLocaleDateString(language === 'en' ? 'en-US' : 'ne-NP', { day: 'numeric' });
    const month = today.toLocaleDateString(language === 'en' ? 'en-US' : 'ne-NP', { month: 'short' });
    const year = today.toLocaleDateString(language === 'en' ? 'en-US' : 'ne-NP', { year: 'numeric' });
    return `${weekday}, ${day} ${month} ${year}`;
  };

  // Convert Gregorian time to mock BS calendar formatted dates
  const formatBsDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const bsYear = date.getFullYear() + 57; 
    const bsMonth = String(((date.getMonth() + 8) % 12) + 1).padStart(2, '0');
    const bsDay = String(date.getDate()).padStart(2, '0');
    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    return `${bsYear}-${bsMonth}-${bsDay} • ${formattedHours}:${minutes} ${ampm}`;
  };

  // Sort and fetch latest public complaints
  const recentComplaints = [...reports]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Ghorahi departments complaint load calculation
  const deptLoad = [
    { name: 'Road & Infrastructure Division', count: reports.filter(r => r.assignedDepartment === 'Road & Infrastructure Division').length + 8 },
    { name: 'Sanitation / Waste Management Mahashakha', count: reports.filter(r => r.assignedDepartment === 'Sanitation / Waste Management Mahashakha').length + 5 },
    { name: 'Water Supply & Irrigation Division', count: reports.filter(r => r.assignedDepartment === 'Water Supply & Irrigation Division').length + 4 },
    { name: 'Sewerage & Drainage Division', count: reports.filter(r => r.assignedDepartment === 'Sewerage & Drainage Division').length + 3 },
    { name: 'Street Lighting & Energy Division', count: reports.filter(r => r.assignedDepartment === 'Street Lighting & Energy Division').length + 2 },
    { name: 'Traffic Police Division', count: reports.filter(r => r.assignedDepartment === 'Traffic Police Division').length + 2 }
  ].sort((a, b) => b.count - a.count);

  const ActiveReportsView = () => {
    const [q, setQ] = useState('');
    const [cat, setCat] = useState('all');
    const [st, setSt] = useState('all');
    const [wd, setWd] = useState('all');
    const [srt, setSrt] = useState<'newest' | 'oldest' | 'upvoted'>('newest');

    const activeList = reports.filter(r => 
      ['Submitted', 'Under_Review', 'Assigned', 'In_Progress'].includes(r.status)
    );

    const filtered = activeList.filter(r => {
      const matchesQ = r.title.toLowerCase().includes(q.toLowerCase()) || 
                       r.description.toLowerCase().includes(q.toLowerCase()) ||
                       getComplaintId(r.id, r.createdAt).toLowerCase().includes(q.toLowerCase());
      const matchesCat = cat === 'all' || r.category === cat;
      const matchesSt = st === 'all' || r.status === st;
      const matchesWd = wd === 'all' || String(r.wardId) === wd;
      return matchesQ && matchesCat && matchesSt && matchesWd;
    });

    const sorted = [...filtered].sort((a, b) => {
      if (srt === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (srt === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (srt === 'upvoted') return b.supportCount - a.supportCount;
      return 0;
    });

    return (
      <div className="glass-panel p-6 space-y-5 font-sans select-none">
        <div>
          <h2 className="text-base font-bold text-slate-800">Active Public Grievances ({activeList.length})</h2>
          <p className="text-[10px] text-slate-500 mt-0.5 font-bold">Monitor unresolved issues submitted by citizens across Ghorahi Sub-Metropolitan wards.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-3.5 bg-slate-50 border border-slate-200/60 rounded-xl p-3.5 text-xs font-bold text-slate-600">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by ID, keyword, title..." 
              value={q} 
              onChange={e => setQ(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-blue-500 font-bold" 
            />
          </div>

          <select value={st} onChange={e => setSt(e.target.value)} className="bg-white border border-slate-200 rounded-lg px-2.5 py-2 text-xs font-bold text-slate-600 focus:outline-none">
            <option value="all">All Active Statuses</option>
            <option value="Submitted">Submitted</option>
            <option value="Under_Review">Under Review</option>
            <option value="Assigned">Assigned</option>
            <option value="In_Progress">In Progress</option>
          </select>

          <select value={cat} onChange={e => setCat(e.target.value)} className="bg-white border border-slate-200 rounded-lg px-2.5 py-2 text-xs font-bold text-slate-600 focus:outline-none">
            <option value="all">All Categories</option>
            {['Garbage / Waste Management', 'Road Damage', 'Water Supply Problems', 'Drainage / Sewer', 'Street Light / Electricity', 'Public Infrastructure', 'Accident / Traffic Emergency', 'Fire Emergency', 'Public Safety / Crime'].map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select value={wd} onChange={e => setWd(e.target.value)} className="bg-white border border-slate-200 rounded-lg px-2.5 py-2 text-xs font-bold text-slate-600 focus:outline-none">
            <option value="all">All Wards</option>
            {Array.from({ length: 19 }, (_, i) => String(i + 1)).map(w => (
              <option key={w} value={w}>Ward {w}</option>
            ))}
          </select>

          <select value={srt} onChange={e => setSrt(e.target.value as any)} className="bg-white border border-slate-200 rounded-lg px-2.5 py-2 text-xs font-bold text-slate-600 focus:outline-none">
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="upvoted">Most Supported</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-h-[70vh] overflow-y-auto pr-1">
          {sorted.length === 0 ? (
            <div className="col-span-full text-center py-12 text-xs text-slate-400 font-bold bg-white border border-slate-200 rounded-2xl">
              No matching unresolved grievances found.
            </div>
          ) : (
            sorted.map((comp) => {
              const isCrit = ['Critical', 'Emergency'].includes(comp.priority);
              const statusColors = isCrit
                ? 'bg-rose-50 text-rose-600 border-rose-100'
                : comp.status === 'In_Progress' || comp.status === 'Assigned'
                ? 'bg-amber-50 text-amber-600 border-amber-100'
                : 'bg-blue-50 text-blue-600 border-blue-100';

              const reportCommentsCount = comments.filter(c => c.reportId === comp.id).length;
              const hasUpvoted = userLikes ? userLikes.includes(comp.id) : false;

              return (
                <div 
                  key={comp.id} 
                  onClick={() => setViewDetailReport(comp)}
                  className="bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md cursor-pointer hover:scale-[1.01] transition-all duration-200 rounded-2xl overflow-hidden flex flex-col sm:flex-row min-h-[170px]"
                >
                  <div className="w-full sm:w-44 h-36 sm:h-auto bg-slate-50 flex-shrink-0 relative overflow-hidden">
                    <MediaPreview report={comp} onClickMedia={(idx) => openLightboxForReport(comp, idx)} />
                    <span className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-sm text-white px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wide pointer-events-none z-10">
                      Ward {comp.wardId}
                    </span>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between min-w-0 space-y-3">
                    <div className="space-y-1">
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-[8.5px] font-extrabold uppercase tracking-wider text-blue-600">{t(comp.category)}</span>
                        <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 border rounded-lg tracking-wider shrink-0 select-none ${statusColors}`}>
                          {t(comp.status).replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-mono font-bold text-slate-405">{getComplaintId(comp.id, comp.createdAt)}</span>
                        {getPriorityBadge(comp.priority)}
                      </div>
                      <h4 className="text-xs font-extrabold text-slate-800 line-clamp-1">{comp.title}</h4>
                      <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed font-bold">{comp.description}</p>
                    </div>

                    <div className="space-y-2 border-t border-slate-100 pt-2.5">
                      <p className="text-[8.5px] font-extrabold text-slate-500 flex items-center gap-1 select-none">
                        <Users className="w-3 h-3 text-slate-400" />
                        <span>This issue has been flagged by {comp.duplicateCount || 0} citizens.</span>
                      </p>

                      <div className="flex justify-between items-center text-[9px] font-bold text-slate-400">
                        <span>{formatBsDate(comp.createdAt)}</span>
                        
                        <div className="flex items-center gap-3">
                          <button
                            onClick={(e) => handleLike(comp.id, e)}
                            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border transition-colors cursor-pointer ${
                              hasUpvoted
                                ? 'bg-blue-50 border-blue-200 text-blue-600 font-extrabold'
                                : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                            }`}
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                            <span>{comp.supportCount}</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setViewDetailReport(comp);
                            }}
                            className="flex items-center gap-1.5 px-2 py-1 rounded-lg border bg-white border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>{reportCommentsCount}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  const AlertsView = () => {
    const userNotifs = notifications.filter((n: any) => n.userId === currentUser.id);

    const handleMarkAllRead = () => {
      userNotifs.filter((n: any) => !n.isRead).forEach((n: any) => dismissNotification(n.id));
    };

    const bgColorsMap: Record<string, string> = {
      success: 'bg-emerald-50 border-emerald-100 text-emerald-800',
      warning: 'bg-amber-50 border-amber-100 text-amber-800',
      error: 'bg-red-50 border-red-100 text-red-800',
      reward: 'bg-purple-50 border-purple-100 text-purple-800',
      info: 'bg-blue-50 border-blue-100 text-blue-800',
      system: 'bg-slate-50 border-slate-200 text-slate-800',
      escalation: 'bg-orange-50/70 border-orange-100 text-orange-800'
    };

    const iconsMap: Record<string, React.ReactNode> = {
      success: <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />,
      warning: <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />,
      error: <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />,
      reward: <Award className="w-4 h-4 text-purple-600 shrink-0" />,
      info: <Info className="w-4 h-4 text-blue-600 shrink-0" />,
      system: <Bell className="w-4 h-4 text-slate-500 shrink-0" />,
      escalation: <AlertTriangle className="w-4 h-4 text-orange-600 shrink-0" />
    };

    return (
      <div className="glass-panel p-6 space-y-5 font-sans select-none">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-800">Alerts & Updates ({userNotifs.length})</h2>
            <p className="text-[10px] text-slate-500 mt-0.5 font-bold">Important system warnings, official updates, comments, and trust rewards.</p>
          </div>
          {userNotifs.some((n: any) => !n.isRead) && (
            <button 
              onClick={handleMarkAllRead} 
              className="text-[10px] bg-blue-50 text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg font-bold hover:bg-blue-100 transition-colors cursor-pointer"
            >
              Mark All as Read
            </button>
          )}
        </div>

        <div className="space-y-3.5 max-h-[70vh] overflow-y-auto pr-1">
          {userNotifs.length === 0 ? (
            <div className="text-center py-16 text-xs text-slate-400 font-bold bg-white border border-slate-200 rounded-2xl space-y-2">
              <Bell className="w-8 h-8 text-slate-300 mx-auto" />
              <p>Your notification tray is empty.</p>
            </div>
          ) : (
            userNotifs.map((n: any) => {
              const bgColors = (bgColorsMap[n.type] || bgColorsMap.system);
              const icon = (iconsMap[n.type] || iconsMap.system);

              return (
                <div 
                  key={n.id}
                  className={`border rounded-xl p-4 flex items-start gap-3.5 transition-all duration-155 relative ${bgColors} ${
                    !n.isRead ? 'ring-1 ring-blue-400 font-bold' : 'opacity-75'
                  }`}
                >
                  <div className="mt-0.5">{icon}</div>
                  <div className="flex-1 min-w-0 pr-16">
                    <h4 className="text-[11px] font-extrabold">{n.title}</h4>
                    <p className="text-[10px] mt-1 font-semibold leading-relaxed text-slate-600">{n.message}</p>
                    <span className="text-[9px] text-slate-400 font-bold block mt-2">{formatBsDate(n.createdAt)}</span>
                  </div>

                  {!n.isRead && (
                    <button
                      onClick={() => dismissNotification(n.id)}
                      className="absolute right-4 top-4 text-[9px] bg-white hover:bg-slate-50 border border-slate-200 text-slate-500 font-bold px-2 py-1 rounded transition-colors cursor-pointer"
                    >
                      Dismiss
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  const MapViewFull = () => {
    const [cat, setCat] = useState('all');
    const [st, setSt] = useState('all');
    const [wd, setWd] = useState('all');
    const [startD, setStartD] = useState('');
    const [endD, setEndD] = useState('');
    const [showHeat, setShowHeat] = useState(false);

    useEffect(() => {
      (window as any).viewReportDetails = (id: string) => {
        const found = reports.find(r => r.id === id);
        if (found) {
          setViewDetailReport(found);
        }
      };
      return () => {
        delete (window as any).viewReportDetails;
      };
    }, []);

    const filtered = reports.filter(r => {
      const matchesCat = cat === 'all' || r.category === cat;
      const matchesSt = st === 'all' || r.status === st;
      const matchesWd = wd === 'all' || String(r.wardId) === wd;
      
      const rDate = new Date(r.createdAt);
      const matchesStart = !startD || rDate >= new Date(startD);
      const matchesEnd = !endD || rDate <= new Date(endD + 'T23:59:59');

      return matchesCat && matchesSt && matchesWd && matchesStart && matchesEnd;
    });

    return (
      <div className="glass-panel p-6 space-y-5 font-sans select-none flex flex-col h-[82vh]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-800">Live Infrastructure Grievances Map</h2>
            <p className="text-[10px] text-slate-500 mt-0.5 font-bold">GIS mapping portal— locate active infrastructure problems reported by your community.</p>
          </div>
          
          <div className="flex items-center gap-2 self-start md:self-auto bg-slate-100 border border-slate-200 rounded-xl p-1.5">
            <button 
              onClick={() => setShowHeat(false)}
              className={`px-3 py-1 rounded-lg text-[9.5px] font-bold transition-all duration-150 cursor-pointer ${
                !showHeat 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Standard Pins
            </button>
            <button 
              onClick={() => setShowHeat(true)}
              className={`px-3 py-1 rounded-lg text-[9.5px] font-bold transition-all duration-150 cursor-pointer ${
                showHeat 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Heatmap Density
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 bg-slate-50 border border-slate-200/60 rounded-xl p-3.5 text-xs font-bold text-slate-600">
          <div className="space-y-1">
            <label className="text-[9px] text-slate-400 uppercase font-extrabold">Category</label>
            <select value={cat} onChange={e => setCat(e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-[10px] font-bold text-slate-600 focus:outline-none">
              <option value="all">All Categories</option>
              {['Garbage / Waste Management', 'Road Damage', 'Water Supply Problems', 'Drainage / Sewer', 'Street Light / Electricity', 'Public Infrastructure', 'Accident / Traffic Emergency', 'Fire Emergency', 'Public Safety / Crime'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] text-slate-400 uppercase font-extrabold">Status</label>
            <select value={st} onChange={e => setSt(e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-[10px] font-bold text-slate-600 focus:outline-none">
              <option value="all">All Statuses</option>
              {['Submitted', 'Under_Review', 'Assigned', 'In_Progress', 'Resolved', 'Closed'].map(s => (
                <option key={s} value={s}>{s.replace('_', ' ')}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] text-slate-400 uppercase font-extrabold">Ward Number</label>
            <select value={wd} onChange={e => setWd(e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-[10px] font-bold text-slate-600 focus:outline-none">
              <option value="all">All Wards</option>
              {Array.from({ length: 19 }, (_, i) => String(i + 1)).map(w => (
                <option key={w} value={w}>Ward {w}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[9px] text-slate-400 uppercase font-extrabold" title="Filter reports by submission date range">Submitted From</label>
            <input type="date" value={startD} onChange={e => setStartD(e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg p-1 text-[10px] font-bold text-slate-600 focus:outline-none" title="Filter reports by submission date range" />
          </div>

          <div className="space-y-1 col-span-2 md:col-span-1">
            <label className="text-[9px] text-slate-400 uppercase font-extrabold" title="Filter reports by submission date range">Submitted To</label>
            <input type="date" value={endD} onChange={e => setEndD(e.target.value)} className="w-full bg-white border border-slate-200 rounded-lg p-1 text-[10px] font-bold text-slate-600 focus:outline-none" title="Filter reports by submission date range" />
          </div>
        </div>

        <div className="flex-1 rounded-2xl overflow-hidden border border-slate-200 relative">
          <LeafletMap reports={filtered} showHeatmap={showHeat} selectedWard={wd} />
        </div>
      </div>
    );
  };

  const StatisticsView = () => {
    const [range, setRange] = useState<'7d' | '30d' | '1y' | 'all'>('all');

    const filtered = reports.filter(r => {
      if (range === 'all') return true;
      const days = { '7d': 7, '30d': 30, '1y': 365 }[range] || 365;
      const limitDate = new Date();
      limitDate.setDate(limitDate.getDate() - days);
      return new Date(r.createdAt) >= limitDate;
    });

    const total = filtered.length;
    const resolved = filtered.filter(r => ['Resolved', 'Closed'].includes(r.status)).length;
    const rate = total > 0 ? Math.round((resolved / total) * 100) : 0;

    const resolvedOnes = filtered.filter(r => ['Resolved', 'Closed'].includes(r.status));
    const avgMs = resolvedOnes.length > 0 
      ? resolvedOnes.reduce((sum, r) => sum + Math.max(0, new Date(r.updatedAt || r.createdAt).getTime() - new Date(r.createdAt).getTime()), 0) / resolvedOnes.length 
      : 0;
    const avgDays = Math.round((avgMs / (1000 * 60 * 60 * 24)) * 10) / 10 || 2.4;

    const catData = filtered.reduce((acc: { name: string; count: number }[], r) => {
      const existing = acc.find(x => x.name === r.category);
      if (existing) {
        existing.count += 1;
      } else {
        acc.push({ name: r.category, count: 1 });
      }
      return acc;
    }, []).sort((a, b) => b.count - a.count);

    const wardData = filtered.reduce((acc: { name: string; count: number }[], r) => {
      const key = `Ward ${r.wardId}`;
      const existing = acc.find(x => x.name === key);
      if (existing) {
        existing.count += 1;
      } else {
        acc.push({ name: key, count: 1 });
      }
      return acc;
    }, []).sort((a, b) => Number(a.name.split(' ')[1]) - Number(b.name.split(' ')[1]));

    const dailySubmissions = filtered.reduce((acc: Record<string, number>, r) => {
      const d = new Date(r.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      acc[d] = (acc[d] || 0) + 1;
      return acc;
    }, {});
    const lineData = Object.keys(dailySubmissions).map(k => ({
      date: k,
      count: dailySubmissions[k]
    })).slice(-8);

    return (
      <div className="glass-panel p-6 space-y-5 font-sans select-none">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-800">Municipal Grievances Analytics</h2>
            <p className="text-[10px] text-slate-500 mt-0.5 font-bold">Real-time statistics dashboard tracking workloads, response rates, and problem categories.</p>
          </div>
          
          <div className="flex items-center gap-1.5 self-start md:self-auto bg-slate-100 border border-slate-200 rounded-xl p-1.5">
            {[
              { key: '7d', label: 'Last 7 Days' },
              { key: '30d', label: 'Last 30 Days' },
              { key: '1y', label: 'This Year' },
              { key: 'all', label: 'All Time' }
            ].map((btn) => (
              <button 
                key={btn.key}
                onClick={() => setRange(btn.key as any)}
                className={`px-3 py-1 rounded-lg text-[9.5px] font-bold transition-all duration-150 cursor-pointer ${
                  range === btn.key 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Submitted', value: total, sub: 'Grievances received', color: 'text-blue-600 bg-blue-50/60 border-blue-100' },
            { label: 'Total Resolved', value: resolved, sub: 'Work order completed', color: 'text-emerald-600 bg-emerald-50/60 border-emerald-100' },
            { label: 'Resolution Rate', value: `${rate}%`, sub: 'Efficiency percentage', color: 'text-purple-600 bg-purple-50/60 border-purple-100' },
            { label: 'Avg Resolution Time', value: `${avgDays} Days`, sub: 'Citizen ticket closure', color: 'text-orange-600 bg-orange-50/60 border-orange-100' }
          ].map((kpi, idx) => (
            <div key={idx} className={`border rounded-2xl p-4 flex flex-col justify-between shadow-sm min-h-[90px] ${kpi.color}`}>
              <span className="text-[9px] font-extrabold uppercase tracking-wide text-slate-500">{kpi.label}</span>
              <div className="mt-1">
                <div className="text-xl font-extrabold font-sans tracking-tight">{kpi.value}</div>
                <div className="text-[8px] font-bold text-slate-400 mt-0.5">{kpi.sub}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm min-h-[300px]">
            <h3 className="text-xs font-bold text-slate-800 mb-4 uppercase tracking-wider">Grievances Submissions Timeline</h3>
            <div className="w-full h-60">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={lineData.length > 0 ? lineData : [{ date: 'Today', count: 0 }]}>
                  <defs>
                    <linearGradient id="chartBlue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={9} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '10px' }} />
                  <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#chartBlue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm min-h-[300px]">
            <h3 className="text-xs font-bold text-slate-800 mb-4 uppercase tracking-wider">Breakdown by Category</h3>
            <div className="w-full h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={catData.length > 0 ? catData : [{ name: 'None', count: 0 }]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={7.5} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '10px' }} />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm min-h-[300px] lg:col-span-2">
            <h3 className="text-xs font-bold text-slate-800 mb-4 uppercase tracking-wider">Distribution Across Wards</h3>
            <div className="w-full h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={wardData.length > 0 ? wardData : [{ name: 'None', count: 0 }]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={9} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={9} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '10px' }} />
                  <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const CommunityView = () => {
    const [suggestions, setSuggestions] = useState([
      { id: '1', title: 'Install Community Trash Bin', description: 'Request to install a communal waste bin near the main square of Ward 15 to prevent roadside garbage dumping.', category: 'Sanitation', upvotes: 18, author: 'Sunita Bista', date: 'Jul 8, 2026', liked: false, comments: ['Great idea, need this urgently!', 'Let ward office coordinate this.'] },
      { id: '2', title: 'Street Light Timing Adjustment', description: 'Adjust the automated timing for street lights in Ward 10. They turn on too late during the summer season.', category: 'Electricity', upvotes: 12, author: 'Hari Poudel', date: 'Jul 9, 2026', liked: false, comments: [] },
      { id: '3', title: 'Clean Water Station in Ghorahi Park', description: 'Introduce a solar-powered public drinking water station in the central municipality park.', category: 'Water Supply', upvotes: 24, author: 'Maya Shrestha', date: 'Jul 10, 2026', liked: false, comments: ['This would benefit so many visitors.'] }
    ]);
    const [newTitle, setNewTitle] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [newCat, setNewCat] = useState('Sanitation');

    const handleAddSuggestion = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newTitle.trim() || !newDesc.trim()) return;
      const newSuggest = {
        id: Date.now().toString(),
        title: newTitle,
        description: newDesc,
        category: newCat,
        upvotes: 1,
        author: currentUser.name,
        date: 'Just Now',
        liked: true,
        comments: []
      };
      setSuggestions([newSuggest, ...suggestions]);
      setNewTitle('');
      setNewDesc('');
    };

    const handleUpvoteSuggest = (id: string) => {
      setSuggestions(prev => prev.map(s => {
        if (s.id === id) {
          return {
            ...s,
            upvotes: s.liked ? s.upvotes - 1 : s.upvotes + 1,
            liked: !s.liked
          };
        }
        return s;
      }));
    };

    const leaderboard = [
      { name: 'Ramesh Dahal', resolvedCount: 14, reputation: 280, rank: 1, avatar: 'RD' },
      { name: 'Sunita Bista', resolvedCount: 11, reputation: 220, rank: 2, avatar: 'SB' },
      { name: currentUser.name, resolvedCount: resolvedCount, reputation: resolvedCount * 50 + (citizenReports.length * 10) + 20, rank: 3, avatar: 'YP', isMe: true },
      { name: 'Hari Poudel', resolvedCount: 4, reputation: 95, rank: 4, avatar: 'HP' },
      { name: 'Maya Shrestha', resolvedCount: 2, reputation: 60, rank: 5, avatar: 'MS' }
    ].sort((a, b) => b.reputation - a.reputation);

    return (
      <div className="glass-panel p-6 space-y-6 font-sans select-none">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <div>
              <h2 className="text-base font-bold text-slate-800">Community Suggestions Feed</h2>
              <p className="text-[10px] text-slate-500 mt-0.5 font-bold">Collaborate on municipal ideas, share community suggestions, and support citizen-led improvement initiatives.</p>
            </div>

            <form onSubmit={handleAddSuggestion} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 shadow-sm">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Submit Suggestion to Community</h3>
              <div className="space-y-2">
                <input 
                  type="text" 
                  placeholder="Suggestion Title (e.g. Upgrade Ward Park)" 
                  value={newTitle} 
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-blue-500" 
                  required
                />
                <textarea 
                  placeholder="Elaborate on how Ghorahi municipality can implement this idea..." 
                  value={newDesc} 
                  onChange={e => setNewDesc(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-3 text-xs font-semibold focus:outline-none focus:border-blue-500" 
                  rows={2}
                  required
                />
              </div>
              <div className="flex justify-between items-center">
                <select value={newCat} onChange={e => setNewCat(e.target.value)} className="bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-650 focus:outline-none">
                  {['Sanitation', 'Road Infrastructure', 'Water Supply', 'Drainage', 'Electricity', 'Parks & Playgrounds', 'Public Safety'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-1.5 px-4 rounded-xl cursor-pointer">
                  Post Suggestion
                </button>
              </div>
            </form>

            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
              {suggestions.map((s) => (
                <div key={s.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3.5 hover:border-slate-300 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="space-y-0.5">
                      <span className="bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wide">{s.category}</span>
                      <h4 className="text-xs font-bold text-slate-800 mt-1">{s.title}</h4>
                    </div>
                    <span className="text-[9px] text-slate-400 font-bold">{s.date}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 font-bold leading-relaxed">{s.description}</p>
                  
                  <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-[9px] font-bold text-slate-400 select-none">
                    <span>Proposed by: <strong className="text-slate-600">{s.author}</strong></span>
                    
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => handleUpvoteSuggest(s.id)}
                        className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border transition-colors cursor-pointer ${
                          s.liked 
                            ? 'bg-blue-50 border-blue-200 text-blue-600 font-extrabold' 
                            : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                        }`}
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>{s.upvotes} Upvotes</span>
                      </button>
                      <span className="flex items-center gap-1.5 py-1 text-slate-500">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{s.comments.length} Comments</span>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col self-start space-y-4">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Reputation Leaderboard</h3>
              <p className="text-[9px] text-slate-400 font-bold mt-0.5">Top contributors in Ghorahi. Earn reputation points by filing verified complaints and reviewing resolved services.</p>
            </div>
            
            <div className="space-y-3.5 select-none pt-2">
              {leaderboard.map((user, idx) => (
                <div key={idx} className={`flex items-center justify-between p-2.5 rounded-xl border transition-all ${
                  user.isMe 
                    ? 'bg-blue-50/50 border-blue-200 ring-1 ring-blue-300' 
                    : 'bg-slate-50/40 border-slate-100'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className="w-5 text-xs font-extrabold text-slate-400 text-center font-mono">#{idx + 1}</div>
                    <div className="w-7 h-7 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-[10px] font-extrabold text-slate-600">
                      {user.avatar}
                    </div>
                    <div>
                      <div className="text-[10.5px] font-extrabold text-slate-800 flex items-center gap-1">
                        {user.name}
                        {user.isMe && <span className="bg-blue-600 text-white text-[7px] px-1 rounded uppercase tracking-wider font-extrabold">You</span>}
                      </div>
                      <div className="text-[8.5px] font-bold text-slate-400 mt-0.5">{user.resolvedCount} Issues Resolved</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-extrabold text-slate-750 font-mono">{user.reputation}</span>
                    <span className="text-[7.5px] font-extrabold text-slate-400 block tracking-wide uppercase">Points</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ProfileView = () => {
    const [editMode, setEditMode] = useState(false);
    const [name, setName] = useState(currentUser.name);
    const [email, setEmail] = useState(currentUser.email);
    const [phone, setPhone] = useState(currentUser.phone || '9847800000');
    const [ward, setWard] = useState(String(currentUser.wardId || 15));
    const [msg, setMsg] = useState('');

    const handleSave = (e: React.FormEvent) => {
      e.preventDefault();
      currentUser.name = name;
      currentUser.email = email;
      currentUser.phone = phone;
      currentUser.wardId = Number(ward);
      setMsg('Profile updated successfully!');
      setEditMode(false);
      setTimeout(() => setMsg(''), 3000);
    };

    const totalSubmitted = citizenReports.length;
    const totalResolved = citizenReports.filter(r => ['Resolved', 'Closed'].includes(r.status)).length;
    const totalActive = citizenReports.filter(r => ['Submitted', 'Under_Review', 'Assigned', 'In_Progress'].includes(r.status)).length;

    return (
      <div className="glass-panel p-6 space-y-6 font-sans select-none max-w-3xl mx-auto">
        <div className="flex items-center gap-4 border-b border-slate-100 pb-5">
          <div className="w-16 h-16 rounded-full bg-blue-600 border-2 border-white shadow flex items-center justify-center text-xl font-extrabold text-white">
            YP
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">{currentUser.name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wide">Citizen User</span>
              <span className="text-[10px] text-slate-400 font-bold">Member since Jan 2026</span>
            </div>
          </div>
        </div>

        {msg && (
          <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 text-emerald-600 text-xs font-bold animate-pulse">
            ✓ {msg}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Total Grievances Filed', count: totalSubmitted },
            { label: 'Active Grievances', count: totalActive },
            { label: 'Resolved Issues', count: totalResolved }
          ].map((stat, idx) => (
            <div key={idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center shadow-sm">
              <span className="text-[8.5px] font-extrabold uppercase text-slate-400 tracking-wide">{stat.label}</span>
              <div className="text-2xl font-extrabold text-slate-800 mt-1 font-mono">{stat.count}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Profile Details</h3>
              <button 
                onClick={() => setEditMode(!editMode)}
                className="text-[10.5px] font-bold text-blue-600 hover:underline cursor-pointer"
              >
                {editMode ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>

            {editMode ? (
              <form onSubmit={handleSave} className="space-y-3.5 text-xs text-slate-700 font-bold">
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-400 uppercase">Full Name</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold focus:outline-none focus:border-blue-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-400 uppercase">Email Address</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold focus:outline-none focus:border-blue-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-400 uppercase">Phone Number</label>
                  <input type="text" value={phone} onChange={e => setPhone(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold focus:outline-none focus:border-blue-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] text-slate-400 uppercase">Assigned Ward ID</label>
                  <select value={ward} onChange={e => setWard(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold focus:outline-none focus:border-blue-500">
                    {Array.from({ length: 19 }, (_, i) => String(i + 1)).map(w => (
                      <option key={w} value={w}>Ward {w}</option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-xl transition-colors cursor-pointer">
                  Save Settings
                </button>
              </form>
            ) : (
              <div className="space-y-3 select-none text-[11px] text-slate-600 font-semibold">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">FullName</span>
                  <span className="font-extrabold text-slate-800">{currentUser.name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Email Address</span>
                  <span className="font-extrabold text-slate-800">{currentUser.email}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Phone Number</span>
                  <span className="font-extrabold text-slate-800">{phone}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Ward Residence</span>
                  <span className="font-extrabold text-slate-800">Ward {currentUser.wardId || 15}</span>
                </div>
                
                <button 
                  onClick={() => setCurrentTab('my-reports')}
                  className="w-full mt-4 flex items-center justify-center gap-1.5 border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-750 py-2.5 rounded-xl transition-all cursor-pointer font-bold"
                >
                  <ClipboardList className="w-4 h-4" />
                  <span>Access My Submitted Reports</span>
                </button>
              </div>
            )}
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-2">Trust Score & Badges</h3>
            
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-blue-900 to-indigo-950 text-white rounded-xl p-4 shadow-sm">
                <span className="text-[7.5px] font-extrabold uppercase text-blue-300 tracking-wider">Civic Trust Level</span>
                <div className="text-2xl font-extrabold mt-0.5 font-sans tracking-tight">Active Verifier</div>
                <p className="text-[9px] text-slate-300 font-bold leading-normal mt-1">Submit correct reports to gain recognition and unlock direct feedback prioritization levels.</p>
              </div>

              <div className="space-y-3">
                <span className="text-[9px] text-slate-400 uppercase font-extrabold block">Earned Badges</span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { name: 'First Report', color: 'bg-blue-50 text-blue-600 border border-blue-100', desc: 'Filed first grievance' },
                    { name: 'Community Helper', color: 'bg-emerald-50 text-emerald-600 border border-emerald-100', desc: 'Resolved 3 community complaints' },
                    { name: 'Active Verifier', color: 'bg-purple-50 text-purple-600 border border-purple-100', desc: 'Trust verified above 90%' }
                  ].map((b, idx) => (
                    <div key={idx} className={`p-2 rounded-lg text-center flex-1 min-w-[90px] shadow-sm select-none ${b.color}`} title={b.desc}>
                      <Award className="w-5 h-5 mx-auto mb-1 opacity-90" />
                      <div className="text-[8.5px] font-extrabold whitespace-nowrap">{b.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const HelpSupportView = () => {
    const [faqOpen, setFaqOpen] = useState<Record<string, boolean>>({});
    const [subTitle, setSubTitle] = useState('');
    const [subEmail, setSubEmail] = useState(currentUser.email);
    const [subMsg, setSubMsg] = useState('');
    const [success, setSuccess] = useState('');

    const toggleFaq = (key: string) => {
      setFaqOpen(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        // Query the database to find the actual Admin's UUID
        const { data: admins, error: adminErr } = await supabase
          .from('profiles')
          .select('id')
          .eq('role', 'Admin')
          .limit(1);
        
        if (adminErr) throw adminErr;
        
        const adminId = admins && admins.length > 0 ? admins[0].id : null;
        
        if (adminId) {
          await reportService.createDbNotification({
            userId: adminId,
            title: 'New Support Desk Inquiry',
            message: `From ${currentUser.name} (${subEmail}): "${subTitle}" - Message: ${subMsg}`,
            type: 'info'
          });
        } else {
          // If no admin profile is registered yet, fall back to null (allowed by DB schema)
          await reportService.createDbNotification({
            userId: null as any,
            title: 'New Support Desk Inquiry',
            message: `From ${currentUser.name} (${subEmail}): "${subTitle}" - Message: ${subMsg}`,
            type: 'info'
          });
        }
      } catch (err) {
        console.error('Failed to notify Admin of support desk inquiry:', err);
      }
      setSuccess('Your support inquiry has been submitted! Our officers will respond shortly.');
      setSubTitle('');
      setSubMsg('');
      setTimeout(() => setSuccess(''), 4000);
    };

    const faqs = [
      { key: 'q1', q: 'How long does it take for a complaint to be resolved?', a: 'Once verified, the municipality executive office routes the issue to the relevant department (e.g. Roads Division) within 3 business days. Resolution time varies depending on construction requirements, but minor repairs are addressed in 5-10 business days.' },
      { key: 'q2', q: 'Can I edit my grievance coordinates after submitting?', a: 'You can only edit coordinates or complaint details while the status is "Submitted". Once reviewed or assigned to an engineer, details cannot be modified to maintain verification records.' },
      { key: 'q3', q: 'What are Community Verification Points?', a: 'Other citizens can upvote or mark your reported issue as "supported" if they verify the problem themselves. Highly supported complaints gain higher priority rankings for municipal action.' }
    ];

    return (
      <div className="glass-panel p-6 space-y-6 font-sans select-none max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-800">Frequently Asked Questions</h2>
              <p className="text-[10px] text-slate-500 mt-0.5 font-bold">Find quick solutions regarding response times, verification metrics, and routing paths.</p>
            </div>

            <div className="space-y-2.5">
              {faqs.map(faq => {
                const isOpen = !!faqOpen[faq.key];
                return (
                  <div key={faq.key} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <button 
                      onClick={() => toggleFaq(faq.key)}
                      className="w-full p-3.5 flex justify-between items-center text-[10.5px] font-extrabold text-slate-700 hover:bg-slate-50 transition-colors text-left cursor-pointer"
                    >
                      <span>{faq.q}</span>
                      <span className="text-xs text-slate-400 font-normal">{isOpen ? '−' : '+'}</span>
                    </button>
                    {isOpen && (
                      <div className="p-3.5 border-t border-slate-100 bg-slate-50/40 text-[10px] font-semibold leading-relaxed text-slate-500 select-text">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col space-y-4">
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Alternative Filing Channels</h3>
                <p className="text-[9px] text-slate-400 font-bold mt-0.5">Contact Ghorahi Municipality directly through any official integration channel.</p>
              </div>
              
              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  { label: 'Online Portal', val: 'ghorahimun.gov.np', color: 'text-blue-600 bg-blue-50/50' },
                  { label: 'Viber / SMS', val: '9847800000', color: 'text-purple-600 bg-purple-50/50' },
                  { label: 'WhatsApp', val: '9847811111', color: 'text-emerald-600 bg-emerald-50/50' },
                  { label: 'Citizen Helpline', val: 'Hotline 1111', color: 'text-rose-600 bg-rose-50/50' },
                  { label: 'Twitter Handle', val: '@GhorahiMuni', color: 'text-sky-600 bg-sky-50/50' },
                  { label: 'Official Facebook', val: 'fb.com/ghorahimun', color: 'text-blue-700 bg-blue-50/60' }
                ].map((ch, idx) => (
                  <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 space-y-1 shadow-sm">
                    <span className="text-[8px] font-bold text-slate-400 uppercase block">{ch.label}</span>
                    <span className="text-[9px] font-extrabold text-slate-700 block leading-tight">{ch.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col self-start space-y-4">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Support Desk Request</h3>
              <p className="text-[9px] text-slate-400 font-bold mt-0.5">Submit inquiry requests unrelated to community complaints (e.g. system logins, password changes).</p>
            </div>

            {success && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 text-emerald-600 text-xs font-bold">
                ✓ {success}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-3.5 text-xs text-slate-700 font-bold">
              <div className="space-y-1">
                <label className="text-[9px] text-slate-400 uppercase">Inquiry Subject</label>
                <input 
                  type="text" 
                  value={subTitle} 
                  onChange={e => setSubTitle(e.target.value)}
                  placeholder="e.g. Profile editing issue" 
                  required 
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold focus:outline-none focus:border-blue-500" 
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-slate-400 uppercase">Contact Email</label>
                <input 
                  type="email" 
                  value={subEmail} 
                  onChange={e => setSubEmail(e.target.value)}
                  required 
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold focus:outline-none focus:border-blue-500" 
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] text-slate-400 uppercase">Message</label>
                <textarea 
                  value={subMsg} 
                  onChange={e => setSubMsg(e.target.value)}
                  placeholder="Describe your inquiry..." 
                  required 
                  rows={4}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold focus:outline-none focus:border-blue-500" 
                />
              </div>

              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-xl transition-colors cursor-pointer">
                Submit Help Request
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  };

  if (activeView === 'report-form') {
    return (
      <div className="glass-panel p-6">
        <h2 className="text-base font-bold text-slate-800 mb-1">Submit Civic Infrastructure Problem</h2>
        <p className="text-xs text-slate-500 mb-6 font-bold">Select a category, point the location on the map, and upload an image to alert the ward office.</p>
        <ReportForm onSuccess={() => setCurrentTab('my-reports')} />
      </div>
    );
  }

  if (activeView === 'my-reports') {

    // Filter implementation
    const filteredReports = citizenReports.filter(r => {
      const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getComplaintId(r.id, r.createdAt).toLowerCase().includes(searchTerm.toLowerCase());
        
      const matchesStatus = filterStatus === 'all' || r.status === filterStatus;
      const matchesCategory = filterCategory === 'all' || r.category === filterCategory;
      const matchesPriority = filterPriority === 'all' || r.priority === filterPriority;
      const matchesWard = filterWard === 'all' || String(r.wardId) === filterWard;
      
      const reportDate = new Date(r.createdAt);
      const matchesStartDate = !filterStartDate || reportDate >= new Date(filterStartDate);
      const matchesEndDate = !filterEndDate || reportDate <= new Date(filterEndDate + 'T23:59:59');
      
      return matchesSearch && matchesStatus && matchesCategory && matchesPriority && matchesWard && matchesStartDate && matchesEndDate;
    });

    // Sort implementation
    const sortedReports = [...filteredReports].sort((a, b) => {
      let comparison = 0;
      if (sortField === 'createdAt') {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortField === 'status') {
        comparison = a.status.localeCompare(b.status);
      } else if (sortField === 'category') {
        comparison = a.category.localeCompare(b.category);
      } else if (sortField === 'priority') {
        const priorityOrder = { 'Low': 1, 'Medium': 2, 'High': 3, 'Critical': 4, 'Emergency': 5 };
        comparison = (priorityOrder[a.priority as keyof typeof priorityOrder] || 0) - (priorityOrder[b.priority as keyof typeof priorityOrder] || 0);
      }
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return (
      <div className="glass-panel p-6 font-sans select-none">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div>
            <h2 className="text-base font-bold text-slate-800">My Submitted Reports ({citizenReports.length})</h2>
            <p className="text-[10px] text-slate-500 mt-0.5 font-semibold">Track, update, print receipt, or rate the resolution of your submitted grievances.</p>
          </div>
          <button 
            onClick={() => setCurrentTab('report-form')}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 px-4 rounded-xl shadow transition-colors cursor-pointer self-start md:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>File New Report</span>
          </button>
        </div>

        {/* Dynamic Search & Filters Toolbar */}
        <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-4 mb-5 text-xs font-bold text-slate-600 space-y-3">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search by ID, keyword, title..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-4 py-2.5 text-xs focus:outline-none focus:border-blue-500 font-bold"
              />
            </div>
            
            {/* Status Filter */}
            <div className="w-full md:w-44 flex flex-col gap-1">
              <label className="text-[9px] uppercase tracking-wider text-slate-400">Status</label>
              <select 
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg px-2.5 py-2.5 text-xs font-bold text-slate-600"
              >
                <option value="all">All Statuses</option>
                <option value="Submitted">Submitted</option>
                <option value="Under_Review">Under Review</option>
                <option value="Assigned">Assigned</option>
                <option value="In_Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            {/* Category Filter */}
            <div className="w-full md:w-48 flex flex-col gap-1">
              <label className="text-[9px] uppercase tracking-wider text-slate-400">Category</label>
              <select 
                value={filterCategory}
                onChange={e => setFilterCategory(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg px-2.5 py-2.5 text-xs font-bold text-slate-700"
              >
                <option value="all">All Categories</option>
                <option value="Garbage / Waste Management">Garbage / Waste</option>
                <option value="Road Damage">Road Damage</option>
                <option value="Water Supply Problems">Water Supply</option>
                <option value="Drainage / Sewer">Drainage / Sewer</option>
                <option value="Street Light / Electricity">Street Light / Utility</option>
                <option value="Public Infrastructure">Infrastructure</option>
                <option value="Accident / Traffic Emergency">Accident / Traffic</option>
                <option value="Fire Emergency">Fire Emergency</option>
                <option value="Public Safety / Crime">Public Safety / Crime</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-slate-200/50">
            {/* Priority Filter */}
            <div className="flex flex-col gap-1">
              <label className="text-[9px] uppercase tracking-wider text-slate-400">Priority</label>
              <select 
                value={filterPriority}
                onChange={e => setFilterPriority(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg px-2 py-2 text-xs font-bold text-slate-700"
              >
                <option value="all">All Priorities</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
                <option value="Emergency">Emergency</option>
              </select>
            </div>

            {/* Ward Filter */}
            <div className="flex flex-col gap-1">
              <label className="text-[9px] uppercase tracking-wider text-slate-400">Ward Number</label>
              <select 
                value={filterWard}
                onChange={e => setFilterWard(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg px-2 py-2 text-xs font-bold text-slate-700"
              >
                <option value="all">All Wards</option>
                {Array.from({ length: 19 }, (_, i) => i + 1).map(w => (
                  <option key={w} value={String(w)}>Ward {w}</option>
                ))}
              </select>
            </div>

            {/* Date Range Start */}
            <div className="flex flex-col gap-1">
              <label className="text-[9px] uppercase tracking-wider text-slate-400" title="Filter reports by submission date range">Submitted From</label>
              <input
                type="date"
                value={filterStartDate}
                onChange={e => setFilterStartDate(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-600"
                title="Filter reports by submission date range"
              />
            </div>

            {/* Date Range End */}
            <div className="flex flex-col gap-1">
              <label className="text-[9px] uppercase tracking-wider text-slate-400" title="Filter reports by submission date range">Submitted To</label>
              <input
                type="date"
                value={filterEndDate}
                onChange={e => setFilterEndDate(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-600"
                title="Filter reports by submission date range"
              />
            </div>
          </div>
        </div>

        {/* Reports Grid Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-sm bg-white">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/50">
                <th className="py-3 px-3">Complaint ID</th>
                {renderSortHeader('Title', 'createdAt')}
                {renderSortHeader('Category', 'category')}
                {renderSortHeader('Priority', 'priority')}
                {renderSortHeader('Status', 'status')}
                <th className="py-3 px-3">Date Submitted</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedReports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400 font-bold">No complaints match your filters.</td>
                </tr>
              ) : (
                sortedReports.map(r => (
                  <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50/60 text-slate-600 transition-colors duration-150">
                    <td className="py-3 px-3 font-mono font-bold text-slate-700 text-[11px]">{getComplaintId(r.id, r.createdAt)}</td>
                    <td className="py-3 px-3 font-bold text-slate-800 truncate max-w-[150px]" title={r.title}>{r.title}</td>
                    <td className="py-3 px-3 truncate max-w-[120px]">{t(r.category)}</td>
                    <td className="py-3 px-3">{getPriorityBadge(r.priority)}</td>
                    <td className="py-3 px-3">{getStatusBadge(r.status)}</td>
                    <td className="py-3 px-3 font-semibold text-slate-500">{formatNepalTime(r.createdAt).split(',')[0]}</td>
                    
                    {/* Status Based Actions */}
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        {/* 1. View Details (Always) */}
                        {renderActionButton(<Eye className="w-3.5 h-3.5" />, "View Details", () => {
                          setViewDetailReport(r);
                          setDetailModalTab('overview');
                        })}

                        {/* 2. Edit (Submitted only) */}
                        {r.status === 'Submitted' && renderActionButton(<Pencil className="w-3.5 h-3.5 text-blue-600" />, "Edit Report", () => setEditReportData(r))}

                        {/* 3. Delete (Submitted only) */}
                        {r.status === 'Submitted' && renderActionButton(<Trash2 className="w-3.5 h-3.5 text-red-600" />, "Delete Report", () => setDeleteConfirmId(r.id), 'bg-red-50 hover:bg-red-100 border border-red-200')}

                        {/* 4. GIS Location Map (Always) */}
                        {renderActionButton(<MapPin className="w-3.5 h-3.5 text-emerald-600" />, "View Location", () => setMapLocationReport(r))}

                        {/* 5. Uploaded Media Gallery (Always) */}
                        {renderActionButton(<Image className="w-3.5 h-3.5 text-indigo-600" />, "View Photos & Videos", () => openLightboxForReport(r))}

                        {/* 6. Download PDF (Always) */}
                        {renderActionButton(<FileDown className="w-3.5 h-3.5 text-slate-600" />, "Download Receipt", () => handleDownloadPDF(r))}

                        {/* 7. Reopen (Resolved only) */}
                        {r.status === 'Resolved' && renderActionButton(<RefreshCw className="w-3.5 h-3.5 text-rose-600 animate-spin-hover" />, "Reopen Complaint", () => setReopenId(r.id), 'bg-rose-50 hover:bg-rose-100 border border-rose-200')}

                        {/* 8. Rate Service (Closed only) */}
                        {r.status === 'Closed' && renderActionButton(<Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />, "Rate Service", () => {
                          setRatingReport(r);
                          setRatingStars(5);
                        }, 'bg-amber-50 hover:bg-amber-100 border border-amber-200')}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (activeView === 'active-reports') {
    return <ActiveReportsView />;
  }

  if (activeView === 'alerts') {
    return <AlertsView />;
  }

  if (activeView === 'map-view') {
    return <MapViewFull />;
  }

  if (activeView === 'statistics') {
    return <StatisticsView />;
  }

  if (activeView === 'community') {
    return <CommunityView />;
  }

  if (activeView === 'profile') {
    return <ProfileView />;
  }

  if (activeView === 'help') {
    return <HelpSupportView />;
  }

  return (
    <div className="space-y-6 font-sans select-none text-slate-700 animate-in fade-in duration-200">
      
      {/* Top Info Bar */}
      <div className="bg-blue-800 text-white rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-4 shadow-sm border border-blue-900/50">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-red-500" />
          <span className="text-[10px] font-extrabold uppercase tracking-widest leading-none">
            {language === 'en' ? 'Ghorahi Municipal Grievance Redressal System' : 'घोराही नगर गुनासो व्यवस्थापन प्रणाली'}
          </span>
        </div>
        <div className="flex items-center gap-4 text-[9px] font-bold">
          <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-red-400" /> Hotline: 1111</span>
          <span className="text-blue-600">|</span>
          <span className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5 text-emerald-400" /> gunaso@ghorahimun.gov.np</span>
        </div>
      </div>

      {/* Hero Banner & Weather Row */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* City Banner */}
        <div className="lg:col-span-3 h-52 rounded-2xl overflow-hidden relative shadow-sm border border-slate-200/50 bg-blue-900">
          <img src={ghorahiBanner} alt="Ghorahi panorama" className="w-full h-full object-cover opacity-90" />
          <div className="absolute inset-0 bg-gradient-to-t from-blue-950/85 via-blue-900/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5 pl-8 flex flex-col text-white z-10">
            <h1 className="text-lg md:text-xl font-bold font-sans tracking-wide leading-tight">
              {language === 'en' ? 'Clean, Safe & Prosperous Ghorahi' : 'स्वच्छ, सुरक्षित र समृद्ध घोराही'}
            </h1>
            <p className="text-[10px] md:text-xs mt-1.5 font-bold opacity-90">
              {language === 'en' ? 'Office of the Municipal Executive | Ghorahi, Dang' : 'नगर कार्यपालिकाको कार्यालय | घोराही, दाङ'}
            </p>
          </div>
        </div>

        {/* Weather Widget */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="text-3xl font-extrabold text-slate-800 font-sans tracking-tight">32°C</div>
              <div className="text-xs font-extrabold text-slate-700">{language === 'en' ? 'Mostly Sunny' : 'सामान्यतया सफा'}</div>
              <div className="text-[10px] text-slate-500 font-bold">Ghorahi, Dang</div>
            </div>
            <Sun className="w-10 h-10 text-amber-500 animate-spin-slow" />
          </div>
          <div className="text-[10px] text-slate-500 border-t border-slate-100 pt-3 flex justify-between items-center font-bold">
            <span>{getLocalDateString()}</span>
          </div>
        </div>
      </div>

      {/* Section: Channels Available for Complaints */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2.5">
          {language === 'en' ? 'Channels available for filing complaints:' : 'गुनासो दर्ताका लागि उपलब्ध माध्यमहरु:'}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
          {[
            { label: 'Online Portal', icon: () => <Globe className="w-4 h-4" />, color: 'text-blue-600 bg-blue-50/50' },
            { label: 'Facebook Chat', icon: () => <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>, color: 'text-indigo-600 bg-indigo-50/50' },
            { label: 'Twitter Handle', icon: () => <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>, color: 'text-sky-500 bg-sky-50/50' },
            { label: 'SMS Hotline', icon: () => <MessageSquare className="w-4 h-4" />, color: 'text-purple-600 bg-purple-50/50' },
            { label: 'Phone Call (1111)', icon: () => <Phone className="w-4 h-4" />, color: 'text-rose-600 bg-rose-50/50' },
            { label: 'WhatsApp', icon: () => <MessageCircle className="w-4 h-4" />, color: 'text-emerald-600 bg-emerald-50/50' }
          ].map((ch, idx) => {
            const RenderIcon = ch.icon;
            return (
              <div key={idx} className="p-3 border border-slate-100 rounded-xl flex flex-col items-center justify-center text-center space-y-2 select-none hover:bg-slate-50/50 transition-colors">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center ${ch.color}`}>
                  <RenderIcon />
                </div>
                <span className="text-[9px] font-bold text-slate-600 leading-tight">{ch.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grievance Pipeline Stats */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          {language === 'en' ? 'Latest Status of Complaints Received' : 'दर्ता भएका गुनासोहरुको पछिल्लो स्थिति'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: language === 'en' ? 'Registered on Portal' : 'पोर्टलमा गुनासो दर्ता भएको छ',
              count: registeredCount,
              percent: pctRegistered,
              color: 'text-blue-600 bg-blue-50/50 border-blue-100',
              icon: FileText
            },
            {
              title: language === 'en' ? 'Resolved by Authority' : 'सम्बन्धित निकायबाट फछ्र्यौट भएको छ',
              count: resolvedCount,
              percent: pctResolved,
              color: 'text-emerald-600 bg-emerald-50/50 border-emerald-100',
              icon: CheckCircle
            },
            {
              title: language === 'en' ? 'Reviewed, Action Pending' : 'निकायले हेरेको तर कारबाही हुन बाँकी',
              count: pendingCount,
              percent: pctPending,
              color: 'text-amber-600 bg-amber-50/50 border-amber-100',
              icon: AlertTriangle
            },
            {
              title: language === 'en' ? 'Processing/Investigating' : 'निकायमा प्रक्रिया/अनुसन्धानमा रहेको',
              count: processingCount,
              percent: pctProcessing,
              color: 'text-purple-600 bg-purple-50/50 border-purple-100',
              icon: RefreshCw
            },
            {
              title: language === 'en' ? 'Not Addressed/Closed' : 'सम्बन्धित निकायले सम्बोधन नगरेको / बन्द भएको',
              count: rejectedCount,
              percent: pctRejected,
              color: 'text-rose-600 bg-rose-50/50 border-rose-100',
              icon: EyeOff
            },
            {
              title: language === 'en' ? 'Resolved by Mayor\'s Office' : 'महानगर सचिवालयबाट सोझै फछ्र्यौट',
              count: directResolvedCount,
              percent: pctDirect,
              color: 'text-teal-600 bg-teal-50/50 border-teal-100',
              icon: Award
            }
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className={`p-4 border rounded-2xl bg-white flex items-center justify-between shadow-sm hover:shadow-md transition-shadow`}>
                <div className="space-y-1.5 flex-1 min-w-0 pr-3">
                  <p className="text-[10px] font-bold text-slate-500 leading-tight uppercase truncate">{item.title}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-extrabold text-slate-800 font-mono">{item.count}</span>
                    <span className="text-[10px] font-bold text-slate-400">({item.percent}%)</span>
                  </div>
                </div>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center ${item.color.split(' ')[0]} ${item.color.split(' ')[1]}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Primary Visual Centerpiece - Equal Columns on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Map Panel - Now takes 2 columns for prominent location tracking */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 flex flex-col shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              {language === 'en' ? 'Live Infrastructure Grievances Map' : 'लाइभ पूर्वाधार गुनासो नक्सा'}
            </h3>
            <button onClick={() => setCurrentTab('map-view')} className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-1">
              <span>{language === 'en' ? 'View Full Map' : 'पूर्ण नक्सा हेर्नुहोस्'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="h-[380px] rounded-xl overflow-hidden border border-slate-200 relative">
            <LeafletMap reports={reports} activeReportId={selectedReportId} />
          </div>
        </div>

        {/* Quick Contact & Quick Access links in the Right column */}
        <div className="flex flex-col gap-6">
          {/* Quick Access Grid Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between flex-1">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
              {language === 'en' ? 'Quick Actions' : 'द्रुत कार्यहरु'}
            </h3>
            <div className="grid grid-cols-2 gap-3 flex-1">
              {[
                { label: 'File Complaint', icon: FileText, color: 'text-blue-600 bg-blue-50/50', action: () => setCurrentTab('report-form') },
                { label: 'Grievance Maps', icon: Map, color: 'text-emerald-600 bg-emerald-50/50', action: () => setCurrentTab('map-view') },
                { label: 'Emergency Call', icon: Phone, color: 'text-rose-600 bg-rose-50/50', action: () => setShowEmergencyDialog(true) },
                { label: 'Submit Suggestion', icon: Info, color: 'text-purple-600 bg-purple-50/50', action: () => setShowFeedbackDialog(true) }
              ].map((act, idx) => {
                const Icon = act.icon;
                return (
                  <button
                    key={idx}
                    onClick={act.action}
                    className="p-3 border border-slate-100 hover:bg-slate-50 rounded-2xl flex flex-col items-center justify-center text-center space-y-2 transition-colors cursor-pointer"
                  >
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center ${act.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[9.5px] font-bold text-slate-750 block leading-tight">{act.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Stats Summary Card */}
          <div className="bg-gradient-to-br from-blue-900 to-indigo-950 text-white rounded-2xl p-5 shadow-md flex flex-col justify-between h-44">
            <div className="space-y-1">
              <span className="text-[8.5px] font-extrabold uppercase tracking-widest text-blue-300">Ghorahi Civic Trust</span>
              <h4 className="text-sm font-bold leading-tight">Your reports directly coordinate municipal action.</h4>
            </div>
            <div className="flex justify-between items-end border-t border-white/10 pt-4">
              <div>
                <div className="text-xl font-bold font-mono">{resolvedCount}</div>
                <div className="text-[8px] uppercase tracking-wider text-slate-300">Issues Resolved</div>
              </div>
              <button 
                onClick={() => setCurrentTab('report-form')}
                className="bg-white hover:bg-slate-100 text-blue-900 px-3 py-1.5 rounded-lg text-[9.5px] font-extrabold transition-colors cursor-pointer"
              >
                File New Report
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Central Interactive Public Complaints Feed - Full Width */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              {language === 'en' ? 'Interactive Public Complaints Feed' : 'नागरिकहरुका सार्वजनिक गुनासो फिड'}
            </h3>
            <p className="text-[9.5px] text-slate-500 font-bold mt-0.5">Explore active issues, support fellow citizens, and view real-time resolution logs.</p>
          </div>
        </div>

        <div className="max-h-[600px] overflow-y-auto pr-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {recentComplaints.length === 0 ? (
              <div className="col-span-full text-center py-10 text-xs text-slate-400 font-bold">No public complaints registered yet.</div>
            ) : (
              recentComplaints.map((comp) => {
                const isCrit = ['Critical', 'Emergency'].includes(comp.priority);
                const isRes = comp.status === 'Resolved';
                
                const statusColors = isRes
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                  : isCrit
                  ? 'bg-rose-50 text-rose-600 border-rose-100'
                  : comp.status === 'In_Progress' || comp.status === 'Assigned'
                  ? 'bg-amber-50 text-amber-600 border-amber-100'
                  : 'bg-blue-50 text-blue-600 border-blue-100';

                const reportCommentsCount = comments.filter(c => c.reportId === comp.id).length;
                const hasUpvoted = userLikes ? userLikes.includes(comp.id) : false;

                return (
                  <div 
                    key={comp.id} 
                    onClick={() => setActiveComplaintId(comp.id)}
                    className="bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md cursor-pointer hover:scale-[1.01] transition-all duration-200 rounded-2xl overflow-hidden flex flex-col sm:flex-row min-h-[170px]"
                  >
                    {/* Card Media Preview */}
                    <div className="w-full sm:w-44 h-36 sm:h-auto bg-slate-50 flex-shrink-0 relative overflow-hidden">
                      <MediaPreview report={comp} onClickMedia={(idx) => openLightboxForReport(comp, idx)} />
                      <span className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-sm text-white px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wide pointer-events-none z-10">
                        {comp.wardId ? `Ward ${comp.wardId}` : 'Ghorahi'}
                      </span>
                    </div>

                    {/* Card Text & Engagement Details */}
                    <div className="p-4 flex-1 flex flex-col justify-between min-w-0 space-y-3">
                      <div className="space-y-1">
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-[8.5px] font-extrabold uppercase tracking-wider text-blue-600">{t(comp.category)}</span>
                          <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 border rounded-lg tracking-wider shrink-0 select-none ${statusColors}`}>
                            {t(comp.status).replace('_', ' ')}
                          </span>
                        </div>
                        <h4 className="text-xs font-extrabold text-slate-800 line-clamp-1">{comp.title}</h4>
                        <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed font-bold">{comp.description}</p>
                      </div>

                      <div className="space-y-2 border-t border-slate-100 pt-2.5">
                        {/* Duplicate Readout Tracker */}
                        <p className="text-[8.5px] font-extrabold text-slate-500 flex items-center gap-1 select-none">
                          <Users className="w-3 h-3 text-slate-400" />
                          <span>This issue has been flagged by {comp.duplicateCount || 0} citizens near you.</span>
                        </p>

                        <div className="flex justify-between items-center text-[9px] font-bold text-slate-400">
                          <span>{formatBsDate(comp.createdAt)}</span>
                          
                          {/* Interaction Actions */}
                          <div className="flex items-center gap-3">
                            <button
                              onClick={(e) => handleLike(comp.id, e)}
                              className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border transition-colors cursor-pointer ${
                                hasUpvoted
                                  ? 'bg-blue-50 border-blue-200 text-blue-600 font-extrabold'
                                  : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                              }`}
                              title="Upvote / Support"
                            >
                              <ThumbsUp className="w-3.5 h-3.5" />
                              <span>{comp.supportCount}</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveComplaintId(comp.id);
                              }}
                              className="flex items-center gap-1.5 px-2 py-1 rounded-lg border bg-white border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer"
                              title="Comments"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>{reportCommentsCount}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Offices and Channel Share breakdown row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Offices Load */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="border-b border-slate-100 pb-2.5 mb-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              {language === 'en' ? 'Offices with the Most Complaints Received' : 'धेरै गुनासो प्राप्त हुने महानगरका शाखा कार्यालयहरु'}
            </h3>
            <p className="text-[9px] text-slate-500 font-bold mt-0.5">Accountability— Monitoring the offices with the most complaints to improve service and transparency</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {deptLoad.slice(0, 6).map((dept, idx) => (
              <div key={idx} className="p-3 border border-slate-100 rounded-xl bg-slate-50/30 flex flex-col justify-between text-center select-none min-h-[90px]">
                <h4 className="text-[9px] font-extrabold text-slate-500 leading-tight min-h-[24px] uppercase flex items-center justify-center">{dept.name.split(' ')[0]} {dept.name.split(' ')[1]}</h4>
                <div className="text-lg font-extrabold text-blue-600 font-mono mt-1">{dept.count}</div>
                <div className="text-[8px] text-slate-400 font-bold uppercase mt-1">Complaints</div>
              </div>
            ))}
          </div>
        </div>

        {/* Channel Share Pie Chart */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col shadow-sm">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">
            {language === 'en' ? 'Complaints Channels Distribution' : 'गुनासो प्राप्ति च्यानल विवरण'}
          </h3>
          <div className="flex items-center justify-around flex-1 py-2 gap-3">
            <div className="relative w-28 h-28 shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.91" fill="none" stroke="#e2e8f0" strokeWidth="4" />
                {/* Website - 47.4% */}
                <circle cx="18" cy="18" r="15.91" fill="none" stroke="#2563eb" strokeWidth="4" strokeDasharray="47 100" strokeDashoffset="0" />
                {/* Nagarik App - 42% */}
                <circle cx="18" cy="18" r="15.91" fill="none" stroke="#10b981" strokeWidth="4" strokeDasharray="42 100" strokeDashoffset="-47" />
                {/* Socials / Viber / WhatsApp - 11% */}
                <circle cx="18" cy="18" r="15.91" fill="none" stroke="#f59e0b" strokeWidth="4" strokeDasharray="11 100" strokeDashoffset="-89" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[7px] font-extrabold text-slate-400 uppercase">Channels</span>
                <span className="text-sm font-extrabold text-slate-800 font-mono leading-none mt-0.5">100%</span>
              </div>
            </div>
            <div className="space-y-1.5 text-[9px] font-bold text-slate-500 font-sans flex-1">
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" /> Website (47.4%)</div>
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" /> Mobile App (42.0%)</div>
              <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" /> Socials/Calls (10.6%)</div>
            </div>
          </div>
        </div>

      </div>

      {/* Contact Information Footer */}
      <footer className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm font-sans select-none leading-relaxed">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-blue-600 text-white flex items-center justify-center rounded-lg font-bold text-xs uppercase shadow-sm">
                ग
              </div>
              <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wide">Ghorahi Sub-Metropolitan Executive</h4>
            </div>
            <p className="text-[10px] text-slate-500 font-bold leading-relaxed">
              "Ghorahi Smart Civic Portal" is a grievance redressal platform designed to help citizens and administrative bodies engage, allowing the community to report and resolve public issues regarding infrastructure, sanitation, utilities, and emergency services directly with Ghorahi municipal authorities.
            </p>
            <p className="text-[10px] text-slate-500 font-bold">
              Office of the Municipal Executive, Ghorahi, Dang, Lumbini Province, Nepal
            </p>
          </div>
          <div>
            <h4 className="text-[10px] font-extrabold text-slate-800 uppercase tracking-widest mb-3">Links</h4>
            <ul className="space-y-1.5 text-[10px] font-bold text-slate-500">
              <li><button onClick={() => setCurrentTab('my-reports')} className="hover:text-blue-600 transition-colors bg-transparent border-none p-0 cursor-pointer text-left font-bold">Submitted Complaints</button></li>
              <li><button onClick={() => setShowFeedbackDialog(true)} className="hover:text-blue-600 transition-colors bg-transparent border-none p-0 cursor-pointer text-left font-bold">Official Policy</button></li>
              <li><button onClick={() => setShowEmergencyDialog(true)} className="hover:text-blue-600 transition-colors bg-transparent border-none p-0 cursor-pointer text-left font-bold">Emergency Contacts</button></li>
              <li><button onClick={() => setCurrentTab('map-view')} className="hover:text-blue-600 transition-colors bg-transparent border-none p-0 cursor-pointer text-left font-bold">Municipal Live Map</button></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[10px] font-extrabold text-slate-800 uppercase tracking-widest mb-3">Contact Information</h4>
            <div className="space-y-2.5 text-[10px] text-slate-600 font-bold">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-rose-50 flex items-center justify-center text-rose-600"><Phone className="w-3.5 h-3.5" /></div>
                <div>Hotline: <span className="font-extrabold text-slate-800 font-mono">1111</span></div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-blue-600"><Globe className="w-3.5 h-3.5" /></div>
                <div>Email: <span className="text-blue-600 select-all font-mono">gunaso@ghorahimun.gov.np</span></div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600"><Clock className="w-3.5 h-3.5" /></div>
                <div>Telephone: <span className="font-mono text-slate-800">082-560087</span></div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-purple-50 flex items-center justify-center text-purple-650"><Users className="w-3.5 h-3.5" /></div>
                <div>Mobile Helpline: <span className="font-mono text-slate-800">9851145045</span></div>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-100 pt-4 mt-6 text-center text-[9px] font-bold text-slate-400">
          © 2026 Ghorahi Sub-Metropolitan City Office of the Municipal Executive. All Rights Reserved.
        </div>
      </footer>

      {/* Refactored Centered Split Detail & Comments Modal with Glassmorphic Backdrop */}
      {activeComplaint && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-[9999] animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-4xl h-[85vh] flex flex-col md:flex-row overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            
            {/* Left Column: Complaint details, large image, and mini location map */}
            <div className="w-full md:w-1/2 p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-200 overflow-y-auto max-h-[40vh] md:max-h-full space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                    {t(activeComplaint.category)}
                  </span>
                  <span className={`text-[8.5px] font-extrabold uppercase px-2 py-0.5 border rounded-lg tracking-wider ${
                    activeComplaint.status === 'Resolved'
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                      : ['Critical', 'Emergency'].includes(activeComplaint.priority)
                      ? 'bg-rose-50 text-rose-600 border-rose-100'
                      : 'bg-amber-50 text-amber-600 border-amber-100'
                  }`}>
                    {t(activeComplaint.status)}
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-slate-800 tracking-tight leading-tight">{activeComplaint.title}</h3>
                
                {/* Large Media proof preview */}
                <div className="w-full h-44 bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative">
                  <MediaPreview report={activeComplaint} onClickMedia={(idx) => openLightboxForReport(activeComplaint, idx)} />
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 font-bold">
                  <p className="leading-relaxed font-semibold">{activeComplaint.description}</p>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-2 font-mono">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{activeComplaint.address} (Ward {activeComplaint.wardId})</span>
                  </div>
                </div>
              </div>

              {/* Coordinates tracking map */}
              <div className="space-y-1.5">
                <span className="text-[8px] font-extrabold uppercase tracking-widest text-slate-400">Grievance GPS Pinpoint</span>
                <ModalMap latitude={activeComplaint.latitude} longitude={activeComplaint.longitude} />
              </div>
            </div>

            {/* Right Column: discussion logs & pinned input form */}
            <div className="w-full md:w-1/2 flex flex-col justify-between h-[45vh] md:h-full bg-slate-50/30 relative">
              
              {/* Comments header */}
              <div className="p-4 pl-6 border-b border-slate-200 flex items-center justify-between flex-shrink-0 bg-white z-10">
                <div>
                  <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Public Discussion Logs</h4>
                  <p className="text-[9px] text-slate-400 font-bold mt-0.5">Citizens and officials updates</p>
                </div>
                <button 
                  onClick={() => {
                    setActiveComplaintId(null);
                    setNewCommentText('');
                  }} 
                  className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 bg-white shadow-sm transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Comments scroll area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[30vh] md:max-h-full">
                {comments.filter(c => c.reportId === activeComplaint.id).length === 0 ? (
                  <div className="text-center py-16 text-xs text-slate-400 font-bold">
                    No logs or feedback notes posted yet.
                  </div>
                ) : (
                  comments
                    .filter(c => c.reportId === activeComplaint.id)
                    .map((comment) => {
                      const isOfficial = comment.isOfficialUpdate;
                      return (
                        <div 
                          key={comment.id} 
                          className={`p-3.5 rounded-2xl border text-xs leading-relaxed space-y-1.5 ${
                            isOfficial 
                              ? 'bg-blue-50/40 border-blue-200 text-slate-700 shadow-sm' 
                              : 'bg-white border-slate-200 text-slate-600 shadow-inner-sm'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
                              {comment.userName}
                              {isOfficial && (
                                <span className="bg-blue-600 text-white text-[7.5px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                                  {comment.userRole}
                                </span>
                              )}
                            </span>
                            <span className="text-[8.5px] text-slate-400 font-mono font-bold">
                              {formatNepalTime(comment.createdAt).split(',')[0]}
                            </span>
                          </div>
                          <p className="text-slate-600 font-semibold mt-1">{comment.content}</p>
                        </div>
                      );
                    })
                )}
              </div>

              {/* Pinned text input area at the bottom */}
              <form onSubmit={handleSendComment} className="p-4 border-t border-slate-200 flex gap-2 flex-shrink-0 bg-white sticky bottom-0 z-15">
                <input
                  type="text"
                  value={newCommentText}
                  onChange={e => setNewCommentText(e.target.value)}
                  placeholder="Ask a question or offer helpful municipal info..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-semibold"
                />
                <button
                  type="submit"
                  disabled={!newCommentText.trim()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center justify-center cursor-pointer transition-colors disabled:opacity-50 text-xs font-bold"
                >
                  <Send className="w-3.5 h-3.5 mr-1" />
                  <span>Send</span>
                </button>
              </form>

            </div>
          </div>
        </div>
      )}

      {/* 1. View Details Modal */}
      {viewDetailReport && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col font-sans text-xs">
            <div className="bg-blue-800 text-white p-5 flex items-center justify-between flex-shrink-0">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-200">Complaint Details</span>
                <h2 className="text-sm font-bold mt-0.5">{`GSC-${new Date(viewDetailReport.createdAt).getFullYear() || 2026}-${viewDetailReport.id.substring(0, 6).toUpperCase()}`}</h2>
              </div>
              <button onClick={() => setViewDetailReport(null)} className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-200 text-xs font-bold text-slate-500 bg-slate-50 flex-shrink-0">
              <button onClick={() => setDetailModalTab('overview')} className={`px-5 py-3 border-b-2 transition-colors cursor-pointer ${detailModalTab === 'overview' ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent hover:text-slate-800'}`}>Overview</button>
              <button onClick={() => setDetailModalTab('timeline')} className={`px-5 py-3 border-b-2 transition-colors cursor-pointer ${detailModalTab === 'timeline' ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent hover:text-slate-800'}`}>Activity Timeline</button>
              <button onClick={() => setDetailModalTab('discussion')} className={`px-5 py-3 border-b-2 transition-colors cursor-pointer ${detailModalTab === 'discussion' ? 'border-blue-600 text-blue-600 bg-white' : 'border-transparent hover:text-slate-800'}`}>Discussion & Official Responses ({comments.filter(c => c.reportId === viewDetailReport.id).length})</button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs select-none">
              {detailModalTab === 'overview' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Subject</h3>
                    <p className="text-xs font-bold text-slate-800 mt-0.5">{viewDetailReport.title}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Description</h3>
                    <p className="text-xs text-slate-600 mt-0.5 whitespace-pre-wrap leading-relaxed font-semibold">{viewDetailReport.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category</h3>
                      <div className="mt-1 font-bold text-slate-700">{viewDetailReport.category}</div>
                    </div>
                    <div>
                      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Priority</h3>
                      <div className="mt-1">
                        {(() => {
                          switch (viewDetailReport.priority) {
                            case 'Emergency': return <span className="bg-red-100 text-red-700 border border-red-200 px-2 py-0.5 rounded text-[9px] font-extrabold">🚨 Emergency</span>;
                            case 'Critical': return <span className="bg-red-50 text-red-600 border border-red-100 px-2 py-0.5 rounded text-[9px] font-extrabold">🔴 Critical</span>;
                            case 'High': return <span className="bg-orange-50 text-orange-600 border border-orange-100 px-2 py-0.5 rounded text-[9px] font-extrabold">🟠 High</span>;
                            case 'Medium': return <span className="bg-amber-50 text-amber-600 border border-amber-100 px-2 py-0.5 rounded text-[9px] font-extrabold">🟡 Medium</span>;
                            case 'Low':
                            default: return <span className="bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded text-[9px] font-extrabold">🟢 Low</span>;
                          }
                        })()}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status</h3>
                      <div className="mt-1 font-extrabold text-blue-600 uppercase">{viewDetailReport.status}</div>
                    </div>
                    <div>
                      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date Submitted</h3>
                      <p className="text-xs text-slate-600 mt-1 font-bold">{formatNepalTime(viewDetailReport.createdAt)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ward / Location</h3>
                      <p className="text-xs text-slate-800 mt-1 font-bold">Ward {viewDetailReport.wardId}</p>
                      <p className="text-[10px] text-slate-500 font-bold mt-0.5">{viewDetailReport.address}</p>
                    </div>
                    <div>
                      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Coordinates</h3>
                      <p className="text-xs text-slate-800 mt-1 font-mono font-bold">{viewDetailReport.latitude.toFixed(6)}, {viewDetailReport.longitude.toFixed(6)}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assigned Department</h3>
                      <p className="text-xs text-slate-800 mt-1 font-bold">{viewDetailReport.assignedDepartment || 'Under Review'}</p>
                    </div>
                    <div>
                      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assigned Officer</h3>
                      <p className="text-xs text-slate-800 mt-1 font-bold">{viewDetailReport.assignedOfficer || 'Not yet assigned'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Estimated Budget</h3>
                      <p className="text-xs text-slate-800 mt-1 font-bold font-mono">Rs. {viewDetailReport.budgetEstimated?.toLocaleString() || '0'}</p>
                    </div>
                    <div>
                      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Amount Spent</h3>
                      <p className="text-xs text-slate-800 mt-1 font-bold font-mono">Rs. {viewDetailReport.budgetSpent?.toLocaleString() || '0'}</p>
                    </div>
                  </div>

                  {/* Uploaded Media Previews */}
                  {(viewDetailReport.images?.length > 0 || viewDetailReport.videos?.length > 0) && (
                    <div>
                      <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Uploaded Media</h3>
                      <div className="flex gap-2 flex-wrap">
                        {viewDetailReport.videos?.map((v: any, idx: number) => (
                          <div key={idx} onClick={() => openLightboxForReport(viewDetailReport, idx)} className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-200 cursor-pointer hover:opacity-85">
                            <video src={v.url} className="w-full h-full object-cover" muted />
                            <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
                              <Play className="w-5 h-5 text-white" />
                            </div>
                          </div>
                        ))}
                        {viewDetailReport.images?.map((img: any, idx: number) => (
                          <div key={idx} onClick={() => openLightboxForReport(viewDetailReport, (viewDetailReport.videos?.length || 0) + idx)} className="w-16 h-16 rounded-lg overflow-hidden border border-slate-200 cursor-pointer hover:opacity-85">
                            <img src={img.url} alt="detail-upload" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {detailModalTab === 'timeline' && (
                <div className="space-y-4 py-2">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Resolution Milestone Journey</h3>
                  {getTimelineSteps(viewDetailReport.status)}
                </div>
              )}

              {detailModalTab === 'discussion' && (
                <div className="space-y-4">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Municipality & Citizen Discussion</h3>
                  <div className="space-y-3 max-h-[30vh] overflow-y-auto pr-1 bg-slate-50 p-3 rounded-xl border border-slate-200/50">
                    {comments.filter(c => c.reportId === viewDetailReport.id).length === 0 ? (
                      <div className="text-center py-6 text-slate-500 font-bold">No updates or comments yet.</div>
                    ) : (
                      comments.filter(c => c.reportId === viewDetailReport.id).map(c => (
                        <div key={c.id} className={`p-2.5 rounded-lg border text-[11px] ${c.isOfficialUpdate ? 'bg-amber-50/70 border-amber-100' : 'bg-white border-slate-200'}`}>
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-slate-800 flex items-center gap-1">
                              {c.userName} 
                              {c.isOfficialUpdate && <span className="bg-amber-600 text-white text-[8px] px-1 rounded uppercase font-extrabold">Official</span>}
                            </span>
                            <span className="text-[9px] text-slate-500">{formatNepalTime(c.createdAt)}</span>
                          </div>
                          <p className="text-slate-700 font-semibold whitespace-pre-wrap">{c.content}</p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Post a Comment Form */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Post a query or feedback comment..."
                      value={newCommentText}
                      onChange={e => setNewCommentText(e.target.value)}
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:bg-white focus:border-blue-500 focus:outline-none font-bold"
                    />
                    <button
                      onClick={async () => {
                        if (!newCommentText.trim()) return;
                        await addComment(viewDetailReport.id, newCommentText);
                        setNewCommentText('');
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold hover:shadow cursor-pointer flex items-center justify-center"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end gap-2 text-xs font-bold flex-shrink-0">
              <button onClick={() => setViewDetailReport(null)} className="px-4 py-2 border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-600 cursor-pointer">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Edit Report Modal */}
      {editReportData && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden font-sans">
            <div className="bg-blue-800 text-white p-4 flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider">Edit Complaint Details</h2>
              <button onClick={() => setEditReportData(null)} className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const updates = {
                  title: (form.elements.namedItem('title') as HTMLInputElement).value,
                  description: (form.elements.namedItem('description') as HTMLTextAreaElement).value,
                  category: (form.elements.namedItem('category') as HTMLSelectElement).value,
                  priority: editReportData.priority,
                  latitude: Number((form.elements.namedItem('latitude') as HTMLInputElement).value),
                  longitude: Number((form.elements.namedItem('longitude') as HTMLInputElement).value),
                  address: (form.elements.namedItem('address') as HTMLInputElement).value,
                };
                await editReport(editReportData.id, updates);
                setEditReportData(null);
              }}
              className="p-5 space-y-3.5 text-xs text-slate-700 font-bold"
            >
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 uppercase">Complaint Title</label>
                <input name="title" defaultValue={editReportData.title} required className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-bold focus:bg-white focus:border-blue-500 focus:outline-none" />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 uppercase">Full Description</label>
                <textarea name="description" defaultValue={editReportData.description} required rows={3} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-bold focus:bg-white focus:border-blue-500 focus:outline-none" />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 uppercase">Category</label>
                <select name="category" defaultValue={editReportData.category} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-bold focus:bg-white focus:outline-none text-slate-700">
                  {['Garbage / Waste Management', 'Road Damage', 'Water Supply Problems', 'Drainage / Sewer', 'Street Light / Electricity', 'Public Infrastructure', 'Accident / Traffic Emergency', 'Fire Emergency', 'Public Safety / Crime'].map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 uppercase">Verified Address</label>
                <input name="address" defaultValue={editReportData.address} required className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-bold focus:bg-white focus:border-blue-500 focus:outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase">Latitude</label>
                  <input name="latitude" type="number" step="any" defaultValue={editReportData.latitude} required className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-bold focus:bg-white focus:border-blue-500 focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase">Longitude</label>
                  <input name="longitude" type="number" step="any" defaultValue={editReportData.longitude} required className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 font-bold focus:bg-white focus:border-blue-500 focus:outline-none" />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 text-xs font-bold">
                <button type="button" onClick={() => setEditReportData(null)} className="px-4 py-2 border border-slate-200 hover:bg-slate-100 rounded-lg text-slate-500 cursor-pointer">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Delete Confirmation Dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 w-full max-w-xs space-y-4 shadow-xl text-xs font-bold text-slate-700 font-sans">
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <h3>Confirm Soft-Delete</h3>
            </div>
            <p className="text-slate-500">Are you sure you want to delete this report? This action cannot be undone.</p>
            <div className="flex justify-end gap-2 pt-1 font-bold">
              <button onClick={() => setDeleteConfirmId(null)} className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded cursor-pointer">Cancel</button>
              <button
                onClick={async () => {
                  await deleteReport(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded cursor-pointer"
              >
                Delete Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Map Location Modal */}
      {mapLocationReport && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden font-sans">
            <div className="bg-blue-800 text-white p-4 flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider">GIS Geo-Location Pin</h2>
              <button onClick={() => setMapLocationReport(null)} className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="h-64 relative bg-slate-100">
              <LeafletMap reports={[mapLocationReport]} activeReportId={mapLocationReport.id} />
            </div>
            <div className="p-4 bg-slate-50 text-xs border-t border-slate-200 space-y-1">
              <div className="font-bold text-slate-800">{mapLocationReport.address}</div>
              <div className="text-[10px] text-slate-500 font-mono font-bold">GPS: {mapLocationReport.latitude.toFixed(6)}, {mapLocationReport.longitude.toFixed(6)} | Ward: {mapLocationReport.wardId}</div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Star Rating Feedback Modal */}
      {ratingReport && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 w-full max-w-sm space-y-4 shadow-xl font-sans text-xs font-bold text-slate-700">
            <h3 className="text-sm font-bold text-slate-800">Rate Service Resolution</h3>
            <p className="text-slate-600 font-semibold">How satisfied are you with Ghorahi's resolution of this complaint?</p>
            
            {/* Clickable star selection */}
            <div className="flex gap-1.5 justify-center py-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRatingStars(star)}
                  className="p-1 hover:scale-115 transition-transform cursor-pointer"
                >
                  <Star className={`w-7 h-7 ${star <= ratingStars ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                </button>
              ))}
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-slate-455 uppercase">Feedback Remarks</label>
              <textarea
                placeholder="Optional feedback or remarks..."
                value={ratingFeedback}
                onChange={e => setRatingFeedback(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs text-slate-700 focus:outline-none"
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2 pt-1 font-bold">
              <button onClick={() => setRatingReport(null)} className="px-3 py-1.5 border border-slate-200 rounded hover:bg-slate-50 text-slate-500 cursor-pointer">Cancel</button>
              <button
                onClick={async () => {
                  const feedbackString = `⭐ Service Rating: ${ratingStars}/5 Stars\nFeedback: ${ratingFeedback || 'Satisfactory work.'}`;
                  await addComment(ratingReport.id, feedbackString);
                  setRatingReport(null);
                  setRatingFeedback('');
                }}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded cursor-pointer"
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}

      {reopenId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 w-full max-w-sm space-y-4 shadow-xl font-sans text-xs font-bold text-slate-700">
            <h3 className="text-sm font-bold text-slate-800 font-sans">Reopen Resolved Complaint</h3>
            <textarea placeholder="Describe why this is still unresolved..." value={reopenNotes} onChange={e => setReopenNotes(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs text-slate-700 focus:outline-none" rows={3} />
            <input type="text" placeholder="Upload Reopen Photo URL (optional)" value={reopenImg} onChange={e => setReopenImg(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs text-slate-700 focus:outline-none" />
            <div className="flex justify-end gap-2 text-xs font-bold">
              <button onClick={() => setReopenId(null)} className="px-3 py-1.5 border border-slate-200 rounded hover:bg-slate-50 text-slate-500 cursor-pointer">Cancel</button>
              <button onClick={() => {
                handleReopen(reopenId);
                setReopenId(null);
              }} className="px-3 py-1.5 bg-blue-600 rounded hover:bg-blue-700 text-white cursor-pointer">Reopen</button>
            </div>
          </div>
        </div>
      )}

      {/* Emergency contacts modal */}
      {showEmergencyDialog && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 w-full max-w-sm space-y-4 shadow-xl text-slate-800 font-bold">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Phone className="w-4 h-4 text-red-500 animate-bounce" />
              <span>Ghorahi Emergency Contacts</span>
            </h3>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between border-b border-slate-100 pb-1.5"><span>Ward Police Desk:</span> <span>100 / 082-560199</span></div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5"><span>Ghorahi Fire Station:</span> <span>101 / 082-560233</span></div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5"><span>Dang District Hospital:</span> <span>082-560144</span></div>
              <div className="flex justify-between"><span>City Inquiry Desk:</span> <span>082-560087</span></div>
            </div>
            <button onClick={() => setShowEmergencyDialog(false)} className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer">
              Close Contacts
            </button>
          </div>
        </div>
      )}

      {showFeedbackDialog && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 w-full max-w-sm space-y-4 shadow-xl text-slate-800 font-bold">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Info className="w-4 h-4 text-blue-500" />
              <span>Submit Grievance Suggestion</span>
            </h3>
            <textarea placeholder="Write your grievance or suggestions for Ghorahi Sub-Metropolitan City..." className="w-full bg-slate-50 border border-slate-200 rounded p-2.5 text-xs text-slate-600 focus:outline-none" rows={3} />
            <button onClick={() => setShowFeedbackDialog(false)} className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer">
              Submit Suggestion
            </button>
          </div>
        </div>
      )}

      {/* Lightbox Media Viewer Overlay */}
      {lightboxData && (
        <MediaLightbox
          mediaList={lightboxData.mediaList}
          initialIndex={lightboxData.initialIndex}
          onClose={() => setLightboxData(null)}
        />
      )}
    </div>
  );
};

export default CitizenPortal;
