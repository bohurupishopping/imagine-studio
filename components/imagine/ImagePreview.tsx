'use client';

import Image from 'next/image';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImagePreviewProps {
  src: string;
  alt: string;
  prompt: string;
  onClose: () => void;
}

export default function ImagePreview({ src, alt, prompt, onClose }: ImagePreviewProps) {
  return (
    <div className="relative aspect-square w-full h-full rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 md:w-[400px] md:h-[400px]">
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
      />
      
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-lg"
      >
        <X className="w-4 h-4 text-gray-700" />
      </button>

    </div>
  );
}
