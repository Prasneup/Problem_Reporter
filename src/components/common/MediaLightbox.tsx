import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCcw, Play } from 'lucide-react';

interface MediaItem {
  type: 'image' | 'video';
  url: string;
  title?: string;
}

interface MediaLightboxProps {
  mediaList: MediaItem[];
  initialIndex: number;
  onClose: () => void;
}

export const MediaLightbox: React.FC<MediaLightboxProps> = ({
  mediaList,
  initialIndex,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [scale, setScale] = useState(1);

  const activeItem = mediaList[currentIndex];

  // Reset zoom scale when item changes
  useEffect(() => {
    setScale(1);
  }, [currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' && mediaList.length > 1) {
        handleNext();
      } else if (e.key === 'ArrowLeft' && mediaList.length > 1) {
        handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, mediaList]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % mediaList.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + mediaList.length) % mediaList.length);
  };

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    setScale((s) => Math.min(s + 0.25, 3));
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    setScale((s) => Math.max(s - 0.25, 0.5));
  };

  const handleZoomReset = (e: React.MouseEvent) => {
    e.stopPropagation();
    setScale(1);
  };

  if (!activeItem) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col bg-slate-950/95 backdrop-blur-md transition-all duration-300 font-sans select-none"
      onClick={onClose}
    >
      {/* Lightbox Header Bar */}
      <div className="flex items-center justify-between px-6 py-4 text-white border-b border-white/5 z-50">
        <div className="flex flex-col">
          <span className="text-[10px] font-extrabold tracking-widest text-blue-400 uppercase">Media Viewer</span>
          <h4 className="text-xs font-bold text-slate-200 mt-0.5 truncate max-w-[200px] sm:max-w-md">
            {activeItem.title || 'Attached Evidence'}
          </h4>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-4">
          {activeItem.type === 'image' && (
            <div className="flex items-center gap-1.5 bg-slate-900 border border-white/10 rounded-xl p-1">
              <button
                type="button"
                onClick={handleZoomIn}
                className="p-1.5 hover:bg-slate-800 text-slate-350 hover:text-white rounded-lg transition-colors cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleZoomOut}
                className="p-1.5 hover:bg-slate-800 text-slate-350 hover:text-white rounded-lg transition-colors cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleZoomReset}
                className="p-1.5 hover:bg-slate-800 text-slate-350 hover:text-white rounded-lg transition-colors cursor-pointer"
                title="Reset Zoom"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          )}

          <div className="text-[10px] font-extrabold text-slate-400 tracking-wider">
            {currentIndex + 1} / {mediaList.length}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 bg-slate-900 border border-white/10 text-slate-350 hover:text-white rounded-xl transition-all cursor-pointer"
            title="Close (ESC)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div 
        className="flex-1 flex items-center justify-center relative p-6 cursor-zoom-out"
        onClick={onClose}
      >
        {/* Navigation - Previous Button */}
        {mediaList.length > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-3 bg-slate-900/60 hover:bg-slate-900 border border-white/10 text-slate-300 hover:text-white rounded-full transition-all cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        {/* Media Container */}
        <div
          className="relative max-w-4xl max-h-[70vh] flex items-center justify-center transition-transform duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {activeItem.type === 'video' ? (
            <video
              src={activeItem.url}
              controls
              autoPlay
              className="max-h-[70vh] max-w-full rounded-2xl border border-white/10 shadow-2xl focus:outline-none"
              style={{ transform: `scale(${scale})` }}
            />
          ) : (
            <img
              src={activeItem.url}
              alt={activeItem.title || 'Evidence Image'}
              className="max-h-[70vh] max-w-full rounded-2xl border border-white/10 shadow-2xl object-contain select-none pointer-events-none"
              style={{ transform: `scale(${scale})` }}
            />
          )}
        </div>

        {/* Navigation - Next Button */}
        {mediaList.length > 1 && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-3 bg-slate-900/60 hover:bg-slate-900 border border-white/10 text-slate-300 hover:text-white rounded-full transition-all cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Slide Indicators Footer */}
      {mediaList.length > 1 && (
        <div className="py-6 flex justify-center gap-2 border-t border-white/5 z-50">
          {mediaList.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(idx);
              }}
              className={`w-12 h-12 rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                idx === currentIndex
                  ? 'border-blue-500 scale-105 shadow-md shadow-blue-500/20'
                  : 'border-white/10 hover:border-white/30 opacity-60 hover:opacity-100'
              }`}
            >
              {item.type === 'video' ? (
                <div className="w-full h-full bg-slate-900 flex items-center justify-center text-blue-400">
                  <Play className="w-3.5 h-3.5 fill-current" />
                </div>
              ) : (
                <img src={item.url} className="w-full h-full object-cover" alt="" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
