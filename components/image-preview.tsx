'use client';

import { cn } from '@/lib/utils';

interface ImagePreviewProps {
  imageUrl?: string;
  isLoading?: boolean;
  className?: string;
}

export function ImagePreview({ imageUrl, isLoading, className }: ImagePreviewProps) {
  return (
    <div className={cn(
      'aspect-square bg-gray-100 rounded-lg flex items-center justify-center',
      'relative overflow-hidden',
      className
    )}>
      {isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
        </div>
      ) : imageUrl ? (
        <img
          src={imageUrl}
          alt="Generated image"
          className="w-full h-full object-cover"
        />
      ) : (
        <p className="text-gray-400">Your generated image will appear here</p>
      )}
    </div>
  );
}
