'use client';

import Image from 'next/image';
import { X, ZoomIn, ZoomOut } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface ImagePreviewProps {
  src: string;
  alt: string;
  prompt: string;
  onClose: () => void;
}

export default function ImagePreview({ src, alt, prompt, onClose }: ImagePreviewProps) {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleZoom = (direction: 'in' | 'out') => {
    setZoom(prev => {
      const newZoom = direction === 'in' 
        ? Math.min(prev + 0.5, 3)
        : Math.max(prev - 0.5, 1);
      return newZoom;
    });
  };

  const handleDoubleClick = () => {
    setZoom(prev => prev === 1 ? 2 : 1);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (zoom > 1) {
      const touch = e.touches[0];
      setPosition({
        x: touch.clientX - e.currentTarget.getBoundingClientRect().left,
        y: touch.clientY - e.currentTarget.getBoundingClientRect().top
      });
    }
  };

  return (
    <div 
      className="relative aspect-square w-full rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group snap-center touch-pan-x"
      onDoubleClick={handleDoubleClick}
      onTouchMove={handleTouchMove}
    >
      <Image
        src={src}
        alt={alt}
        fill
        style={{
          transform: `scale(${zoom}) translate(${position.x}px, ${position.y}px)`,
          transformOrigin: 'center center'
        }}
        className="object-cover transition-transform duration-300 touch-none select-none"
      />
      
      {/* Zoom Controls */}
      <div className="absolute bottom-4 right-4 flex gap-2">
        <button
          onClick={() => handleZoom('out')}
          className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-lg"
          aria-label="Zoom out"
        >
          <ZoomOut className="w-4 h-4 text-gray-700" />
        </button>
        <button
          onClick={() => handleZoom('in')}
          className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-lg"
          aria-label="Zoom in"
        >
          <ZoomIn className="w-4 h-4 text-gray-700" />
        </button>
      </div>

      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-lg"
        aria-label="Close preview"
      >
        <X className="w-4 h-4 text-gray-700" />
      </button>
    </div>
  );
}
