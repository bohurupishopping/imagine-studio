'use client';

import { useState } from 'react';
import { Check, ChevronDown, Brush, PenTool, Type, Palette, Pencil, Sparkles, Box } from 'lucide-react';
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
    prompt: `minimalist t-shirt design, clean geometric shapes, precise lines, monochromatic color palette, 
      maximum negative space, modern aesthetic, flat vector illustration, perfect symmetry, 
      ultra-clean composition, professional t-shirt design, white background, isolated elements, 
      print-ready, scalable vector graphics, high contrast, bold outlines, no gradients, 
      no textures, no complex patterns, high resolution (300dpi), CMYK color mode, 
      ready for screen printing, commercial use`,
    icon: <Brush className="w-3.5 h-3.5 mr-2" />
  },
  'vintage': {
    name: 'Vintage',
    prompt: `vintage t-shirt design, retro 80s/90s style, distressed textures, faded color palette, 
      halftone patterns, screen print effect, worn look, classic typography, hand-drawn elements, 
      muted tones, subtle noise texture, retro color grading, vintage logo style, 
      professional t-shirt design, white background, isolated elements, print-ready, 
      scalable vector graphics, high resolution (300dpi), CMYK color mode, 
      ready for screen printing, commercial use`,
    icon: <Sparkles className="w-3.5 h-3.5 mr-2" />
  },
  'typography': {
    name: 'Typography',
    prompt: `typographic t-shirt design, modern typography, creative text arrangement, 
      bold sans-serif fonts, clean layout, perfect kerning, balanced negative space, 
      text as graphic element, monochrome or duotone color scheme, professional t-shirt design, 
      white background, isolated elements, print-ready, scalable vector graphics, 
      high contrast, crisp edges, no complex textures, high resolution (300dpi), 
      CMYK color mode, ready for screen printing, commercial use`,
    icon: <Type className="w-3.5 h-3.5 mr-2" />
  },
  'illustrative': {
    name: 'Illustrative',
    prompt: `illustrative t-shirt design, hand-drawn illustration style, detailed line work, 
      creative composition, artistic flair, organic shapes, balanced detail, 
      limited color palette, professional t-shirt design, white background, 
      isolated elements, print-ready, scalable vector graphics, high resolution (300dpi), 
      CMYK color mode, ready for screen printing, commercial use, 
      includes subtle texture overlay for artistic effect`,
    icon: <PenTool className="w-3.5 h-3.5 mr-2" />
  },
  'graphic': {
    name: 'Graphic',
    prompt: `graphic t-shirt design, bold geometric patterns, vibrant color palette, 
      modern abstract composition, clean vector shapes, high contrast, 
      optical art influences, professional t-shirt design, white background, 
      isolated elements, print-ready, scalable vector graphics, 
      no gradients, no complex textures, high resolution (300dpi), 
      CMYK color mode, ready for screen printing, commercial use`,
    icon: <Palette className="w-3.5 h-3.5 mr-2" />
  },
  '3d': {
    name: '3D',
    prompt: `3D t-shirt design, realistic 3D modeling, depth and perspective, 
      volumetric lighting, soft shadows, material textures, professional rendering, 
      isometric view, clean edges, professional t-shirt design, white background, 
      isolated elements, print-ready, high resolution (300dpi), CMYK color mode, 
      ready for screen printing, commercial use, includes subtle ambient occlusion`,
    icon: <Box className="w-3.5 h-3.5 mr-2" />
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
            "bg-gray-100/90 dark:bg-gray-800/50",
            "border border-gray-200 dark:border-gray-700/50",
            "hover:bg-gray-200/90 hover:border-gray-300",
            "text-gray-600",
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
