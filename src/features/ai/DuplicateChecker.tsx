import React from 'react';
import { useCivicStore } from '../../stores/civicStore';
import { AlertTriangle, Plus, ThumbsUp, MapPin } from 'lucide-react';

interface DuplicateCheckerProps {
  category: string;
  latitude: number;
  longitude: number;
  onConfirmNew: () => void;
  onSupported: () => void;
}

export const DuplicateChecker: React.FC<DuplicateCheckerProps> = ({
  category,
  latitude,
  longitude,
  onConfirmNew,
  onSupported
}) => {
  const { reports, supportReport } = useCivicStore();

  const duplicate = reports.find((r) => {
    if (r.category !== category) return false;
    const latDiff = Math.abs(r.latitude - latitude);
    const lngDiff = Math.abs(r.longitude - longitude);
    return latDiff < 0.005 && lngDiff < 0.005 && r.status !== 'Resolved' && r.status !== 'Closed';
  });

  if (!duplicate) {
    return null;
  }

  const handleSupport = () => {
    supportReport(duplicate.id);
    onSupported();
  };

  return (
    <div className="bg-amber-950/40 border border-amber-800/80 rounded-xl p-5 text-slate-200 mt-4 backdrop-blur-md">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 animate-bounce" />
        <div>
          <h4 className="text-sm font-bold text-amber-300">Possible Duplicate Civic Report Detected</h4>
          <p className="text-xs text-slate-300 mt-1">
            Our AI spatial matching detected an active report of the same category (<strong>{category}</strong>) reported close to this location.
          </p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-lg p-3.5 mt-4 flex items-start gap-4">
        {duplicate.images && duplicate.images[0] && (
          <img
            src={duplicate.images[0].url}
            alt="Existing Issue"
            className="w-20 h-20 rounded-md object-cover border border-slate-700"
          />
        )}
        <div className="flex-1">
          <h5 className="text-xs font-bold text-slate-100">{duplicate.title}</h5>
          <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">{duplicate.description}</p>
          <div className="flex items-center gap-3 mt-2 text-[9px] text-slate-500 font-mono">
            <span className="flex items-center gap-0.5">
              <MapPin className="w-3.5 h-3.5 text-slate-600" />
              Ward {duplicate.wardId}
            </span>
            <span className="bg-slate-800 text-blue-400 px-1.5 py-0.5 rounded">
              {duplicate.status.replace('_', ' ')}
            </span>
            <span>{duplicate.supportCount} supporters</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4">
        <button
          onClick={handleSupport}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-3 rounded-lg text-xs transition-colors shadow-glow"
        >
          <ThumbsUp className="w-3.5 h-3.5" />
          <span>Support & Upvote Existing</span>
        </button>
        <button
          onClick={onConfirmNew}
          className="flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 py-2 px-3 rounded-lg text-xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>File New Report Anyway</span>
        </button>
      </div>
    </div>
  );
};
export default DuplicateChecker;
