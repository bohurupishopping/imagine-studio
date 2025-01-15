'use client';

import { useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
export const imageStyles = {
  'minimalist': {
    name: 'Minimalist',
    prompt: 'minimalist design, clean lines, simple shapes, monochromatic color scheme, negative space, modern aesthetic, geometric patterns, flat design, vector art, white background, isolated elements, print-ready, scalable graphics, professional t-shirt design, commercial use, no background, high resolution, 300dpi, CMYK color mode, ready for screen printing'
  },
  'vintage': {
    name: 'Vintage',
    prompt: 'vintage t-shirt design, retro style, distressed textures, faded colors, classic typography, old school aesthetic, weathered look, hand-drawn elements, screen print effect, white background, isolated elements, print-ready, scalable graphics, professional t-shirt design, commercial use, no background, high resolution, 300dpi, CMYK color mode, ready for screen printing'
  },
  'typography': {
    name: 'Typography',
    prompt: 'typographic design, bold fonts, creative text arrangement, modern typography, clean layout, white background, isolated elements, print-ready, scalable graphics, professional t-shirt design, commercial use, no background, high resolution, 300dpi, CMYK color mode, ready for screen printing'
  },
  'illustrative': {
    name: 'Illustrative',
    prompt: 'illustrative design, hand-drawn elements, detailed line work, creative composition, artistic style, white background, isolated elements, print-ready, scalable graphics, professional t-shirt design, commercial use, no background, high resolution, 300dpi, CMYK color mode, ready for screen printing'
  },
  'graphic': {
    name: 'Graphic',
    prompt: 'graphic design, bold colors, geometric shapes, modern patterns, abstract composition, white background, isolated elements, print-ready, scalable graphics, professional t-shirt design, commercial use, no background, high resolution, 300dpi, CMYK color mode, ready for screen printing'
  },
  'hand-drawn': {
    name: 'Hand Drawn',
    prompt: 'hand-drawn design, sketch style, organic shapes, artistic imperfections, creative illustration, white background, isolated elements, print-ready, scalable graphics, professional t-shirt design, commercial use, no background, high resolution, 300dpi, CMYK color mode, ready for screen printing'
  }
  };

interface ImageStyleSelectorProps {
  onStyleChange: (style: string) => void;
};

export default function ImageStyleSelector({ onStyleChange }: ImageStyleSelectorProps) {
  const [selectedStyle, setSelectedStyle] = useState('minimalist');

  const handleStyleSelect = (styleId: string) => {
    setSelectedStyle(styleId);
    onStyleChange(imageStyles[styleId as keyof typeof imageStyles].prompt);
  };

  return (
    <div className="space-y-2">
      <Label>Image Style</Label>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="w-full flex items-center justify-between"
          >
            <span>{imageStyles[selectedStyle as keyof typeof imageStyles].name}</span>
            <ChevronDown className="h-4 w-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64">
          {Object.entries(imageStyles).map(([id, style]) => (
            <DropdownMenuItem
              key={id}
              onClick={() => handleStyleSelect(id)}
              className="flex items-center justify-between"
            >
              <span>{style.name}</span>
              {selectedStyle === id && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}