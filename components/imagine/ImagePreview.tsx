'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

interface ImagePreviewProps {
  src: string;
  alt: string;
  prompt: string;
  onClose: () => void;
}

export default function ImagePreview({ src, alt, prompt, onClose }: ImagePreviewProps) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-gray-400">Loading image...</p>
        </div>
      )}

      {src ? (
        <>
          <Image
            src={src}
            alt={alt}
            fill
            className="object-contain rounded-lg"
            onLoadingComplete={() => setIsLoading(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
            <p className="text-white/90 text-sm line-clamp-2 text-center">
              {prompt}
            </p>
          </div>
        </>
      ) : (
        <p className="text-gray-400">Your generated image will appear here</p>
      )}

      <Button
        variant="ghost"
        size="sm"
        className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm hover:bg-white"
        onClick={onClose}
      >
        <span className="text-gray-700">×</span>
      </Button>
    </div>
  );
}
