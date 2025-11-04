"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Card } from "@/presentation/shared/ui/card";
import { Button } from "@/presentation/shared/ui/button";
import { ArrowLeftRight, Download, Maximize2 } from "lucide-react";

interface ImageComparisonSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  onDownloadBefore?: () => void;
  onDownloadAfter?: () => void;
  className?: string;
}

/**
 * Composant de comparaison d'images avec slider interactif
 * Permet de comparer avant/après en faisant glisser un curseur
 *
 * @example
 * ```tsx
 * <ImageComparisonSlider
 *   beforeImage="/original.jpg"
 *   afterImage="/transformed.jpg"
 *   beforeLabel="Avant"
 *   afterLabel="Après"
 *   onDownloadBefore={handleDownload}
 *   onDownloadAfter={handleDownload}
 * />
 * ```
 */
export function ImageComparisonSlider({
  beforeImage,
  afterImage,
  beforeLabel = "Avant",
  afterLabel = "Après",
  onDownloadBefore,
  onDownloadAfter,
  className = "",
}: ImageComparisonSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = (x / rect.width) * 100;
      setSliderPosition(Math.min(Math.max(percentage, 0), 100));
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || !containerRef.current) return;

      const touch = e.touches[0];
      const rect = containerRef.current.getBoundingClientRect();
      const x = touch.clientX - rect.left;
      const percentage = (x / rect.width) * 100;
      setSliderPosition(Math.min(Math.max(percentage, 0), 100));
    };

    const handleEnd = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('mouseup', handleEnd);
      document.addEventListener('touchend', handleEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging]);

  const handleMouseDown = () => setIsDragging(true);
  const handleTouchStart = () => setIsDragging(true);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ArrowLeftRight size={20} className="text-slate-600" />
          <p className="text-sm font-semibold text-slate-700">
            Glissez pour comparer
          </p>
        </div>
        <div className="flex gap-2">
          {onDownloadBefore && (
            <Button
              size="sm"
              variant="outline"
              onClick={onDownloadBefore}
              className="h-8"
            >
              <Download size={14} className="mr-2" />
              {beforeLabel}
            </Button>
          )}
          {onDownloadAfter && (
            <Button
              size="sm"
              variant="outline"
              onClick={onDownloadAfter}
              className="h-8"
            >
              <Download size={14} className="mr-2" />
              {afterLabel}
            </Button>
          )}
        </div>
      </div>

      {/* Comparaison Slider */}
      <Card className="modern-card overflow-hidden">
        <div
          ref={containerRef}
          className="relative aspect-[16/9] bg-slate-100 cursor-ew-resize select-none"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
        >
          {/* Image Après (en arrière-plan) */}
          <div className="absolute inset-0">
            <Image
              src={afterImage}
              alt={afterLabel}
              fill
              className="object-contain"
              draggable={false}
            />
            <div className="absolute top-3 right-3 px-3 py-1 rounded-md bg-black/70 text-white text-xs font-semibold">
              {afterLabel}
            </div>
          </div>

          {/* Image Avant (avec clip) */}
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
          >
            <Image
              src={beforeImage}
              alt={beforeLabel}
              fill
              className="object-contain"
              draggable={false}
            />
            <div className="absolute top-3 left-3 px-3 py-1 rounded-md bg-black/70 text-white text-xs font-semibold">
              {beforeLabel}
            </div>
          </div>

          {/* Slider Line */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-ew-resize z-10"
            style={{ left: `${sliderPosition}%` }}
          >
            {/* Handle */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center">
              <ArrowLeftRight size={20} className="text-slate-600" />
            </div>
          </div>

          {/* Instructions (affichées au survol) */}
          {!isDragging && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-2 rounded-md bg-black/70 text-white text-xs font-medium opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
              Cliquez et faites glisser pour comparer
            </div>
          )}
        </div>
      </Card>

      {/* Position Indicator */}
      <div className="flex items-center justify-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span className="text-slate-600">
            {beforeLabel} ({Math.round(sliderPosition)}%)
          </span>
        </div>
        <div className="h-4 w-px bg-slate-300" />
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-slate-600">
            {afterLabel} ({Math.round(100 - sliderPosition)}%)
          </span>
        </div>
      </div>
    </div>
  );
}
