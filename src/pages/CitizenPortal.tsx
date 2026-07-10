import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { useCivicStore } from '../stores/civicStore';
import { LeafletMap } from '../components/maps/LeafletMap';
import { ReportForm } from '../components/forms/ReportForm';
import { formatNepalTime } from '../utils/civicUtils';
import { useTranslation } from '../hooks/useTranslation';
import {
  AlertTriangle, Sun, Clock, Users, Phone, Map, FileText, 
  MessageCircle, Info, CheckCircle, RefreshCw, EyeOff, Award, Globe, 
  MessageSquare, Shield, ArrowRight, ThumbsUp, Send, X, MapPin, Play
} from 'lucide-react';
import { MediaLightbox } from '../components/common/MediaLightbox';
import ghorahiBanner from '../assets/ghorahi_banner.jpg';


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
  'Street Lighting / Utilities': 'https://images.unsplash.com/photo-1509395062183-67c5ad6faff9?w=400&auto=format&fit=crop&q=60',
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
  const { reports, currentUser, reopenReport, supportReport, addComment, comments, userLikes } = useCivicStore();
  const [selectedReportId] = useState<string | undefined>(undefined);

  const [reopenId, setReopenId] = useState<string | null>(null);
  const [reopenNotes, setReopenNotes] = useState('');
  const [reopenImg, setReopenImg] = useState('');
  
  // Refactored State Pattern: Explicit Selected Complaint Id tracking
  const [activeComplaintId, setActiveComplaintId] = useState<string | null>(null);
  const [newCommentText, setNewCommentText] = useState('');

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
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  // Ghorahi departments complaint load calculation
  const deptLoad = [
    { name: 'Road & Infrastructure Division', count: reports.filter(r => r.assignedDepartment === 'Road & Infrastructure Division').length + 8 },
    { name: 'Sanitation / Waste Management Mahashakha', count: reports.filter(r => r.assignedDepartment === 'Sanitation / Waste Management Mahashakha').length + 5 },
    { name: 'Water Supply & Irrigation Division', count: reports.filter(r => r.assignedDepartment === 'Water Supply & Irrigation Division').length + 4 },
    { name: 'Sewerage & Drainage Division', count: reports.filter(r => r.assignedDepartment === 'Sewerage & Drainage Division').length + 3 },
    { name: 'Street Lighting & Energy Division', count: reports.filter(r => r.assignedDepartment === 'Street Lighting & Energy Division').length + 2 },
    { name: 'Traffic Police Division', count: reports.filter(r => r.assignedDepartment === 'Traffic Police Division').length + 2 }
  ].sort((a, b) => b.count - a.count);

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
    return (
      <div className="glass-panel p-6 font-sans">
        <h2 className="text-base font-bold text-slate-800 mb-4">My Submitted Reports ({citizenReports.length})</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/50">
                <th className="py-3 px-3">Title</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Budget (Est/Spent)</th>
                <th className="py-3 px-3">Date Submitted</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {citizenReports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400 font-bold">You haven't submitted any reports yet.</td>
                </tr>
              ) : (
                citizenReports.map(r => (
                  <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50/50 text-slate-600 font-semibold">
                    <td className="py-3 px-3 font-bold text-slate-850">{r.title}</td>
                    <td className="py-3 px-3">{t(r.category)}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-slate-100 text-blue-600 border border-slate-200">
                        {t(r.status)}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-700">रू {r.budgetEstimated} / {r.budgetSpent}</td>
                    <td className="py-3 px-3">{formatNepalTime(r.createdAt).split(',')[0]}</td>
                    <td className="py-3 px-3 text-right">
                      {r.status === 'Resolved' && (
                        <button
                          onClick={() => setReopenId(r.id)}
                          className="bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-600 px-2.5 py-1 rounded font-bold text-[10px] transition-colors cursor-pointer"
                        >
                          Reopen Issue
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {reopenId && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 w-full max-w-sm space-y-4 shadow-xl font-bold">
              <h3 className="text-xs font-bold text-slate-800">Reopen Resolved Complaint</h3>
              <textarea placeholder="Describe why this is still unresolved..." value={reopenNotes} onChange={e => setReopenNotes(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs text-slate-600 focus:outline-none" rows={3} />
              <input type="text" placeholder="Upload Reopen Photo URL" value={reopenImg} onChange={e => setReopenImg(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-xs text-slate-600 focus:outline-none" />
              <div className="flex justify-end gap-2 text-xs font-bold">
                <button onClick={() => setReopenId(null)} className="px-3 py-1.5 border border-slate-200 rounded hover:bg-slate-50 text-slate-500">Cancel</button>
                <button onClick={() => handleReopen(reopenId)} className="px-3 py-1.5 bg-blue-600 rounded hover:bg-blue-700 text-white">Reopen</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
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
          <span className="text-blue-650">|</span>
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
              <div className="text-[10px] text-slate-450 font-bold">Ghorahi, Dang</div>
            </div>
            <Sun className="w-10 h-10 text-amber-500 animate-spin-slow" />
          </div>
          <div className="text-[10px] text-slate-450 border-t border-slate-100 pt-3 flex justify-between items-center font-bold">
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
                <span className="text-[9px] font-bold text-slate-650 leading-tight">{ch.label}</span>
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
            <p className="text-[9.5px] text-slate-450 font-bold mt-0.5">Explore active issues, support fellow citizens, and view real-time resolution logs.</p>
          </div>
          <span onClick={() => setCurrentTab('my-reports')} className="text-[10px] font-bold text-blue-600 hover:underline cursor-pointer">
            {language === 'en' ? 'View My list' : 'मेरो सूची हेर्नुहोस्'}
          </span>
        </div>

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
                      <p className="text-[8.5px] font-extrabold text-slate-450 flex items-center gap-1 select-none">
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
                                ? 'bg-blue-50 border-blue-200 text-blue-650 font-extrabold'
                                : 'bg-white border-slate-150 text-slate-500 hover:bg-slate-50'
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
                            className="flex items-center gap-1.5 px-2 py-1 rounded-lg border bg-white border-slate-150 text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer"
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

      {/* Offices and Channel Share breakdown row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Offices Load */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="border-b border-slate-100 pb-2.5 mb-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              {language === 'en' ? 'Offices with the Most Complaints Received' : 'धेरै गुनासो प्राप्त हुने महानगरका शाखा कार्यालयहरु'}
            </h3>
            <p className="text-[9px] text-slate-450 font-bold mt-0.5">Accountability— Monitoring the offices with the most complaints to improve service and transparency</p>
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
      <footer className="bg-white border border-slate-250 rounded-2xl p-6 shadow-sm font-sans select-none leading-relaxed">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-blue-600 text-white flex items-center justify-center rounded-lg font-bold text-xs uppercase shadow-sm">
                ग
              </div>
              <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wide">Ghorahi Sub-Metropolitan Executive</h4>
            </div>
            <p className="text-[10px] text-slate-450 font-bold leading-relaxed">
              "Ghorahi Smart Civic Portal" is a grievance redressal platform designed to help citizens and administrative bodies engage, allowing the community to report and resolve public issues regarding infrastructure, sanitation, utilities, and emergency services directly with Ghorahi municipal authorities.
            </p>
            <p className="text-[10px] text-slate-450 font-bold">
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
            <div className="space-y-2.5 text-[10px] text-slate-650 font-bold">
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
            <div className="w-full md:w-1/2 p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-150 overflow-y-auto max-h-[40vh] md:max-h-full space-y-4">
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
                <div className="w-full h-44 bg-slate-100 rounded-2xl overflow-hidden border border-slate-150 shadow-sm relative">
                  <MediaPreview report={activeComplaint} onClickMedia={(idx) => openLightboxForReport(activeComplaint, idx)} />
                </div>

                <div className="space-y-1.5 text-xs text-slate-650 font-bold">
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
              <div className="p-4 pl-6 border-b border-slate-150 flex items-center justify-between flex-shrink-0 bg-white z-10">
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
                              ? 'bg-blue-50/40 border-blue-150 text-slate-700 shadow-sm' 
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
              <form onSubmit={handleSendComment} className="p-4 border-t border-slate-150 flex gap-2 flex-shrink-0 bg-white sticky bottom-0 z-15">
                <input
                  type="text"
                  value={newCommentText}
                  onChange={e => setNewCommentText(e.target.value)}
                  placeholder="Ask a question or offer helpful municipal info..."
                  className="flex-1 bg-slate-50 border border-slate-250 rounded-xl px-4 py-2 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-semibold"
                />
                <button
                  type="submit"
                  disabled={!newCommentText.trim()}
                  className="bg-blue-650 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center justify-center cursor-pointer transition-colors disabled:opacity-50 text-xs font-bold"
                >
                  <Send className="w-3.5 h-3.5 mr-1" />
                  <span>Send</span>
                </button>
              </form>

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
