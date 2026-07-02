import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, ShieldAlert, AlertTriangle, Cpu, Database } from 'lucide-react';
import { aiVerificationService } from '../../services/aiVerificationService';
import type { ImageAnalysisResult, FraudPreventionResult, TrustScoreSummary } from '../../services/aiVerificationService';

interface AiImageScannerProps {
  imageUrl: string;
  category: string;
  userReputation: number;
  coords: { lat: number; lng: number } | null;
  gpsAccuracy: number;
  onCategoryCorrection?: (newCategory: string) => void;
  onAnalysisComplete: (result: {
    category: string;
    confidence: number;
    qualityScore: number;
    issuesDetected: string[];
    isFake: boolean;
    isBlurry: boolean;
    trustScore: number;
    analysisDetails: ImageAnalysisResult;
  }) => void;
}

export const AiImageScanner: React.FC<AiImageScannerProps> = ({
  imageUrl,
  category,
  userReputation,
  coords,
  gpsAccuracy,
  onCategoryCorrection,
  onAnalysisComplete
}) => {
  const [prevImageUrl, setPrevImageUrl] = useState(imageUrl);
  const [scanning, setScanning] = useState(true);
  const [progress, setProgress] = useState(0);
  const [scanStep, setScanStep] = useState('Initializing scan...');
  const [activeTab, setActiveTab] = useState<'overview' | 'exif' | 'ela' | 'fraud'>('overview');

  // Ref-based states to prevent unnecessary trigger loops
  const [analysis, setAnalysis] = useState<ImageAnalysisResult | null>(null);
  const [fraud, setFraud] = useState<FraudPreventionResult | null>(null);
  const [trust, setTrust] = useState<TrustScoreSummary | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  if (imageUrl !== prevImageUrl) {
    setPrevImageUrl(imageUrl);
    setScanning(true);
    setProgress(0);
  }

  const onAnalysisCompleteRef = useRef(onAnalysisComplete);
  useEffect(() => {
    onAnalysisCompleteRef.current = onAnalysisComplete;
  }, [onAnalysisComplete]);

  // Main Scan Trigger Effect
  useEffect(() => {
    let active = true;
    let timer: any;
    setScanning(true);
    setProgress(0);

    const steps = [
      { prg: 20, msg: 'Extracting image EXIF & header tags...' },
      { prg: 50, msg: 'Generating Error Level Analysis (ELA) map...' },
      { prg: 75, msg: 'Scanning local spatial db for duplicate reports...' },
      { prg: 90, msg: 'Analyzing device anomalies & patterns...' },
      { prg: 100, msg: 'Finalizing verification trust score...' }
    ];

    let currentStepIdx = 0;

    const runStep = () => {
      if (!active) return;
      if (currentStepIdx < steps.length) {
        setScanStep(steps[currentStepIdx].msg);
        setProgress(steps[currentStepIdx].prg);
        currentStepIdx++;
        timer = setTimeout(runStep, 600);
      } else {
        // Complete Scan
        const fp = aiVerificationService.generateDeviceFingerprint();
        const imgResult = aiVerificationService.analyzeImage(imageUrl, category);
        const fraudResult = aiVerificationService.runFraudChecks(
          coords?.lat || 28.067,
          coords?.lng || 82.478,
          gpsAccuracy,
          imageUrl,
          fp
        );

        // Standardize GPS accuracy score
        const gpsReliability = Math.max(10, 100 - gpsAccuracy);
        const trustSummary = aiVerificationService.calculateTrustScore(
          gpsReliability,
          imgResult.authenticityScore,
          imgResult.categoryConfidence,
          userReputation,
          fraudResult
        );

        setAnalysis(imgResult);
        setFraud(fraudResult);
        setTrust(trustSummary);
        setScanning(false);

        onAnalysisCompleteRef.current({
          category: imgResult.category,
          confidence: imgResult.categoryConfidence / 100,
          qualityScore: imgResult.qualityScore / 100,
          issuesDetected: imgResult.issuesDetected,
          isFake: imgResult.isFake,
          isBlurry: imgResult.isBlurry,
          trustScore: trustSummary.overallTrustScore,
          analysisDetails: imgResult
        });
      }
    };

    runStep();

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [imageUrl, category, coords, gpsAccuracy, userReputation]);

  // ELA Noise Canvas visual effect
  useEffect(() => {
    if (scanning || !analysis || activeTab !== 'ela' || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.src = imageUrl;
    img.onload = () => {
      canvas.width = 300;
      canvas.height = 180;
      ctx.drawImage(img, 0, 0, 300, 180);

      // Apply ELA visual simulation (High-pass style noise with glowing red/white edges)
      const imgData = ctx.getImageData(0, 0, 300, 180);
      const data = imgData.data;
      const noiseIntensity = analysis.ela.elaScore / 100;

      for (let i = 0; i < data.length; i += 4) {
        // High frequency edge highlight
        const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
        
        // Random digital noise pattern
        const noise = Math.random() * 25 * noiseIntensity;
        
        // ELA logic simulation: dark pixels, with hot regions at high-contrast edits
        if (brightness > 200 && analysis.ela.manipulatedZonesCount > 0) {
          // Highlight edit zones (e.g. Photoshop brush edges in bright red / neon blue)
          data[i] = Math.min(255, 120 + noise * 4); // Red
          data[i + 1] = Math.min(255, 10 + noise);   // Green
          data[i + 2] = Math.min(255, 40 + noise * 2);  // Blue
        } else {
          // General compression grid noise
          const val = Math.min(255, noise * 1.5);
          data[i] = val * 0.8;
          data[i + 1] = val * 0.9;
          data[i + 2] = val * 1.2;
        }
      }
      ctx.putImageData(imgData, 0, 0);
    };
  }, [scanning, analysis, activeTab, imageUrl]);

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-slate-800 bg-slate-900/40 backdrop-blur-md p-4 transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className={`w-4 h-4 text-blue-400 ${scanning ? 'animate-spin' : ''}`} />
          <h4 className="text-xs font-bold text-slate-100 font-sans tracking-wide">AI Verification & Fraud Analytics</h4>
        </div>
        {!scanning && trust && (
          <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider ${
            trust.isApproved 
              ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-400' 
              : 'bg-amber-950/60 border border-amber-800 text-amber-400'
          }`}>
            {trust.isApproved ? '✅ Passed AI Trust Threshold' : '⚠️ Flagged for Manual Review'}
          </span>
        )}
      </div>

      {/* Real-time Scanning Animation Mode */}
      {scanning ? (
        <div className="space-y-4">
          <div className="relative aspect-video rounded-lg overflow-hidden border border-slate-800 bg-black flex items-center justify-center">
            {imageUrl && <img src={imageUrl} alt="Analysis Target" className="w-full h-full object-cover opacity-40 blur-[2px]" />}
            <div className="absolute inset-0 bg-slate-950/70" />
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 space-y-4">
              {/* Spinning Pulse rings */}
              <div className="relative flex items-center justify-center w-12 h-12">
                <div className="absolute w-full h-full rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
                <Cpu className="w-5 h-5 text-blue-400 animate-pulse" />
              </div>
              <div className="text-center">
                <div className="text-xs font-mono font-bold text-slate-100 tracking-wider uppercase">{scanStep}</div>
                <div className="text-[10px] text-slate-400 mt-1 font-mono">Running verification checks... {progress}%</div>
              </div>
              {/* Progress bar */}
              <div className="w-full max-w-xs bg-slate-800 h-1 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Scan Finished Dashboard Mode */
        <div className="space-y-4">
          <div className="flex border-b border-slate-800 gap-1 pb-px overflow-x-auto">
            {([
              { id: 'overview', name: 'Overview' },
              { id: 'exif', name: 'EXIF Metadata' },
              { id: 'ela', name: 'ELA Noise Analysis' },
              { id: 'fraud', name: 'Fraud Check' }
            ] as const).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`text-[10px] font-semibold px-3 py-1.5 border-b-2 rounded-t-lg transition-all ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>

          {analysis && fraud && trust && (
            <div className="min-h-[180px] transition-all">
              {/* Tab 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* trust score circle */}
                  <div className="flex flex-col items-center justify-center bg-slate-950/40 border border-slate-800/80 rounded-xl p-4 text-center">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Overall Trust Score</div>
                    <div className="relative flex items-center justify-center w-24 h-24">
                      {/* Circular border */}
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          className="text-slate-800"
                          strokeWidth="2"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className={trust.overallTrustScore >= 80 ? 'text-emerald-500' : trust.overallTrustScore >= 60 ? 'text-amber-500' : 'text-red-500'}
                          strokeDasharray={`${trust.overallTrustScore}, 100`}
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center">
                        <span className="text-lg font-bold text-slate-100 font-mono leading-none">{trust.overallTrustScore}%</span>
                        <span className="text-[8px] text-slate-400 uppercase font-sans mt-0.5 tracking-wider">Trust index</span>
                      </div>
                    </div>
                  </div>

                  {/* analytics indicators */}
                  <div className="md:col-span-2 grid grid-cols-2 gap-3">
                    <div className="bg-slate-950/20 border border-slate-800/50 rounded-lg p-2.5">
                      <div className="text-[9px] text-slate-400 uppercase tracking-wider">Image Authenticity</div>
                      <div className={`text-xs font-bold mt-0.5 ${
                        analysis.authenticityScore >= 80 ? 'text-emerald-400' : analysis.authenticityScore >= 60 ? 'text-amber-400' : 'text-red-400'
                      }`}>{analysis.authenticityScore}% ({analysis.manipulationRisk} Risk)</div>
                    </div>
                    <div className="bg-slate-950/20 border border-slate-800/50 rounded-lg p-2.5">
                      <div className="text-[9px] text-slate-400 uppercase tracking-wider">GPS Precision</div>
                      <div className="text-xs font-bold mt-0.5 text-blue-400 font-mono">±{gpsAccuracy.toFixed(1)}m (Reliability: {trust.gpsReliability}%)</div>
                    </div>
                    <div className="bg-slate-950/20 border border-slate-800/50 rounded-lg p-2.5">
                      <div className="text-[9px] text-slate-400 uppercase tracking-wider">Duplicate Scan</div>
                      <div className="text-xs font-bold mt-0.5 text-slate-200">{analysis.duplicateProbability}% matching signature</div>
                    </div>
                    <div className="bg-slate-950/20 border border-slate-800/50 rounded-lg p-2.5">
                      <div className="text-[9px] text-slate-400 uppercase tracking-wider">Quality & blur index</div>
                      <div className={`text-xs font-bold mt-0.5 ${analysis.isBlurry ? 'text-amber-400' : 'text-slate-200'}`}>
                        {analysis.qualityScore}% ({analysis.isBlurry ? 'Blurry / Recheck' : 'Excellent'})
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: EXIF METADATA */}
              {activeTab === 'exif' && (
                <div className="space-y-3 bg-slate-950/30 border border-slate-800 p-3 rounded-lg text-xs leading-relaxed">
                  <div className="flex items-center gap-1.5 text-slate-400 border-b border-slate-800/60 pb-1.5 font-bold text-[10px] uppercase">
                    <Database className="w-3.5 h-3.5 text-slate-400" />
                    <span>Metadata Analysis Summary</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                    <div className="text-slate-400">EXIF State:</div>
                    <div className={analysis.exif.isStripped ? 'text-amber-400' : 'text-emerald-400'}>
                      {analysis.exif.isStripped ? '❌ Missing/Stripped (Web source or compressed)' : '✅ Loaded'}
                    </div>
                    <div className="text-slate-400">Capture Device:</div>
                    <div className="text-slate-200">{analysis.exif.make ? `${analysis.exif.make} ${analysis.exif.model}` : 'Generic Device / None'}</div>
                    <div className="text-slate-400">Edit Software Signature:</div>
                    <div className={analysis.exif.hasEditSoftware ? 'text-red-400 font-bold' : 'text-emerald-400'}>
                      {analysis.exif.hasEditSoftware ? `⚠️ Photoshop Detected` : 'None detected'}
                    </div>
                    <div className="text-slate-400">Original Coordinate:</div>
                    <div className="text-slate-300">
                      {analysis.exif.gpsLatitude ? `${analysis.exif.gpsLatitude.toFixed(4)}, ${analysis.exif.gpsLongitude?.toFixed(4)}` : 'None'}
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 3: ERROR LEVEL ANALYSIS */}
              {activeTab === 'ela' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                  <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-black aspect-video flex items-center justify-center">
                    <canvas ref={canvasRef} className="w-full h-full object-cover" />
                    <div className="absolute bottom-2 left-2 bg-slate-950/80 border border-slate-800 text-slate-400 px-1.5 py-0.5 rounded text-[8px] font-mono">
                      ELA VISUAL MASK PREVIEW
                    </div>
                  </div>
                  <div className="space-y-2 text-xs">
                    <h5 className="font-bold text-slate-200 text-[10px] uppercase flex items-center gap-1">
                      <Cpu className="w-3.5 h-3.5 text-blue-400" />
                      Digital Tampering Inspection
                    </h5>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      Error Level Analysis (ELA) identifies areas in the image that have differing compression ratios.
                      Edits, pastes, or paint retouches produce significantly higher noise levels (hot spots) compared to natural background pixels.
                    </p>
                    <div className="bg-slate-950/20 border border-slate-800 p-2.5 rounded-lg text-[10px] font-mono leading-normal">
                      <div>• ELA Discrepancy Level: <span className="font-bold text-slate-200">{analysis.ela.elaScore}%</span></div>
                      <div>• Anomalous Contrast Clusters: <span className="font-bold text-slate-200">{analysis.ela.manipulatedZonesCount} detected</span></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: FRAUD PREVENTION */}
              {activeTab === 'fraud' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                    <div className={`p-2 rounded-lg border text-center font-mono ${
                      fraud.isSpoofedGps 
                        ? 'bg-red-950/20 border-red-900/40 text-red-400' 
                        : 'bg-emerald-950/20 border-emerald-900/40 text-emerald-400'
                    }`}>
                      <div className="text-[8px] uppercase text-slate-400">GPS Geofence check</div>
                      <div className="text-[10px] font-bold mt-1">{fraud.isSpoofedGps ? '⚠️ Out of bounds' : '✅ Verified Dang'}</div>
                    </div>
                    <div className={`p-2 rounded-lg border text-center font-mono ${
                      fraud.isSpamDetected 
                        ? 'bg-red-950/20 border-red-900/40 text-red-400' 
                        : 'bg-emerald-950/20 border-emerald-900/40 text-emerald-400'
                    }`}>
                      <div className="text-[8px] uppercase text-slate-400">Spam duplicate match</div>
                      <div className="text-[10px] font-bold mt-1">{fraud.isSpamDetected ? '⚠️ Duplicate match' : '✅ Clear'}</div>
                    </div>
                    <div className={`p-2 rounded-lg border text-center font-mono ${
                      fraud.isRateLimited 
                        ? 'bg-red-950/20 border-red-900/40 text-red-400' 
                        : 'bg-emerald-950/20 border-emerald-900/40 text-emerald-400'
                    }`}>
                      <div className="text-[8px] uppercase text-slate-400">Rate Limit Check</div>
                      <div className="text-[10px] font-bold mt-1">{fraud.isRateLimited ? '⚠️ Submission cap' : '✅ Clear'}</div>
                    </div>
                  </div>

                  {fraud.anomalies.length > 0 ? (
                    <div className="bg-red-950/25 border border-red-900/40 px-3 py-2 rounded-lg space-y-1">
                      <div className="text-[9px] font-bold text-red-400 uppercase flex items-center gap-1">
                        <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                        <span>Security Anomalies Detected</span>
                      </div>
                      <ul className="list-disc list-inside text-[9px] text-red-300 font-mono">
                        {fraud.anomalies.map((anom, idx) => (
                          <li key={idx}>{anom.replace(/_/g, ' ')}</li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="bg-emerald-950/15 border border-emerald-900/20 px-3 py-2 rounded-lg text-[9px] text-emerald-400 font-mono">
                      🔒 Device Fingerprint: <span className="font-bold">{fraud.deviceFingerprint}</span> • No system anomalies detected.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* AI Civic Issue Classification Category switch suggest */}
          {analysis && analysis.category !== category && onCategoryCorrection && (
            <div className="bg-amber-950/30 border border-amber-900/50 rounded-xl p-3.5 flex items-start gap-3 mt-2 animate-[pulse_2s_infinite]">
              <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="text-xs font-bold text-amber-300">AI Category Conflict Mismatch</div>
                <p className="text-[10px] text-slate-300 leading-normal mt-0.5">
                  Our Computer Vision model suggests this issue is likely **{analysis.category}** ({analysis.categoryConfidence}% confidence)
                  instead of your selection **{category}**.
                </p>
                <button
                  type="button"
                  onClick={() => onCategoryCorrection(analysis.category)}
                  className="mt-2.5 px-3 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded text-[9px] uppercase tracking-wider transition-colors flex items-center gap-1 shadow-md cursor-pointer"
                >
                  <Cpu className="w-3 h-3" />
                  <span>Update Category to "{analysis.category}"</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AiImageScanner;
