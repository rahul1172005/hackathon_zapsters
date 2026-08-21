'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Crop, ZoomIn, ZoomOut, RotateCw, RotateCcw, Check, X, Move, Sparkles } from 'lucide-react';

interface ImageCropperModalProps {
  isOpen: boolean;
  imageSrc: string;
  onCropComplete: (croppedDataUrl: string) => void;
  onCancel: () => void;
  userName?: string;
}

export const ImageCropperModal: React.FC<ImageCropperModalProps> = ({
  isOpen,
  imageSrc,
  onCropComplete,
  onCancel,
  userName = 'User',
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  const imageRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const CROP_BOX_SIZE = 260; // Diameter of the crop circle in px

  // Reset state when a new image source is opened
  useEffect(() => {
    if (isOpen && imageSrc) {
      setZoom(1);
      setRotation(0);
      setOffset({ x: 0, y: 0 });
      setImageLoaded(false);

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight });
        setImageLoaded(true);
      };
      img.src = imageSrc;
      imageRef.current = img;
    }
  }, [isOpen, imageSrc]);

  // Compute scale so image at zoom=1 covers the crop circle
  const getBaseScale = useCallback(() => {
    if (!imageDimensions.width || !imageDimensions.height) return 1;
    const isRotated90 = rotation % 180 !== 0;
    const effectiveWidth = isRotated90 ? imageDimensions.height : imageDimensions.width;
    const effectiveHeight = isRotated90 ? imageDimensions.width : imageDimensions.height;
    const scaleX = CROP_BOX_SIZE / effectiveWidth;
    const scaleY = CROP_BOX_SIZE / effectiveHeight;
    return Math.max(scaleX, scaleY);
  }, [imageDimensions, rotation]);

  // Live Canvas Preview updater
  useEffect(() => {
    if (!imageLoaded || !imageRef.current || !previewCanvasRef.current) return;

    const canvas = previewCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 120; // preview canvas dimensions
    canvas.width = size;
    canvas.height = size;

    ctx.clearRect(0, 0, size, size);

    // Make preview circular
    ctx.save();
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    ctx.translate(size / 2, size / 2);
    ctx.rotate((rotation * Math.PI) / 180);

    const baseScale = getBaseScale();
    const scale = (baseScale * zoom * size) / CROP_BOX_SIZE;
    const drawWidth = imageDimensions.width * scale;
    const drawHeight = imageDimensions.height * scale;
    const drawOffsetX = (offset.x * size) / CROP_BOX_SIZE;
    const drawOffsetY = (offset.y * size) / CROP_BOX_SIZE;

    // Handle rotation for offset
    if (rotation === 90) {
      ctx.drawImage(
        imageRef.current,
        -drawWidth / 2 + drawOffsetY,
        -drawHeight / 2 - drawOffsetX,
        drawWidth,
        drawHeight
      );
    } else if (rotation === 180) {
      ctx.drawImage(
        imageRef.current,
        -drawWidth / 2 - drawOffsetX,
        -drawHeight / 2 - drawOffsetY,
        drawWidth,
        drawHeight
      );
    } else if (rotation === 270) {
      ctx.drawImage(
        imageRef.current,
        -drawWidth / 2 - drawOffsetY,
        -drawHeight / 2 + drawOffsetX,
        drawWidth,
        drawHeight
      );
    } else {
      ctx.drawImage(
        imageRef.current,
        -drawWidth / 2 + drawOffsetX,
        -drawHeight / 2 + drawOffsetY,
        drawWidth,
        drawHeight
      );
    }

    ctx.restore();
  }, [imageLoaded, zoom, rotation, offset, imageDimensions, getBaseScale]);

  // Drag handlers for mouse and touch
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - offset.x,
        y: e.touches[0].clientY - offset.y,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setOffset({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Perform the actual High-Res Final Crop onto standard 400x400 Canvas
  const handleConfirmCrop = () => {
    if (!imageRef.current || !imageDimensions.width) return;

    const outputCanvas = document.createElement('canvas');
    const OUTPUT_SIZE = 400; // Crisp output avatar resolution
    outputCanvas.width = OUTPUT_SIZE;
    outputCanvas.height = OUTPUT_SIZE;

    const ctx = outputCanvas.getContext('2d');
    if (!ctx) return;

    // Enable high quality image smoothing
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.translate(OUTPUT_SIZE / 2, OUTPUT_SIZE / 2);
    ctx.rotate((rotation * Math.PI) / 180);

    const baseScale = getBaseScale();
    const scale = (baseScale * zoom * OUTPUT_SIZE) / CROP_BOX_SIZE;
    const drawWidth = imageDimensions.width * scale;
    const drawHeight = imageDimensions.height * scale;
    const drawOffsetX = (offset.x * OUTPUT_SIZE) / CROP_BOX_SIZE;
    const drawOffsetY = (offset.y * OUTPUT_SIZE) / CROP_BOX_SIZE;

    if (rotation === 90) {
      ctx.drawImage(
        imageRef.current,
        -drawWidth / 2 + drawOffsetY,
        -drawHeight / 2 - drawOffsetX,
        drawWidth,
        drawHeight
      );
    } else if (rotation === 180) {
      ctx.drawImage(
        imageRef.current,
        -drawWidth / 2 - drawOffsetX,
        -drawHeight / 2 - drawOffsetY,
        drawWidth,
        drawHeight
      );
    } else if (rotation === 270) {
      ctx.drawImage(
        imageRef.current,
        -drawWidth / 2 - drawOffsetY,
        -drawHeight / 2 + drawOffsetX,
        drawWidth,
        drawHeight
      );
    } else {
      ctx.drawImage(
        imageRef.current,
        -drawWidth / 2 + drawOffsetX,
        -drawHeight / 2 + drawOffsetY,
        drawWidth,
        drawHeight
      );
    }

    try {
      const croppedDataUrl = outputCanvas.toDataURL('image/jpeg', 0.95);
      onCropComplete(croppedDataUrl);
    } catch {
      onCropComplete(imageSrc);
    }
  };

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setOffset({ x: 0, y: 0 });
  };

  if (!isOpen) return null;

  const baseScale = getBaseScale();
  const renderedWidth = imageDimensions.width * baseScale * zoom;
  const renderedHeight = imageDimensions.height * baseScale * zoom;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <div className="bg-[#FFFFFF] dark:bg-[#141414] max-w-lg w-full p-5 sm:p-7 space-y-5 font-inter shadow-2xl rounded-3xl border border-neutral-200 dark:border-neutral-800 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#800000]/10 text-[#800000] dark:text-red-400 flex items-center justify-center">
              <Crop className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-geist font-bold text-[#111111] dark:text-white">
                Crop & Position Photo
              </h2>
              <p className="text-[11px] text-[#777777] dark:text-neutral-400">
                Drag to position and zoom to adjust the profile area
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="w-8 h-8 rounded-full bg-[#F7F7F5] dark:bg-neutral-900 text-[#777777] dark:text-neutral-300 hover:text-[#111111] dark:hover:text-white flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Main Crop Work Area */}
        <div className="flex flex-col sm:flex-row items-center gap-5 justify-center">
          
          {/* Interactive Drag & Crop Viewport */}
          <div
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ width: `${CROP_BOX_SIZE}px`, height: `${CROP_BOX_SIZE}px` }}
            className="relative rounded-3xl overflow-hidden bg-neutral-950 border-2 border-neutral-300 dark:border-neutral-700 shadow-inner select-none cursor-grab active:cursor-grabbing shrink-0 flex items-center justify-center"
          >
            {/* The Image inside the viewport */}
            {imageLoaded && (
              <img
                src={imageSrc}
                alt="Crop subject"
                draggable={false}
                style={{
                  width: `${renderedWidth}px`,
                  height: `${renderedHeight}px`,
                  transform: `translate(${offset.x}px, ${offset.y}px) rotate(${rotation}deg)`,
                  transformOrigin: 'center center',
                  maxWidth: 'none',
                  maxHeight: 'none',
                }}
                className="absolute transition-transform duration-75 pointer-events-none"
              />
            )}

            {/* Dark Mask with Circular Cutout Overlay */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'radial-gradient(circle at center, transparent 116px, rgba(0, 0, 0, 0.72) 118px)',
              }}
            />

            {/* Circular Crop Guide Frame */}
            <div
              className="absolute pointer-events-none rounded-full border-2 border-[#800000] shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]"
              style={{
                width: '232px',
                height: '232px',
              }}
            >
              {/* Subtle Alignment Grid Lines */}
              <div className="w-full h-full relative opacity-30">
                <div className="absolute top-1/3 left-0 right-0 border-t border-dashed border-white/60" />
                <div className="absolute top-2/3 left-0 right-0 border-t border-dashed border-white/60" />
                <div className="absolute left-1/3 top-0 bottom-0 border-l border-dashed border-white/60" />
                <div className="absolute left-2/3 top-0 bottom-0 border-l border-dashed border-white/60" />
              </div>
            </div>

            {/* Drag hint badge */}
            <div className="absolute bottom-2.5 px-3 py-1 bg-black/60 backdrop-blur-xs rounded-full text-[10px] font-mono text-white/80 pointer-events-none flex items-center gap-1">
              <Move className="w-3 h-3" /> Drag to reposition
            </div>
          </div>

          {/* Live Preview Avatar & Details */}
          <div className="flex sm:flex-col items-center gap-3 text-center sm:text-left">
            <div className="relative">
              <canvas
                ref={previewCanvasRef}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-[#800000] shadow-md bg-neutral-900"
              />
              <span className="absolute -bottom-1 -right-1 p-1 bg-[#800000] text-white rounded-full shadow-xs">
                <Sparkles className="w-3 h-3" />
              </span>
            </div>
            <div className="space-y-0.5 min-w-0">
              <span className="text-[11px] uppercase font-bold text-[#777777] dark:text-neutral-400 block font-mono">
                LIVE PREVIEW
              </span>
              <p className="text-xs font-bold text-[#111111] dark:text-white truncate max-w-[130px]">
                {userName}
              </p>
              <span className="text-[10px] text-[#777777] dark:text-neutral-500 font-mono block">
                {Math.round(zoom * 100)}% • {rotation}°
              </span>
            </div>
          </div>
        </div>

        {/* Interactive Controls (Zoom & Rotate) */}
        <div className="p-4 bg-[#F7F7F5] dark:bg-neutral-900/70 rounded-2xl space-y-3.5 text-xs font-inter border border-neutral-200 dark:border-neutral-800">
          
          {/* Zoom Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center font-bold text-[#777777] dark:text-neutral-400 text-[11px]">
              <span className="flex items-center gap-1.5">
                <ZoomIn className="w-3.5 h-3.5 text-[#800000] dark:text-red-400" /> ZOOM LEVEL
              </span>
              <span className="font-mono text-[#111111] dark:text-white">{zoom.toFixed(2)}x</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(1, +(z - 0.15).toFixed(2)))}
                className="w-7 h-7 rounded-lg bg-white dark:bg-neutral-800 text-[#111111] dark:text-white flex items-center justify-center font-bold shadow-xs hover:bg-[#E5E5E2] dark:hover:bg-neutral-700 cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <input
                type="range"
                min="1"
                max="3"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="flex-1 accent-[#800000] cursor-pointer h-1.5 bg-neutral-300 dark:bg-neutral-700 rounded-lg"
              />
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(3, +(z + 0.15).toFixed(2)))}
                className="w-7 h-7 rounded-lg bg-white dark:bg-neutral-800 text-[#111111] dark:text-white flex items-center justify-center font-bold shadow-xs hover:bg-[#E5E5E2] dark:hover:bg-neutral-700 cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Rotate & Reset Buttons */}
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-neutral-200 dark:border-neutral-800/80">
            <button
              type="button"
              onClick={() => setRotation((r) => (r + 90) % 360)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-neutral-800 hover:bg-[#E5E5E2] dark:hover:bg-neutral-700 text-[#111111] dark:text-white rounded-xl font-bold transition-colors shadow-xs cursor-pointer text-xs"
            >
              <RotateCw className="w-3.5 h-3.5 text-[#800000] dark:text-red-400" /> Rotate 90°
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-neutral-800 hover:bg-[#E5E5E2] dark:hover:bg-neutral-700 text-[#777777] dark:text-neutral-300 rounded-xl font-semibold transition-colors shadow-xs cursor-pointer text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Frame
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex justify-end gap-3 font-inter text-xs">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 bg-[#F7F7F5] dark:bg-neutral-900 hover:bg-[#E5E5E2] dark:hover:bg-neutral-800 text-[#777777] dark:text-neutral-300 rounded-full font-bold transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmCrop}
            className="px-6 py-2.5 bg-[#800000] hover:bg-[#660000] text-white font-bold rounded-full shadow-xs flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Check className="w-4 h-4" /> Apply & Save Cropped Photo
          </button>
        </div>

      </div>
    </div>
  );
};
