'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Download, Copy, Check, Share2, Plus, Crop, RotateCw, Sliders } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { TextOverlay } from './editor/TextOverlay';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface ImagePreviewProps {
  src: string;
  alt: string;
  prompt: string;
  onClose: () => void;
}

interface TextOverlayData {
  id: string;
  text: string;
  position: { x: number; y: number };
  fontSize: number;
  color: string;
}

export default function ImagePreview({ src, alt, prompt, onClose }: ImagePreviewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [textOverlays, setTextOverlays] = useState<TextOverlayData[]>([]);
  const [crop, setCrop] = useState({ x: 0, y: 0, width: 1, height: 1 });
  const [rotation, setRotation] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const imageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  // Handle zoom functionality
  const handleZoom = (e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * -0.01;
    const newScale = Math.min(Math.max(1, scale + delta), 4);
    setScale(newScale);
  };

  // Add new text overlay
  const addTextOverlay = () => {
    const newOverlay: TextOverlayData = {
      id: Math.random().toString(36).substring(2, 9),
      text: 'Edit me',
      position: { x: 50, y: 50 },
      fontSize: 24,
      color: '#ffffff'
    };
    setTextOverlays([...textOverlays, newOverlay]);
  };

  // Update text overlay
  const updateTextOverlay = (id: string, updatedOverlay: Partial<TextOverlayData>) => {
    setTextOverlays(prev => 
      prev.map(overlay => 
        overlay.id === id ? { ...overlay, ...updatedOverlay } : overlay
      )
    );
  };

  // Remove text overlay
  const removeTextOverlay = (id: string) => {
    setTextOverlays(prev => prev.filter(overlay => overlay.id !== id));
  };

  // Handle image editing filters
  const applyFilters = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.filter = `
      brightness(${brightness}%)
      contrast(${contrast}%)
      saturate(${saturation}%)
    `;
  }, [brightness, contrast, saturation]);

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

  // Download functionality with overlays and edits
  const handleDownload = async () => {
    try {
      if (!canvasRef.current) return;

      // Use proxy endpoint to fetch image
      const proxyUrl = `/api/download-image?url=${encodeURIComponent(src)}`;
      const response = await fetch(proxyUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch image via proxy');
      }

      // Create image from blob
      const blob = await response.blob();
      const img = new window.Image() as HTMLImageElement;
      img.src = URL.createObjectURL(blob);

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = (err) => {
          console.error('Image load error:', err);
          toast({
            title: "Error",
            description: "Failed to load image for download. Please try again.",
            variant: "destructive",
          });
          reject(err);
        };
      });

      // Get natural dimensions
      const naturalWidth = img.naturalWidth;
      const naturalHeight = img.naturalHeight;

      // Set up canvas
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      // Set canvas dimensions to match natural image size
      canvas.width = naturalWidth;
      canvas.height = naturalHeight;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Apply transformations
      ctx.save();
      
      // Apply crop
      ctx.beginPath();
      ctx.rect(
        crop.x * naturalWidth,
        crop.y * naturalHeight,
        crop.width * naturalWidth,
        crop.height * naturalHeight
      );
      ctx.clip();

      // Apply rotation
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.translate(-canvas.width / 2, -canvas.height / 2);

      // Apply filters
      applyFilters(ctx);

      // Draw the base image
      ctx.drawImage(img, 0, 0, naturalWidth, naturalHeight);

      // Draw text overlays
      textOverlays.forEach(overlay => {
        ctx.save();
        ctx.font = `${overlay.fontSize}px sans-serif`;
        ctx.fillStyle = overlay.color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(
          overlay.text,
          overlay.position.x * (naturalWidth / 100),
          overlay.position.y * (naturalHeight / 100)
        );
        ctx.restore();
      });

      ctx.restore();

      // Convert to blob and download
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        
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
      }, 'image/png', 1.0);
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
    <div className="w-full h-[500px] md:h-[600px] bg-white rounded-lg flex items-center justify-center relative p-4">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-gray-400">Loading image...</p>
        </div>
      )}

      {src ? (
        <>
            <div 
              ref={imageRef}
              className="relative w-full h-full overflow-hidden image-container"
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
              {src && (
                <Image
                  src={`/api/download-image?url=${encodeURIComponent(src)}`}
                  alt={alt}
                  fill
                  className="object-contain rounded-lg select-none"
                  onLoadingComplete={() => setIsLoading(false)}
                  onError={() => {
                    setIsLoading(false);
                    toast({
                      title: "Error",
                      description: "Failed to load image",
                      variant: "destructive",
                    });
                  }}
                  draggable={false}
                />
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 bg-black/50 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg">
            <Button
              variant="default"
              size="sm"
              className="bg-blue-500 hover:bg-blue-600"
              onClick={addTextOverlay}
            >
              <Plus className="h-4 w-4 text-white" />
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="default"
                  size="sm"
                  className="bg-purple-500 hover:bg-purple-600"
                >
                  <Crop className="h-4 w-4 text-white" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium leading-none">Crop</h4>
                    <p className="text-sm text-muted-foreground">
                      Adjust image cropping
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <Slider
                      value={[crop.width]}
                      min={0.1}
                      max={1}
                      step={0.01}
                      onValueChange={([value]) => 
                        setCrop(prev => ({ ...prev, width: value }))
                      }
                    />
                    <Slider
                      value={[crop.height]}
                      min={0.1}
                      max={1}
                      step={0.01}
                      onValueChange={([value]) => 
                        setCrop(prev => ({ ...prev, height: value }))
                      }
                    />
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="default"
                  size="sm"
                  className="bg-green-500 hover:bg-green-600"
                >
                  <RotateCw className="h-4 w-4 text-white" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium leading-none">Rotate</h4>
                    <p className="text-sm text-muted-foreground">
                      Adjust image rotation
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <Slider
                      value={[rotation]}
                      min={-180}
                      max={180}
                      step={1}
                      onValueChange={([value]) => setRotation(value)}
                    />
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="default"
                  size="sm"
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  <Sliders className="h-4 w-4 text-white" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium leading-none">Filters</h4>
                    <p className="text-sm text-muted-foreground">
                      Adjust image filters
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <div className="flex flex-col gap-2">
                      <Label>Brightness</Label>
                      <Slider
                        value={[brightness]}
                        min={0}
                        max={200}
                        step={1}
                        onValueChange={([value]) => setBrightness(value)}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label>Contrast</Label>
                      <Slider
                        value={[contrast]}
                        min={0}
                        max={200}
                        step={1}
                        onValueChange={([value]) => setContrast(value)}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label>Saturation</Label>
                      <Slider
                        value={[saturation]}
                        min={0}
                        max={200}
                        step={1}
                        onValueChange={([value]) => setSaturation(value)}
                      />
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            <Button
              variant="default"
              size="sm"
              className="bg-indigo-500 hover:bg-indigo-600"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4 text-white" />
            </Button>
            <Button
              variant="default"
              size="sm"
              className="bg-pink-500 hover:bg-pink-600"
              onClick={handleCopyPrompt}
            >
              {isCopied ? (
                <Check className="h-4 w-4 text-white" />
              ) : (
                <Copy className="h-4 w-4 text-white" />
              )}
            </Button>
            <Button
              variant="default"
              size="sm"
              className="bg-teal-500 hover:bg-teal-600"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4 text-white" />
            </Button>
          </div>

          {/* Text Overlays */}
          {textOverlays.map(overlay => (
            <TextOverlay
              key={overlay.id}
              text={overlay.text}
              position={overlay.position}
              fontSize={overlay.fontSize}
              color={overlay.color}
              onTextChange={(text) => updateTextOverlay(overlay.id, { text })}
              onPositionChange={(position) => updateTextOverlay(overlay.id, { position })}
              onStyleChange={(style) => updateTextOverlay(overlay.id, style)}
              onRemove={() => removeTextOverlay(overlay.id)}
            />
          ))}

          {/* Hidden canvas for final composition */}
          <canvas ref={canvasRef} className="hidden" />

        </>
      ) : (
        <p className="text-gray-400">Your generated image will appear here</p>
      )}

      <Button
        variant="default"
        size="sm"
        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600"
        onClick={onClose}
      >
        <span className="text-white">×</span>
      </Button>
    </div>
  );
}
