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
      onPositionChange({
        x: position.x + e.movementX,
        y: position.y + e.movementY
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      className="absolute cursor-move select-none"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        fontSize: `${fontSize}px`,
        color: color,
        transform: 'translate(-50%, -50%)'
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
          <PopoverContent className="w-80">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">Text Settings</h4>
                <p className="text-sm text-muted-foreground">
                  Customize your text overlay
                </p>
              </div>
              <div className="grid gap-2">
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="text">Text</Label>
                  <Input
                    id="text"
                    value={text}
                    onChange={(e) => onTextChange(e.target.value)}
                    className="col-span-2 h-8"
                  />
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="fontSize">Size</Label>
                  <Slider
                    id="fontSize"
                    defaultValue={[fontSize]}
                    min={12}
                    max={72}
                    step={1}
                    onValueChange={([value]) => 
                      onStyleChange({ fontSize: value, color })
                    }
                    className="col-span-2"
                  />
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <Label htmlFor="color">Color</Label>
                  <Input
                    type="color"
                    id="color"
                    value={color}
                    onChange={(e) => 
                      onStyleChange({ fontSize, color: e.target.value })
                    }
                    className="col-span-2 h-8 p-1"
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
