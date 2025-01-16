'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface TextOverlayProps {
  text: string;
  position: { x: number; y: number };
  onTextChange: (text: string) => void;
  onPositionChange: (position: { x: number; y: number }) => void;
  onRemove: () => void;
  fontSize: number;
  color: string;
  onStyleChange: (style: { fontSize: number; color: string }) => void;
}

export function TextOverlay({
  text,
  position,
  onTextChange,
  onPositionChange,
  onRemove,
  fontSize,
  color,
  onStyleChange
}: TextOverlayProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const container = document.querySelector('.image-container');
      if (!container) return;
      
      const rect = container.getBoundingClientRect();
      const xPercent = ((e.clientX - rect.left) / rect.width) * 100;
      const yPercent = ((e.clientY - rect.top) / rect.height) * 100;
      
      // Keep text within image bounds with 5% margin
      const newX = Math.min(Math.max(5, xPercent), 95);
      const newY = Math.min(Math.max(5, yPercent), 95);
      
      onPositionChange({
        x: newX,
        y: newY
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('center');
  const [backgroundColor, setBackgroundColor] = useState('transparent');
  const [textShadow, setTextShadow] = useState('none');
  const [rotation, setRotation] = useState(0);

  return (
    <div
      className="absolute cursor-move select-none"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        fontSize: `${fontSize}px`,
        color: color,
        transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
        pointerEvents: 'auto',
        textAlign,
        backgroundColor,
        textShadow,
        padding: '4px 8px',
        borderRadius: '4px'
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="relative group">
        <Popover>
          <PopoverTrigger asChild>
            <div className="p-2 rounded-lg bg-white/90 backdrop-blur-sm shadow-sm hover:bg-white transition-colors">
              {text}
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-4 bg-gradient-to-br from-purple-100/95 via-pink-100/95 to-blue-100/95 backdrop-blur-2xl border-2 border-white/30 rounded-2xl shadow-2xl">
            <div className="grid gap-4">
              <div className="space-y-1.5">
                <h4 className="font-bold text-sm bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Text Settings
                </h4>
                <p className="text-xs text-purple-800/90">
                  Customize your text overlay
                </p>
              </div>
              <div className="grid gap-2.5">
                <div className="grid grid-cols-3 items-center gap-2.5">
                  <Label htmlFor="text" className="text-xs font-medium text-purple-800/90">Text</Label>
                  <Input
                    id="text"
                    value={text}
                    onChange={(e) => onTextChange(e.target.value)}
                    className="col-span-2 h-8 text-xs bg-white/90 border-purple-200/50 hover:border-purple-300 focus:border-purple-400 focus:ring-1 focus:ring-purple-200"
                  />
                </div>
                <div className="grid grid-cols-3 items-center gap-2.5">
                  <Label htmlFor="fontSize" className="text-xs font-medium text-purple-800/90">Size</Label>
                  <Slider
                    id="fontSize"
                    defaultValue={[fontSize]}
                    min={12}
                    max={72}
                    step={1}
                    onValueChange={([value]) =>
                      onStyleChange({ fontSize: value, color })
                    }
                    className="col-span-2 h-3 bg-purple-100/50 [&>div]:bg-gradient-to-r from-purple-400 to-blue-400"
                  />
                </div>
                <div className="grid grid-cols-3 items-center gap-2.5">
                  <Label htmlFor="color" className="text-xs font-medium text-purple-800/90">Color</Label>
                  <Input
                    type="color"
                    id="color"
                    value={color}
                    onChange={(e) =>
                      onStyleChange({ fontSize, color: e.target.value })
                    }
                    className="col-span-2 h-8 p-0.5 bg-white/90 border-purple-200/50 hover:border-purple-300 focus:border-purple-400 focus:ring-1 focus:ring-purple-200 rounded-lg"
                  />
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="bgColor">Background</Label>
                  <div className="col-span-2 flex gap-2">
                    <Input
                      type="color"
                      id="bgColor"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="h-8 p-1 bg-white/90 border-purple-200/50 hover:border-purple-300 focus:border-purple-400 focus:ring-1 focus:ring-purple-200 rounded-lg flex-1"
                    />
                    <Button
                      variant={backgroundColor === 'transparent' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setBackgroundColor('transparent')}
                      className="h-8 px-3 text-xs font-medium"
                    >
                      Transparent
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-3 items-center gap-2.5">
                  <Label htmlFor="rotation" className="text-xs font-medium text-purple-800/90">Rotation</Label>
                  <Slider
                    id="rotation"
                    defaultValue={[rotation]}
                    min={-180}
                    max={180}
                    step={1}
                    onValueChange={([value]) => setRotation(value)}
                    className="col-span-2 h-3 bg-purple-100/50 [&>div]:bg-gradient-to-r from-purple-400 to-blue-400"
                  />
                </div>
                <div className="grid grid-cols-3 items-center gap-2.5">
                  <Label htmlFor="positionX" className="text-xs font-medium text-purple-800/90">Horizontal</Label>
                  <Slider
                    id="positionX"
                    value={[position.x]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={([value]) => onPositionChange({ x: value, y: position.y })}
                    className="col-span-2 h-3 bg-purple-100/50 [&>div]:bg-gradient-to-r from-purple-400 to-blue-400"
                  />
                </div>
                <div className="grid grid-cols-3 items-center gap-2.5">
                  <Label htmlFor="positionY" className="text-xs font-medium text-purple-800/90">Vertical</Label>
                  <Slider
                    id="positionY"
                    value={[position.y]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={([value]) => onPositionChange({ x: position.x, y: value })}
                    className="col-span-2 h-3 bg-purple-100/50 [&>div]:bg-gradient-to-r from-purple-400 to-blue-400"
                  />
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>
        <Button
          variant="ghost"
          size="sm"
          className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={onRemove}
        >
          ×
        </Button>
      </div>
    </div>
  );
}
