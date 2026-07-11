import React, { useState, useEffect } from 'react';
import { useCivicStore } from '../../stores/civicStore';
import { LocationPickerMap } from '../maps/LocationPickerMap';
import { detectMunicipalityAndWard } from '../../utils/civicUtils';
import { aiVerificationService } from '../../services/aiVerificationService';
import { DuplicateChecker } from '../../features/ai/DuplicateChecker';
import { AiImageScanner } from '../../features/ai/AiImageScanner';
import type { ReportCategory } from '../../types';
import { Upload, MapPin, Loader, Info, Image as ImageIcon, Video, Trash } from 'lucide-react';

interface GPSReading {
  lat: number;
  lng: number;
  accuracy: number;
}

interface ReportFormProps {
  onSuccess: () => void;
}

export const ReportForm: React.FC<ReportFormProps> = ({ onSuccess }) => {
  const { submitReport, reports, currentUser } = useCivicStore();

  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [category, setCategory] = useState<ReportCategory>('Road Damage');
  const [imgUrl, setImgUrl] = useState('');
  const [aiVerified, setAiVerified] = useState(false);
  const [trustScore, setTrustScore] = useState<number>(100);
  const [aiAnalysisDetails, setAiAnalysisDetails] = useState<any>(null);

  // Ghorahi Project Specific Upload states (5 Images Max, 60s Video Max 100MB)
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [videoError, setVideoError] = useState<string | null>(null);

  // Initialize coordinates to Ghorahi center (default fallback so user is never locked out of submissions)
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>({ lat: 28.062, lng: 82.484 });
  const [muni, setMuni] = useState('Ghorahi');
  const [ward, setWard] = useState<number>(15);
  const [address, setAddress] = useState('Ghorahi Bazar Ward 15, Dang District, Nepal');
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(5.0);
  const [loadingGps, setLoadingGps] = useState(false);
  const [gpsSampleCount, setGpsSampleCount] = useState(0);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [isLowAccuracyWarning, setIsLowAccuracyWarning] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  // Duplicate Check triggers
  const [showDuplicateOverlay, setShowDuplicateOverlay] = useState(false);

  // Automatically request geolocation on mount
  useEffect(() => {
    handleAutofillGps();
  }, []);

  // Center map on user's registered ward when user profile changes
  useEffect(() => {
    if (currentUser?.wardId) {
      const wardId = currentUser.wardId;
      const centers: Record<number, [number, number]> = {
        1: [28.085, 82.445],
        2: [28.092, 82.465],
        3: [28.080, 82.495],
        4: [28.068, 82.510],
        5: [28.055, 82.520],
        6: [28.042, 82.505],
        7: [28.035, 82.485],
        8: [28.045, 82.455],
        9: [28.058, 82.440],
        10: [28.065, 82.460],
        11: [28.072, 82.475],
        12: [28.060, 82.485],
        13: [28.050, 82.495],
        14: [28.075, 82.500],
        15: [28.064, 82.480],
        16: [28.090, 82.515],
        17: [28.100, 82.480],
        18: [28.110, 82.460],
        19: [28.105, 82.440]
      };
      const center = centers[wardId] || [28.064, 82.480];
      setCoords({ lat: center[0], lng: center[1] });
      setWard(wardId);
      
      const geoResult = detectMunicipalityAndWard(center[0], center[1]);
      setMuni(geoResult.municipalityName);
      setAddress(geoResult.address);
    }
  }, [currentUser]);

  const handleMapClick = (lat: number, lng: number, accuracy: number = 2.0) => {
    setCoords({ lat, lng });
    setGpsAccuracy(accuracy);
    setIsLowAccuracyWarning(accuracy > 50);

    const geoResult = detectMunicipalityAndWard(lat, lng);
    setMuni(geoResult.municipalityName);
    setWard(geoResult.wardId);
    setAddress(geoResult.address);
    setGpsError(null);
  };

  const handleAutofillGps = () => {
    if (!navigator.geolocation) {
      setGpsError("Geolocation is not supported by your browser — please tap on the map to set your location manually.");
      setLoadingGps(false);
      return;
    }

    setLoadingGps(true);
    setGpsError(null);
    setGpsSampleCount(0);
    setIsLowAccuracyWarning(false);

    const samples: GPSReading[] = [];
    const maxSamples = 8;
    let count = 0;

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
          console.warn('GPS single sample request failed:', error);
          setLoadingGps(false);
          if (error.code === 1) { // PERMISSION_DENIED
            setGpsError("Location access denied — please enable location services or tap on the map to set your location manually.");
          } else {
            setGpsError("Location detection failed — please tap on the map to set your location manually.");
          }
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    };

    captureSample();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (uploadedImages.length >= 5) {
      alert("Maximum of 5 images allowed.");
      return;
    }

    setAiVerified(false);
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setUploadedImages(prev => [...prev, base64]);
      setImgUrl(base64); // Use latest as main preview
    };
    reader.readAsDataURL(file);
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setVideoError(null);

    // Verify format
    const allowedExtensions = ['mp4', 'mov', 'avi'];
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !allowedExtensions.includes(ext)) {
      setVideoError("Format must be MP4, MOV, or AVI.");
      return;
    }

    // Verify size (Max 100MB)
    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      setVideoError("Video size exceeds 100 MB limit.");
      return;
    }

    // Verify duration (Max 60s)
    const tempVideo = document.createElement('video');
    tempVideo.preload = 'metadata';
    tempVideo.onloadedmetadata = () => {
      window.URL.revokeObjectURL(tempVideo.src);
      if (tempVideo.duration > 60) {
        setVideoError("Video duration exceeds 60 seconds.");
      } else {
        // Read file as base64
        const reader = new FileReader();
        reader.onloadend = () => {
          setVideoUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    };
    tempVideo.src = window.URL.createObjectURL(file);
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
    if (index === 0 && uploadedImages.length > 1) {
      setImgUrl(uploadedImages[1]);
    } else if (uploadedImages.length <= 1) {
      setImgUrl('');
    }
  };

  // Reset duplicate overlay when category or coords change
  useEffect(() => {
    if (coords) {
      setShowDuplicateOverlay(true);
    }
  }, [category, coords]);

  // Determine if a real duplicate is present in local cache
  const hasDuplicate = coords ? reports.some((r) => {
    if (r.category !== category) return false;
    const latDiff = Math.abs(r.latitude - coords.lat);
    const lngDiff = Math.abs(r.longitude - coords.lng);
    return latDiff < 0.005 && lngDiff < 0.005 && r.status !== 'Resolved' && r.status !== 'Closed';
  }) : false;

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coords) return;

    const isEmergency = ['Accident / Traffic Emergency', 'Fire Emergency', 'Public Safety / Crime'].includes(category);

    // Anti-Fake rule: Emergency level requires at least one image or video evidence
    if (isEmergency && uploadedImages.length === 0 && !videoUrl) {
      alert("Validation Error: Proof of evidence (image or video) is mandatory for submitting an Emergency complaint.");
      return;
    }

    setSubmitting(true);
    try {
      await submitReport({
        title,
        description: desc,
        category,
        latitude: coords.lat,
        longitude: coords.lng,
        address,
        municipalityId: muni,
        wardId: ward,
        isEmergency,
        budgetEstimated: isEmergency ? 250000 : 45000,
        budgetSpent: 0,
        imageUrls: uploadedImages,
        videoUrl: videoUrl || undefined,
        aiAnalysis: aiAnalysisDetails ? {
          ...aiAnalysisDetails,
          trustScore,
          gpsAccuracyRadius: gpsAccuracy
        } : undefined
      });
      onSuccess();
    } catch (err: any) {
      console.error('Failed to submit report:', err);
      alert('Error submitting report: ' + (err.message || err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4 font-sans text-slate-700 select-none">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <input 
            type="text" 
            required 
            placeholder="Issue Title (e.g. Broken Streetlight)" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-700 focus:bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none font-bold placeholder-slate-400" 
          />
          <textarea 
            required 
            placeholder="Describe the issue in detail..." 
            value={desc} 
            onChange={(e) => setDesc(e.target.value)} 
            rows={3} 
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-700 focus:bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none font-bold placeholder-slate-400" 
          />

          <select 
            value={category} 
            onChange={(e) => setCategory(e.target.value as ReportCategory)} 
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-750 font-bold focus:bg-white focus:outline-none"
          >
            {[
              'Garbage / Waste Management', 
              'Road Damage', 
              'Water Supply Problems', 
              'Drainage / Sewer', 
              'Street Light / Electricity', 
              'Public Infrastructure', 
              'Accident / Traffic Emergency', 
              'Fire Emergency', 
              'Public Safety / Crime'
            ].map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Local File Selector & Remote URL Loader */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <label className="flex-1 flex items-center justify-center gap-2 bg-slate-50 border border-slate-200 border-dashed rounded-xl p-3 text-xs text-slate-500 hover:text-slate-800 cursor-pointer hover:border-blue-500/50 transition-colors font-bold">
                <Upload className="w-4 h-4 text-blue-600" />
                <span>Upload Image ({uploadedImages.length}/5)</span>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
              </label>

              <label className="flex-1 flex items-center justify-center gap-2 bg-slate-50 border border-slate-200 border-dashed rounded-xl p-3 text-xs text-slate-500 hover:text-slate-800 cursor-pointer hover:border-blue-500/50 transition-colors font-bold">
                <Video className="w-4 h-4 text-blue-600" />
                <span>{videoUrl ? 'Video Uploaded' : 'Upload Video (Max 60s)'}</span>
                <input type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />
              </label>

              <button
                type="button"
                disabled={loadingGps}
                onClick={handleAutofillGps}
                className="bg-slate-100 text-slate-600 px-4 py-3 rounded-xl border border-slate-200 hover:bg-slate-200/80 text-xs font-bold flex items-center gap-1.5 disabled:opacity-50 min-w-[110px] justify-center cursor-pointer"
              >
                {loadingGps ? (
                  <>
                    <Loader className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                    <span>Sample {gpsSampleCount}/8</span>
                  </>
                ) : (
                  <>
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    <span>Use GPS</span>
                  </>
                )}
              </button>
            </div>

            {/* Uploaded Thumbnails Queue */}
            {uploadedImages.length > 0 && (
              <div className="flex gap-2 flex-wrap bg-slate-50 p-2 rounded-xl border border-slate-200/50">
                {uploadedImages.map((img, idx) => (
                  <div key={idx} className="relative w-12 h-12 rounded border border-slate-200 overflow-hidden group">
                    <img src={img} alt="preview" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeImage(idx)} className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {videoError && (
              <div className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-150 px-3 py-1.5 rounded-lg">
                ⚠️ {videoError}
              </div>
            )}

            {/* GPS warning message is now rendered under the map on the right */}

            {isLowAccuracyWarning && (
              <div className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200/80 px-3.5 py-2.5 rounded-xl leading-relaxed flex items-start gap-2 font-bold">
                <Info className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-extrabold text-amber-800">Low GPS Precision:</span> GPS accuracy is ±{gpsAccuracy?.toFixed(1)}m. We recommend zooming in and clicking the map to manually verify the exact problem location.
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
              <input 
                type="text" 
                placeholder="Or paste image URL link..." 
                value={imgUrl.startsWith('data:') ? '' : imgUrl} 
                onChange={(e) => { setImgUrl(e.target.value); setAiVerified(false); }} 
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-700 font-bold focus:bg-white focus:outline-none placeholder-slate-400" 
              />
            </div>
          </div>

          {imgUrl && (
            <AiImageScanner
              imageUrl={imgUrl}
              category={category}
              userReputation={currentUser.reputationPoints}
              coords={coords}
              gpsAccuracy={gpsAccuracy || 5.0}
              onCategoryCorrection={(newCat: string) => setCategory(newCat as ReportCategory)}
              onAnalysisComplete={(res: any) => {
                setAiVerified(true);
                setTrustScore(res.trustScore);
                setAiAnalysisDetails(res.analysisDetails);
              }}
            />
          )}
        </div>

        <div className="space-y-3">
          <div className="h-[250px] rounded-2xl overflow-hidden border border-slate-200 relative">
            <LocationPickerMap 
              selectedCoords={coords} 
              onSelectCoords={(lat, lng, accuracy) => handleMapClick(lat, lng, accuracy)} 
              gpsAccuracy={gpsAccuracy}
            />
            {loadingGps && (
              <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] z-[500] flex flex-col items-center justify-center gap-2">
                <Loader className="w-8 h-8 text-blue-600 animate-spin" />
                <span className="text-xs font-bold text-slate-700">Detecting your location...</span>
                <span className="text-[10px] text-slate-500 font-semibold">Sample {gpsSampleCount}/8</span>
              </div>
            )}
          </div>
          {gpsError && (
            <div className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200/60 px-3.5 py-2.5 rounded-xl leading-relaxed flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-extrabold text-amber-800">Location Action Required:</span> {gpsError}
              </div>
            </div>
          )}
          {coords && (
            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-xs space-y-1.5 font-mono text-slate-600 font-bold">
              <div className="flex justify-between border-b border-slate-100 pb-1 mb-1">
                <span>📍 Lat/Lng: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}</span>
                <span className="text-slate-400">Accuracy: ±{gpsAccuracy ? gpsAccuracy.toFixed(1) : '2.0'}m</span>
              </div>
              <div># Municipality: {muni}</div>
              <div># Ward Number: Ward {ward}</div>
              <div className="leading-relaxed">Address: {address}</div>
            </div>
          )}
        </div>
      </div>

      {coords && hasDuplicate && showDuplicateOverlay && (
        <DuplicateChecker 
          category={category} 
          latitude={coords.lat} 
          longitude={coords.lng} 
          onConfirmNew={() => setShowDuplicateOverlay(false)} 
          onSupported={onSuccess} 
        />
      )}

      <button 
        type="submit" 
        disabled={submitting || !coords || (imgUrl && !aiVerified) || (hasDuplicate && showDuplicateOverlay)} 
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-transparent font-bold py-2.5 rounded-xl text-xs transition-colors shadow-sm text-white cursor-pointer"
      >
        {submitting ? 'Submitting Report...' : 'Submit Report'}
      </button>
    </form>
  );
};
export default ReportForm;
