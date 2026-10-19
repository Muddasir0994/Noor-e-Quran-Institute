import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Check,
  ArrowsClockwise,
  MagnifyingGlassPlus,
  MagnifyingGlassMinus,
  Crop,
  ArrowsOutCardinal,
  Camera
} from '@phosphor-icons/react';

interface ImageCropModalProps {
  isOpen: boolean;
  imageSrc: string;
  title?: string;
  initialAspectRatio?: '16:9' | '4:3' | '1:1' | '3:4';
  onClose: () => void;
  onCropComplete: (croppedBase64: string) => void;
}

export const ImageCropModal: React.FC<ImageCropModalProps> = ({
  isOpen,
  imageSrc,
  title = 'Adjust & Frame Image',
  initialAspectRatio = '16:9',
  onClose,
  onCropComplete
}) => {
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '4:3' | '1:1' | '3:4'>(initialAspectRatio);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imgLoaded, setImgLoaded] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setAspectRatio(initialAspectRatio);
    setZoom(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
    setImgLoaded(false);
  }, [imageSrc, initialAspectRatio, isOpen]);

  if (!isOpen || !imageSrc) return null;

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPosition({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleApplyCrop = () => {
    if (!imgRef.current) return;
    const img = imgRef.current;

    // Determine target canvas dimensions based on chosen aspect ratio
    let targetWidth = 1200;
    let targetHeight = 675; // 16:9

    if (aspectRatio === '1:1') {
      targetWidth = 800;
      targetHeight = 800;
    } else if (aspectRatio === '4:3') {
      targetWidth = 1024;
      targetHeight = 768;
    } else if (aspectRatio === '3:4') {
      targetWidth = 768;
      targetHeight = 1024;
    }

    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#FAF7F0';
    ctx.fillRect(0, 0, targetWidth, targetHeight);

    // Save context state for rotation & translations
    ctx.save();
    ctx.translate(targetWidth / 2 + position.x * 2, targetHeight / 2 + position.y * 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);

    // Draw image centered
    const renderWidth = targetWidth;
    const renderHeight = (img.naturalHeight / img.naturalWidth) * renderWidth;
    ctx.drawImage(img, -renderWidth / 2, -renderHeight / 2, renderWidth, renderHeight);
    ctx.restore();

    try {
      const croppedBase64 = canvas.toDataURL('image/jpeg', 0.9);
      onCropComplete(croppedBase64);
      onClose();
    } catch (err) {
      console.warn('Canvas export failed, using direct imageSrc:', err);
      onCropComplete(imageSrc);
      onClose();
    }
  };

  const getAspectClass = () => {
    switch (aspectRatio) {
      case '16:9': return 'aspect-[16/9]';
      case '1:1': return 'aspect-square max-w-[320px] mx-auto';
      case '4:3': return 'aspect-[4/3]';
      case '3:4': return 'aspect-[3/4] max-w-[280px] mx-auto';
      default: return 'aspect-[16/9]';
    }
  };

  return (
    <div className="fixed inset-0 z-70 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-[#FAF7F0] border border-[#E7DBC2] rounded-sm shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-[#13263D] text-[#F5F0E6] flex items-center justify-between border-b border-[#A47A46]/30">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-sm bg-[#0C1A2E] border border-[#A47A46]/40 flex items-center justify-center text-[#A47A46]">
              <Crop className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-editorial text-lg text-[#F5F0E6] font-semibold">{title}</h3>
              <p className="text-[11px] text-[#E7DBC2]/70 font-sans">Drag to position, scale, and select optimal framing</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#E7DBC2]/70 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewport / Crop Canvas Area */}
        <div className="p-6 bg-[#F5F0E6] flex-1 overflow-hidden flex flex-col items-center justify-center">
          
          {/* Aspect Ratio Selector Pills */}
          <div className="flex items-center gap-2 mb-4">
            {(['16:9', '4:3', '1:1', '3:4'] as const).map((ratio) => (
              <button
                key={ratio}
                type="button"
                onClick={() => setAspectRatio(ratio)}
                className={`px-3 py-1 text-xs font-sans rounded-sm transition-colors cursor-pointer ${
                  aspectRatio === ratio
                    ? 'bg-[#13263D] text-[#F5F0E6] font-bold border border-[#13263D]'
                    : 'bg-[#FAF7F0] text-gray-700 hover:text-[#13263D] border border-[#E7DBC2]'
                }`}
              >
                {ratio === '16:9' ? '16:9 Banner' : ratio === '1:1' ? '1:1 Square' : ratio === '4:3' ? '4:3 Landscape' : '3:4 Portrait'}
              </button>
            ))}
          </div>

          {/* Framing Frame with Crosshair Guides */}
          <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className={`relative w-full ${getAspectClass()} overflow-hidden rounded-sm bg-[#152A45] border-2 border-dashed border-[#A47A46] shadow-inner select-none cursor-move flex items-center justify-center`}
          >
            {/* Background Grid Guide Lines */}
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-20 border border-white/20">
              <div className="border-r border-b border-white" />
              <div className="border-r border-b border-white" />
              <div className="border-b border-white" />
              <div className="border-r border-b border-white" />
              <div className="border-r border-b border-white" />
              <div className="border-b border-white" />
              <div className="border-r border-white" />
              <div className="border-r border-white" />
              <div />
            </div>

            {/* Draggable & Scalable Image */}
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Crop target"
              onLoad={() => setImgLoaded(true)}
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                transformOrigin: 'center center',
                maxWidth: 'none',
                maxHeight: 'none',
                width: '100%',
                objectFit: 'contain',
                pointerEvents: 'none'
              }}
              className="transition-transform duration-75"
              crossOrigin="anonymous"
            />

            {/* Floating helper badge */}
            <span className="absolute bottom-2 right-2 px-2 py-0.5 text-[10px] font-sans font-medium bg-[#13263D]/85 text-[#A47A46] rounded-xs backdrop-blur-xs flex items-center gap-1 pointer-events-none">
              <ArrowsOutCardinal className="w-3 h-3" />
              <span>Drag to Pan</span>
            </span>
          </div>

          {/* Controls Bar: Zoom Slider + Rotate + Reset */}
          <div className="w-full mt-5 bg-[#FAF7F0] p-4 rounded-sm border border-[#E7DBC2] flex flex-wrap items-center justify-between gap-4 text-xs font-sans">
            
            {/* Zoom Slider */}
            <div className="flex items-center gap-2.5 flex-1 min-w-[200px]">
              <MagnifyingGlassMinus className="w-4 h-4 text-gray-500" />
              <input
                type="range"
                min="0.8"
                max="2.5"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="flex-1 accent-[#13263D] cursor-pointer"
              />
              <MagnifyingGlassPlus className="w-4 h-4 text-gray-500" />
              <span className="w-10 text-right font-mono text-gray-700">{Math.round(zoom * 100)}%</span>
            </div>

            {/* Rotation & Reset Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setRotation((prev) => (prev + 90) % 360)}
                className="px-3 py-1.5 bg-[#F5F0E6] border border-[#E7DBC2] rounded-sm hover:border-[#A47A46] text-gray-700 flex items-center gap-1 cursor-pointer"
                title="Rotate 90 degrees"
              >
                <ArrowsClockwise className="w-3.5 h-3.5" />
                <span>Rotate</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setZoom(1);
                  setPosition({ x: 0, y: 0 });
                  setRotation(0);
                }}
                className="px-3 py-1.5 bg-[#F5F0E6] border border-[#E7DBC2] rounded-sm hover:border-gray-400 text-gray-600 cursor-pointer"
              >
                Reset
              </button>
            </div>

          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-[#FAF7F0] border-t border-[#E7DBC2] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-sans font-semibold text-gray-600 hover:text-gray-900 cursor-pointer"
          >
            Cancel
          </button>
          
          <button
            type="button"
            onClick={handleApplyCrop}
            className="px-6 py-2.5 bg-[#13263D] text-[#F5F0E6] text-xs font-sans font-semibold uppercase tracking-wider rounded-sm hover:bg-[#0C1A2E] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Check className="w-3.5 h-3.5 text-[#A47A46]" weight="bold" />
            <span>Apply Framing &amp; Use</span>
          </button>
        </div>

      </div>
    </div>
  );
};
