export interface EXIFData {
  make?: string;
  model?: string;
  software?: string;
  dateTimeOriginal?: string;
  gpsLatitude?: number;
  gpsLongitude?: number;
  isStripped: boolean;
  hasEditSoftware: boolean;
}

export interface ELAResult {
  elaScore: number; // 0 to 100
  manipulatedZonesCount: number;
  riskRating: 'Low' | 'Medium' | 'High';
}

export interface ImageAnalysisResult {
  category: string;
  categoryConfidence: number; // 0 to 100
  authenticityScore: number; // 0 to 100
  manipulationRisk: 'Low' | 'Medium' | 'High';
  duplicateProbability: number; // 0 to 100
  qualityScore: number; // 0 to 100
  isFake: boolean;
  isBlurry: boolean;
  issuesDetected: string[];
  exif: EXIFData;
  ela: ELAResult;
}

export interface FraudPreventionResult {
  isSpamDetected: boolean;
  isSpoofedGps: boolean;
  isRateLimited: boolean;
  deviceFingerprint: string;
  anomalies: string[];
}

export interface TrustScoreSummary {
  overallTrustScore: number; // 0 to 100
  gpsReliability: number; // 0 to 100
  imageAuthenticity: number; // 0 to 100
  aiDetectionConfidence: number; // 0 to 100
  userReputationWeight: number; // 0 to 100
  isApproved: boolean;
}

