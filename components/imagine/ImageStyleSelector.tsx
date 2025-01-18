'use client';

import { useState } from 'react';
import { Check, ChevronDown, Brush, PenTool, Type, Palette, Pencil, Sparkles } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const imageStyles = {
  'minimalist': {
    name: 'Minimalist',
    prompt: 'minimalist design, clean lines, simple shapes, monochromatic color scheme, negative space, modern aesthetic, geometric patterns, flat design, vector art, white background, isolated elements, print-ready, scalable graphics, professional t-shirt design, commercial use, no background, high resolution, 300dpi, CMYK color mode, ready for screen printing',
    icon: <Brush className="w-3.5 h-3.5 mr-2" />
  },
  'vintage': {
    name: 'Vintage',
    prompt: 'vintage t-shirt design, retro style, distressed textures, faded colors, classic typography, old school aesthetic, weathered look, hand-drawn elements, screen print effect, white background, isolated elements, print-ready, scalable graphics, professional t-shirt design, commercial use, no background, high resolution, 300dpi, CMYK color mode, ready for screen printing',
    icon: <Sparkles className="w-3.5 h-3.5 mr-2" />
  },
  'typography': {
    name: 'Typography',
    prompt: 'typographic design, bold fonts, creative text arrangement, modern typography, clean layout, white background, isolated elements, print-ready, scalable graphics, professional t-shirt design, commercial use, no background, high resolution, 300dpi, CMYK color mode, ready for screen printing',
    icon: <Type className="w-3.5 h-3.5 mr-2" />
  },
  'illustrative': {
    name: 'Illustrative',
    prompt: 'illustrative design, hand-drawn elements, detailed line work, creative composition, artistic style, white background, isolated elements, print-ready, scalable graphics, professional t-shirt design, commercial use, no background, high resolution, 300dpi, CMYK color mode, ready for screen printing',
    icon: <PenTool className="w-3.5 h-3.5 mr-2" />
  },
  'graphic': {
    name: 'Graphic',
    prompt: 'graphic design, bold colors, geometric shapes, modern patterns, abstract composition, white background, isolated elements, print-ready, scalable graphics, professional t-shirt design, commercial use, no background, high resolution, 300dpi, CMYK color mode, ready for screen printing',
    icon: <Palette className="w-3.5 h-3.5 mr-2" />
  },
  'hand-drawn': {
    name: 'Hand Drawn',
    prompt: 'hand-drawn design, sketch style, organic shapes, artistic imperfections, creative illustration, white background, isolated elements, print-ready, scalable graphics, professional t-shirt design, commercial use, no background, high resolution, 300dpi, CMYK color mode, ready for screen printing',
    icon: <Pencil className="w-3.5 h-3.5 mr-2" />
  }
};

interface ImageStyleSelectorProps {
  onStyleChange: (style: string) => void;
  className?: string;
}

export default function ImageStyleSelector({ onStyleChange, className }: ImageStyleSelectorProps) {
  const [selectedStyle, setSelectedStyle] = useState('graphic');

  const handleStyleSelect = (styleId: string) => {
    setSelectedStyle(styleId);
    onStyleChange(imageStyles[styleId as keyof typeof imageStyles].prompt);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-10 w-[140px] px-4",
            className,
            "flex items-center justify-between gap-1",
            "rounded-full",
            "bg-white/50 dark:bg-gray-800/50",
            "border border-white/30 dark:border-gray-700/50",
            "hover:border-blue-300/50 dark:hover:border-blue-700/50",
            "text-white",
            "shadow-lg",
            "group transition-all duration-200"
          )}
        >
          <span className="text-xs font-medium text-gray-700 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {imageStyles[selectedStyle as keyof typeof imageStyles].name}
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
          className={cn(
            "w-[160px] p-1",
            "bg-white/95 dark:bg-gray-800/95",
            "border border-white/30 dark:border-gray-700/50",
            "backdrop-blur-md",
            "animate-in zoom-in-90 duration-100"
          )}
      >
        {Object.entries(imageStyles).map(([id, style]) => (
          <DropdownMenuItem
            key={id}
            onClick={() => handleStyleSelect(id)}
            className={cn(
              "text-xs flex items-center",
              "px-2 py-1.5 rounded-md",
              "text-gray-700 dark:text-gray-300",
              "relative",
              selectedStyle === id && [
                "bg-gradient-to-r from-blue-50/80 to-blue-50/40",
                "dark:from-blue-900/20 dark:to-blue-900/10",
                "text-blue-600 dark:text-blue-400",
                "font-medium"
              ],
              "hover:bg-gray-50 dark:hover:bg-gray-800/50",
              "transition-all duration-150 ease-in-out",
              "cursor-default select-none"
            )}
          >
            {style.icon}
            <span className="flex-1">{style.name}</span>
            {selectedStyle === id && (
              <Check className="h-3 w-3 ml-2" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
