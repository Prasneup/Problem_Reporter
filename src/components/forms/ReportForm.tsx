import React, { useState } from 'react';
import { useCivicStore } from '../../stores/civicStore';
import { detectMunicipalityAndWard } from '../../utils/civicUtils';
import { LeafletMap } from '../maps/LeafletMap';
import AiImageScanner from '../../features/ai/AiImageScanner';
import DuplicateChecker from '../../features/ai/DuplicateChecker';
import type { ReportCategory } from '../../types';
import { MapPin, Upload, Image as ImageIcon } from 'lucide-react';

export const ReportForm: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const { submitReport, reports } = useCivicStore();
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [category, setCategory] = useState<ReportCategory>('Road Damage');
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [address, setAddress] = useState('');
  const [muni, setMuni] = useState('');
  const [ward, setWard] = useState<number>(1);
  const [imgUrl, setImgUrl] = useState('');
  const [aiVerified, setAiVerified] = useState(false);
  const [showDuplicateOverlay, setShowDuplicateOverlay] = useState(false);

  const handleMapClick = (lat: number, lng: number) => {
    setCoords({ lat, lng });
    const match = detectMunicipalityAndWard(lat, lng);
    setMuni(match.municipalityId);
    setWard(match.wardId);
    setAddress(match.address);
    setShowDuplicateOverlay(true);
  };

  const handleAutofillGps = () => {
    handleMapClick(28.067, 82.478); // Ghorahi Ward 15 default coordinates
  };

  // Local File Upload Handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setImgUrl(reader.result);
          setAiVerified(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!coords) return;
    submitReport({
      title,
      description: desc,
      category,
      latitude: coords.lat,
      longitude: coords.lng,
      address,
      municipalityId: muni,
      wardId: ward,
      isEmergency: category === 'Emergency',
      budgetEstimated: category === 'Emergency' ? 200000 : 45000,
      budgetSpent: 0,
      imageUrl: imgUrl || undefined
    });
    onSuccess();
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <input type="text" required placeholder="Issue Title (e.g. Broken Streetlight)" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:border-blue-500 focus:outline-none" />
          <textarea required placeholder="Describe the issue in detail..." value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:border-blue-500 focus:outline-none" />

          <select value={category} onChange={(e) => setCategory(e.target.value as ReportCategory)} className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:border-blue-500 focus:outline-none">
            {['Road Damage', 'Potholes', 'Garbage', 'Water Supply', 'Drainage', 'Electricity', 'Street Lights', 'Environmental Issues', 'Public Safety', 'Infrastructure Problems', 'Other', 'Emergency'].map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Local File Selector & Remote URL Loader */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <label className="flex-1 flex items-center justify-center gap-2 bg-slate-900 border border-slate-800 border-dashed rounded-lg p-2.5 text-xs text-slate-400 hover:text-slate-200 cursor-pointer hover:border-blue-500/50 transition-colors">
                <Upload className="w-4 h-4 text-blue-400" />
                <span>Upload Image File</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>

              <button type="button" onClick={handleAutofillGps} className="bg-slate-800 text-slate-300 px-3 py-2.5 rounded-lg border border-slate-700 hover:bg-slate-700 text-xs font-semibold flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                Use GPS
              </button>
            </div>

            <div className="flex items-center gap-2">
              <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
              <input type="text" placeholder="Or paste image URL link..." value={imgUrl.startsWith('data:') ? '' : imgUrl} onChange={(e) => { setImgUrl(e.target.value); setAiVerified(false); }} className="flex-1 bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:border-blue-500 focus:outline-none" />
            </div>
          </div>

          {imgUrl && <AiImageScanner imageUrl={imgUrl} category={category} onAnalysisComplete={() => setAiVerified(true)} />}
        </div>

        <div className="space-y-3">
          <div className="h-[250px] rounded-xl overflow-hidden border border-slate-800">
            <LeafletMap reports={reports} onSelectCoords={handleMapClick} selectedCoords={coords} />
          </div>
          {coords && (
            <div className="bg-slate-900/40 border border-slate-800 p-3 rounded-lg text-xs space-y-1.5 font-mono text-slate-300">
              <div>📍 Lat/Lng: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}</div>
              <div>🏠 Muni/Ward: {muni.toUpperCase()} - Ward {ward}</div>
              <div>📮 Est Address: {address}</div>
            </div>
          )}
        </div>
      </div>

      {coords && showDuplicateOverlay && (
        <DuplicateChecker category={category} latitude={coords.lat} longitude={coords.lng} onConfirmNew={() => setShowDuplicateOverlay(false)} onSupported={onSuccess} />
      )}

      <button type="submit" disabled={!coords || (imgUrl && !aiVerified) || showDuplicateOverlay} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-800 disabled:text-slate-600 disabled:border-transparent font-semibold py-2.5 rounded-lg text-xs transition-colors shadow-glow text-white">
        Submit Report
      </button>
    </form>
  );
};
export default ReportForm;