export const aiVerificationService = {
  /**
   * Generates a unique browser device fingerprint
   */
  generateDeviceFingerprint(): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    let canvasText = 'dang-fingerprint';
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillStyle = '#f60';
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = '#069';
      ctx.fillText('smart-city-portal', 2, 15);
      canvasText = canvas.toDataURL();
    }

    const navigatorInfo = [
      navigator.userAgent,
      navigator.language,
      screen.colorDepth,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      Intl.DateTimeFormat().resolvedOptions().timeZone,
      navigator.hardwareConcurrency || 4
    ].join('|');

    // Simple hash function
    let hash = 0;
    const combined = canvasText + navigatorInfo;
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return 'DFP-' + Math.abs(hash).toString(16).toUpperCase();
  },

  /**
   * Processes multiple GPS readings to calculate a smooth, clean coordinate,
   * removing standard deviation outliers.
   */
  processGpsSamples(samples: { lat: number; lng: number; accuracy: number }[]): {
    lat: number;
    lng: number;
    accuracyRadius: number;
    confidence: number;
  } {
    if (samples.length === 0) {
      return { lat: 28.067, lng: 82.478, accuracyRadius: 100, confidence: 50 };
    }

    // 1. Calculate Mean coordinates
    const meanLat = samples.reduce((sum, s) => sum + s.lat, 0) / samples.length;
    const meanLng = samples.reduce((sum, s) => sum + s.lng, 0) / samples.length;

    // 2. Calculate Standard Deviations
    const varianceLat = samples.reduce((sum, s) => sum + Math.pow(s.lat - meanLat, 2), 0) / samples.length;
    const varianceLng = samples.reduce((sum, s) => sum + Math.pow(s.lng - meanLng, 2), 0) / samples.length;
    const stdDevLat = Math.sqrt(varianceLat);
    const stdDevLng = Math.sqrt(varianceLng);

    // 3. Filter outliers (deviations > 1.5 std dev)
    const validSamples = samples.filter((s) => {
      const isLatOutlier = stdDevLat > 0 && Math.abs(s.lat - meanLat) > 1.5 * stdDevLat;
      const isLngOutlier = stdDevLng > 0 && Math.abs(s.lng - meanLng) > 1.5 * stdDevLng;
      return !isLatOutlier && !isLngOutlier;
    });

    const finalSamples = validSamples.length > 0 ? validSamples : samples;

    // 4. Calculate smoothed mean
    const avgLat = finalSamples.reduce((sum, s) => sum + s.lat, 0) / finalSamples.length;
    const avgLng = finalSamples.reduce((sum, s) => sum + s.lng, 0) / finalSamples.length;
    const avgAccuracy = finalSamples.reduce((sum, s) => sum + s.accuracy, 0) / finalSamples.length;

    // Calculate GPS reliability confidence
    let confidence = 100;
    if (avgAccuracy > 50) {
      confidence = Math.max(10, 100 - (avgAccuracy - 50) * 1.2);
    }

    return {
      lat: avgLat,
      lng: avgLng,
      accuracyRadius: Math.round(avgAccuracy * 10) / 10,
      confidence: Math.round(confidence)
    };
  },

  /**
   * Run detailed AI Image Analysis including EXIF checks, Error Level Analysis (ELA),
   * and class matching.
   */
  analyzeImage(imageUrl: string, selectedCategory: string): ImageAnalysisResult {
    const issuesDetected: string[] = [];
    let isFake = false;
    let isBlurry = false;

    // Determine metadata and file parameters from dataUrl or filename string
    const isBase64 = imageUrl.startsWith('data:');
    const isScreenshot = imageUrl.toLowerCase().includes('screenshot') || (isBase64 && imageUrl.length % 7 === 0);
    const isSocialMedia = imageUrl.toLowerCase().includes('fb_img') || imageUrl.toLowerCase().includes('whatsapp') || imageUrl.toLowerCase().includes('instagram');
    const isWebAsset = imageUrl.startsWith('http') && !imageUrl.includes('localhost') && !imageUrl.includes('supabase');

    // 1. Simulate EXIF Metadata Analysis
    const hasExif = isBase64 && !isScreenshot && !isSocialMedia;
    const hasEditSoftware = isBase64 && (imageUrl.includes('photoshop') || imageUrl.includes('gimp') || imageUrl.includes('canva'));
    const isStripped = !hasExif || isScreenshot || isSocialMedia || isWebAsset;

    const exif: EXIFData = {
      make: hasExif ? 'Apple' : undefined,
      model: hasExif ? 'iPhone 15 Pro' : undefined,
      software: hasEditSoftware ? 'Adobe Photoshop CC' : undefined,
      dateTimeOriginal: hasExif ? new Date().toISOString() : undefined,
      gpsLatitude: hasExif ? 28.062 : undefined,
      gpsLongitude: hasExif ? 82.484 : undefined,
      isStripped,
      hasEditSoftware
    };

    if (isStripped) issuesDetected.push('stripped_exif_metadata');
    if (hasEditSoftware) {
      issuesDetected.push('manipulation_software_marker');
      isFake = true;
    }
    if (isScreenshot) issuesDetected.push('screenshot_detection');
    if (isSocialMedia) issuesDetected.push('social_media_compression');
    if (isWebAsset) issuesDetected.push('web_scraped_source');

    // 2. Simulate Error Level Analysis (ELA)
    let elaScore = 8; // Default low modification noise
    if (hasEditSoftware) elaScore = 87; // High noise
    else if (isScreenshot) elaScore = 45; // Medium ELA mismatch due to scaling
    else if (isSocialMedia) elaScore = 32;

    const riskRating = elaScore > 75 ? 'High' : elaScore > 40 ? 'Medium' : 'Low';
    const ela: ELAResult = {
      elaScore,
      manipulatedZonesCount: elaScore > 75 ? 4 : elaScore > 40 ? 1 : 0,
      riskRating
    };

    // 3. Category Detection Simulation (Map keywords in image/metadata to categories)
    let detectedCategory = selectedCategory;
    let categoryConfidence = 94.5;

    // Mismatches simulation based on input categories
    if (selectedCategory === 'Electricity' && imageUrl.includes('garbage')) {
      detectedCategory = 'Garbage';
      categoryConfidence = 91.2;
    } else if (selectedCategory === 'Road Damage' && imageUrl.includes('light')) {
      detectedCategory = 'Street Lights';
      categoryConfidence = 88.7;
    }

    // 4. Duplicate and quality parameters
    const duplicateProbability = isSocialMedia ? 48.0 : isWebAsset ? 72.0 : 2.5;
    const qualityScore = isSocialMedia ? 52.0 : isBase64 && imageUrl.length < 50000 ? 38.0 : 92.0;
    if (qualityScore < 45) {
      isBlurry = true;
      issuesDetected.push('low_quality_blurry_evidence');
    }

    // Authenticity score calculation
    let authenticityScore = 100;
    if (exif.isStripped) authenticityScore -= 15;
    if (exif.hasEditSoftware) authenticityScore -= 60;
    if (isScreenshot) authenticityScore -= 20;
    if (ela.elaScore > 40) authenticityScore -= (ela.elaScore - 40);
    authenticityScore = Math.max(5, Math.round(authenticityScore));

    return {
      category: detectedCategory,
      categoryConfidence: Math.round(categoryConfidence),
      authenticityScore,
      manipulationRisk: riskRating,
      duplicateProbability: Math.round(duplicateProbability),
      qualityScore: Math.round(qualityScore),
      isFake: isFake || authenticityScore < 50,
      isBlurry,
      issuesDetected,
      exif,
      ela
    };
  },

  /**
   * Run Fraud prevention checks including GPS spoofing, rate limiting, and spam indicators.
   */
  runFraudChecks(
    lat: number,
    lng: number,
    gpsAccuracy: number,
    imageUrl: string,
    deviceFingerprint: string
  ): FraudPreventionResult {
    const anomalies: string[] = [];
    let isSpoofedGps = false;
    let isSpamDetected = false;
    let isRateLimited = false;

    // 1. GPS Spoof Checks
    // Check if outside Dang boundaries
    if (lat < 27.5 || lat > 28.3 || lng < 82.0 || lng > 82.8) {
      isSpoofedGps = true;
      anomalies.push('gps_outside_geofence_boundaries');
    }

    // Grid lock detection (spoofing tools default to perfect integer values)
    const isPerfectGrid = Number(lat.toFixed(4)).toString().endsWith('.0000') || Number(lng.toFixed(4)).toString().endsWith('.0000');
    if (isPerfectGrid && gpsAccuracy < 1) {
      isSpoofedGps = true;
      anomalies.push('perfect_grid_gps_anomalies');
    }

    // 2. Rate Limiting Check (Maximum 3 reports in 5 minutes)
    try {
      const now = Date.now();
      const submissionHistoryKey = 'dang_city_sub_history';
      const historyStr = localStorage.getItem(submissionHistoryKey);
      let history: number[] = historyStr ? JSON.parse(historyStr) : [];
      
      // Filter occurrences in past 5 minutes
      history = history.filter(time => now - time < 5 * 60 * 1000);
      
      if (history.length >= 3) {
        isRateLimited = true;
        anomalies.push('rate_limit_exceeded_spamming_protection');
      }

      // Record this attempt timestamp (will be finalized on form submit)
    } catch (e) {
      console.error('Rate limiting failed:', e);
    }

    // 3. Duplicate submissions / identical images
    const isMockDuplicate = imageUrl && imageUrl.includes('duplicate');
    if (isMockDuplicate) {
      isSpamDetected = true;
      anomalies.push('duplicate_image_signature_from_other_accounts');
    }

    return {
      isSpamDetected,
      isSpoofedGps,
      isRateLimited,
      deviceFingerprint,
      anomalies
    };
  },

  /**
   * Combines all verification metrics into a single unified trust score (0 - 100 scale).
   */
  calculateTrustScore(
    gpsReliability: number,
    imageAuthenticity: number,
    classificationConfidence: number,
    userReputation: number,
    fraudResult: FraudPreventionResult
  ): TrustScoreSummary {
    // Overall Trust Score = 0.25 * GPS_Reliability + 0.35 * Image_Authenticity + 0.20 * AI_Class_Confidence + 0.20 * User_Reputation
    const userRepWeight = Math.min(100, (userReputation / 150) * 100); // Normalize user reputation

    let baseScore =
      0.25 * gpsReliability +
      0.35 * imageAuthenticity +
      0.20 * classificationConfidence +
      0.20 * userRepWeight;

    // Apply strict fraud penalties
    if (fraudResult.isSpoofedGps) baseScore -= 40;
    if (fraudResult.isSpamDetected) baseScore -= 30;
    if (fraudResult.isRateLimited) baseScore -= 20;

    const overallTrustScore = Math.max(0, Math.min(100, Math.round(baseScore)));
    const isApproved = overallTrustScore >= 70 && !fraudResult.isSpoofedGps && !fraudResult.isRateLimited;

    return {
      overallTrustScore,
      gpsReliability: Math.round(gpsReliability),
      imageAuthenticity: Math.round(imageAuthenticity),
      aiDetectionConfidence: Math.round(classificationConfidence),
      userReputationWeight: Math.round(userRepWeight),
      isApproved
    };
  }
};

export default aiVerificationService;
