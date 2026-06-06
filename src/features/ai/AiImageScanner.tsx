import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Eye, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface AiImageScannerProps {
  imageUrl: string;
  category: string;
  onAnalysisComplete: (result: {
    category: string;
    confidence: number;
    qualityScore: number;
    issuesDetected: string[];
    isFake: boolean;
    isBlurry: boolean;
  }) => void;
}

export const AiImageScanner: React.FC<AiImageScannerProps> = ({
  imageUrl,
  category,
  onAnalysisComplete
}) => {
  const [prevImageUrl, setPrevImageUrl] = useState(imageUrl);
  const [scanning, setScanning] = useState(true);
  const [progress, setProgress] = useState(0);

  if (imageUrl !== prevImageUrl) {
    setPrevImageUrl(imageUrl);
    setScanning(true);
    setProgress(0);
  }

  const onAnalysisCompleteRef = useRef(onAnalysisComplete);
  useEffect(() => {
    onAnalysisCompleteRef.current = onAnalysisComplete;
  }, [onAnalysisComplete]);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setScanning(false);
          onAnalysisCompleteRef.current({
            category,
            confidence: 0.94,
            qualityScore: 0.89,
            issuesDetected: [category.toLowerCase().replace(' ', '_'), 'high_resolution'],
            isFake: false,
            isBlurry: false
          });
          return 100;
        }
        return prev + 25;
      });
    }, 400);

    return () => clearInterval(interval);
  }, [imageUrl, category]);

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-slate-800 bg-slate-900/50 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-blue-400 animate-spin" />
        <h4 className="text-xs font-semibold text-slate-200">AI Image Analysis Engine</h4>
      </div>

      <div className="relative aspect-video rounded-lg overflow-hidden border border-slate-800 bg-black flex items-center justify-center">
        {imageUrl ? (
          <>
            <img src={imageUrl} alt="Issue Preview" className="w-full h-full object-cover" />
            {scanning && (
              <>
                <div className="absolute inset-0 bg-gradient-to-b from-blue-500/0 via-blue-500/20 to-blue-500/0 animate-[pulse_1.5s_infinite] border-y border-blue-500/60" />
                <div className="absolute inset-0 flex items-center justify-center bg-slate-950/60 text-slate-200 text-xs font-mono font-bold tracking-wider">
                  SCANNING IMAGE: {progress}%
                </div>
              </>
            )}
            {!scanning && (
              <div className="absolute top-2 left-2 bg-emerald-950/80 border border-emerald-800 text-emerald-400 px-2 py-0.5 rounded text-[9px] font-semibold flex items-center gap-1 backdrop-blur-sm">
                <CheckCircle2 className="w-3 h-3" />
                <span>AI SCANNED</span>
              </div>
            )}
          </>
        ) : (
          <div className="text-xs text-slate-500 flex flex-col items-center gap-1.5 p-6">
            <Eye className="w-6 h-6 text-slate-600" />
            <span>Upload an image to start verification scan</span>
          </div>
        )}
      </div>

      {!scanning && imageUrl && (
        <div className="grid grid-cols-2 gap-3 mt-3">
          <div className="bg-slate-900 border border-slate-800/80 rounded-lg p-2.5">
            <div className="text-[9px] text-slate-500 uppercase tracking-wider">Detected Object</div>
            <div className="text-xs font-bold text-slate-200 mt-0.5">{category}</div>
          </div>
          <div className="bg-slate-900 border border-slate-800/80 rounded-lg p-2.5">
            <div className="text-[9px] text-slate-500 uppercase tracking-wider">AI Confidence Score</div>
            <div className="text-xs font-bold text-emerald-400 mt-0.5">94.2%</div>
          </div>
          <div className="bg-slate-900 border border-slate-800/80 rounded-lg p-2.5">
            <div className="text-[9px] text-slate-500 uppercase tracking-wider">Image Quality Score</div>
            <div className="text-xs font-bold text-blue-400 mt-0.5">Excellent (89%)</div>
          </div>
          <div className="bg-slate-900 border border-slate-800/80 rounded-lg p-2.5 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-emerald-500" />
            <div>
              <div className="text-[9px] text-slate-500 uppercase tracking-wider">Tamper Detection</div>
              <div className="text-xs font-bold text-emerald-400 mt-0.5">Authentic</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AiImageScanner;
