'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Download, Copy, Check, Share2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface ImagePreviewProps {
  src: string;
  alt: string;
  prompt: string;
  onClose: () => void;
}

export default function ImagePreview({ src, alt, prompt, onClose }: ImagePreviewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Handle zoom functionality
  const handleZoom = (e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * -0.01;
    const newScale = Math.min(Math.max(1, scale + delta), 4);
    setScale(newScale);
  };

  // Handle drag functionality
  const handleDrag = (e: React.MouseEvent) => {
    if (scale === 1) return;
    if (isDragging) {
      setPosition({
        x: position.x + e.movementX,
        y: position.y + e.movementY
      });
    }
  };

  // Add event listeners for zoom
  useEffect(() => {
    const imageElement = imageRef.current;
    if (!imageElement) return;

    const handleWheelEvent = (e: WheelEvent) => handleZoom(e);
    imageElement.addEventListener('wheel', handleWheelEvent, { passive: false });

    return () => {
      imageElement.removeEventListener('wheel', handleWheelEvent);
    };
  }, [scale]);

  // Download functionality
  const handleDownload = async () => {
    try {
      const proxyUrl = `/api/download-image?url=${encodeURIComponent(src)}`;
      const response = await fetch(proxyUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const filename = `${prompt.slice(0, 30).trim().replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}.png`;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Success",
        description: "Image downloaded successfully",
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Error",
        description: "Failed to download image",
        variant: "destructive",
      });
    }
  };

  // Copy prompt functionality
  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setIsCopied(true);
      toast({
        title: "Copied",
        description: "Prompt copied to clipboard",
      });
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy prompt",
        variant: "destructive",
      });
    }
  };

  // Share functionality
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Generated Image',
          text: prompt,
          url: src
        });
      } else {
        await navigator.clipboard.writeText(src);
        toast({
          title: "Copied",
          description: "Image URL copied to clipboard",
        });
      }
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  return (
    <div className="w-full h-[300px] md:h-[600px] bg-gray-100 rounded-lg flex items-center justify-center relative p-4">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-gray-400">Loading image...</p>
        </div>
      )}

      {src ? (
        <>
          <div 
            ref={imageRef}
            className="relative w-full h-full overflow-hidden"
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
            onMouseMove={handleDrag}
            onMouseLeave={() => setIsDragging(false)}
          >
            <div
              className="relative w-full h-full"
              style={{
                transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
                transition: 'transform 0.1s ease-out',
                cursor: scale > 1 ? 'grab' : 'default'
              }}
            >
              <Image
                src={src}
                alt={alt}
                fill
                className="object-contain rounded-lg select-none"
                onLoadingComplete={() => setIsLoading(false)}
                draggable={false}
              />
            </div>
          </div>

          {/* Controls */}
          <div className="absolute top-2 right-2 flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="bg-white/90 backdrop-blur-sm hover:bg-white"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4 text-gray-700" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="bg-white/90 backdrop-blur-sm hover:bg-white"
              onClick={handleCopyPrompt}
            >
              {isCopied ? (
                <Check className="h-4 w-4 text-gray-700" />
              ) : (
                <Copy className="h-4 w-4 text-gray-700" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="bg-white/90 backdrop-blur-sm hover:bg-white"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4 text-gray-700" />
            </Button>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/50 to-transparent" />
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
