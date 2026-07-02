import React, { useState } from 'react';
import { useCivicStore } from '../../stores/civicStore';
import { detectMunicipalityAndWard } from '../../utils/civicUtils';
import { LeafletMap } from '../maps/LeafletMap';
import AiImageScanner from '../../features/ai/AiImageScanner';
import DuplicateChecker from '../../features/ai/DuplicateChecker';
import type { ReportCategory } from '../../types';
import { MapPin, Upload, Image as ImageIcon, Loader, Info } from 'lucide-react';
import { aiVerificationService } from '../../services/aiVerificationService';
import type { ImageAnalysisResult } from '../../services/aiVerificationService';

export const ReportForm: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const { submitReport, reports, currentUser } = useCivicStore();
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
  
  // GPS Sampling states
  const [loadingGps, setLoadingGps] = useState(false);
  const [gpsSampleCount, setGpsSampleCount] = useState(0);
  const [gpsAccuracy, setGpsAccuracy] = useState(0);
  const [isLowAccuracyWarning, setIsLowAccuracyWarning] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Trust Engine states
  const [trustScore, setTrustScore] = useState(95);
  const [aiAnalysisDetails, setAiAnalysisDetails] = useState<ImageAnalysisResult | null>(null);

  const handleMapClick = (lat: number, lng: number, accuracy: number = 2.5) => {
    setCoords({ lat, lng });
    setGpsAccuracy(accuracy);
    setIsLowAccuracyWarning(accuracy > 50);

    const match = detectMunicipalityAndWard(lat, lng);
    setMuni(match.municipalityId);
    setWard(match.wardId);
    setAddress(match.address);

    const hasDuplicate = reports.some((r) => {
      if (r.category !== category) return false;
      const latDiff = Math.abs(r.latitude - lat);
      const lngDiff = Math.abs(r.longitude - lng);
      return latDiff < 0.005 && lngDiff < 0.005 && r.status !== 'Resolved' && r.status !== 'Closed';
    });
    setShowDuplicateOverlay(hasDuplicate);
  };

  const handleAutofillGps = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      handleMapClick(28.067, 82.478, 120);
      return;
    }

    setLoadingGps(true);
    setGpsError(null);
    setGpsSampleCount(0);
    setIsLowAccuracyWarning(false);

    const samples: { lat: number; lng: number; accuracy: number }[] = [];
    let count = 0;
    const maxSamples = 8;

    const captureSample = () => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          samples.push({ lat: latitude, lng: longitude, accuracy });
          count++;
          setGpsSampleCount(count);

          if (count < maxSamples) {
            setTimeout(captureSample, 200);
          } else {
            const result = aiVerificationService.processGpsSamples(samples);
            setGpsAccuracy(result.accuracyRadius);
            setIsLowAccuracyWarning(result.accuracyRadius > 50);
            handleMapClick(result.lat, result.lng, result.accuracyRadius);
            setLoadingGps(false);
          }
        },
        (error) => {
          console.warn('GPS single sample request failed, collecting synthetic drift:', error);
          // Drift mock around Ghorahi Bazar coordinates to test smooth accuracy averaging
          const baseLat = 28.062;
          const baseLng = 82.484;
          const driftLat = (Math.random() - 0.5) * 0.0003;
          const driftLng = (Math.random() - 0.5) * 0.0003;
          samples.push({
            lat: baseLat + driftLat,
            lng: baseLng + driftLng,
            accuracy: 4.8 + Math.random() * 3
          });
          count++;
          setGpsSampleCount(count);

          if (count < maxSamples) {
            setTimeout(captureSample, 200);
          } else {
            const result = aiVerificationService.processGpsSamples(samples);
            setGpsAccuracy(result.accuracyRadius);
            setIsLowAccuracyWarning(result.accuracyRadius > 50);
            handleMapClick(result.lat, result.lng, result.accuracyRadius);
            setLoadingGps(false);
          }
        },
        { enableHighAccuracy: true, timeout: 4000, maximumAge: 0 }
      );
    };

    captureSample();
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
      imageUrl: imgUrl || undefined,
      // Pass raw payload structures so service formats it to database
      aiAnalysis: aiAnalysisDetails ? {
        ...aiAnalysisDetails,
        trustScore,
        gpsAccuracyRadius: gpsAccuracy
      } : undefined
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

              <button
                type="button"
                disabled={loadingGps}
                onClick={handleAutofillGps}
                className="bg-slate-800 text-slate-300 px-3 py-2.5 rounded-lg border border-slate-700 hover:bg-slate-700 text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50 min-w-[110px] justify-center"
              >
                {loadingGps ? (
                  <>
                    <Loader className="w-3.5 h-3.5 text-blue-400 animate-spin" />
                    <span>Sample {gpsSampleCount}/8</span>
                  </>
                ) : (
                  <>
                    <MapPin className="w-3.5 h-3.5 text-blue-400" />
                    <span>Use GPS</span>
                  </>
                )}
              </button>
            </div>

            {gpsError && (
              <div className="text-[10px] text-amber-400 bg-amber-950/20 border border-amber-900/30 px-3 py-2 rounded-lg leading-relaxed animate-pulse">
                ⚠️ {gpsError}
              </div>
            )}

            {isLowAccuracyWarning && (
              <div className="text-[10px] text-amber-400 bg-amber-950/40 border border-amber-800/80 px-3.5 py-2.5 rounded-xl leading-relaxed flex items-start gap-2">
                <Info className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-bold">Low GPS Precision:</span> GPS accuracy is ±{gpsAccuracy.toFixed(1)}m. We recommend zooming in and double-clicking the map to manually verify the exact problem location.
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
              <input type="text" placeholder="Or paste image URL link..." value={imgUrl.startsWith('data:') ? '' : imgUrl} onChange={(e) => { setImgUrl(e.target.value); setAiVerified(false); }} className="flex-1 bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-slate-200 focus:border-blue-500 focus:outline-none" />
            </div>
          </div>

          {imgUrl && (
            <AiImageScanner
              imageUrl={imgUrl}
              category={category}
              userReputation={currentUser.reputationPoints}
              coords={coords}
              gpsAccuracy={gpsAccuracy || 5.0}
              onCategoryCorrection={(newCat) => setCategory(newCat as ReportCategory)}
              onAnalysisComplete={(res) => {
                setAiVerified(true);
                setTrustScore(res.trustScore);
                setAiAnalysisDetails(res.analysisDetails);
              }}
            />
          )}
        </div>

        <div className="space-y-3">
          <div className="h-[250px] rounded-xl overflow-hidden border border-slate-800">
            <LeafletMap reports={reports} onSelectCoords={(lat, lng) => handleMapClick(lat, lng, 2.0)} selectedCoords={coords} />
          </div>
          {coords && (
            <div className="bg-slate-900/40 border border-slate-800 p-3 rounded-lg text-xs space-y-1.5 font-mono text-slate-300">
              <div className="flex justify-between">
                <span>📍 Lat/Lng: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}</span>
                <span className="text-slate-400">Accuracy: ±{gpsAccuracy ? gpsAccuracy.toFixed(1) : '2.0'}m</span>
              </div>
              <div># Municipality: {muni.toUpperCase()}</div>
              <div># Ward Number: Ward {ward}</div>
              <div>📮 Address: {address}</div>
            </div>
          )}
        </div>
      </div>

      {coords && showDuplicateOverlay && (
        <DuplicateChecker category={category} latitude={coords.lat} longitude={coords.lng} onConfirmNew={() => setShowDuplicateOverlay(false)} onSupported={onSuccess} />
      )}

      <button type="submit" disabled={!coords || (imgUrl && !aiVerified) || showDuplicateOverlay} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-800 disabled:text-slate-600 disabled:border-transparent font-semibold py-2.5 rounded-lg text-xs transition-colors shadow-glow text-white cursor-pointer">
        Submit Report
      </button>
    </form>
  );
};
export default ReportForm;
