'use client';

import { Button } from '@/components/ui/button';
import { useState } from 'react';

const imageStyles = [
  { value: 'realistic', label: 'Realistic' },
  { value: 'cartoon', label: 'Cartoon' },
  { value: '3d-render', label: '3D Render' },
  { value: 'abstract', label: 'Abstract' },
  { value: 'minimalist', label: 'Minimalist' },
  { value: 'fantasy', label: 'Fantasy' },
];

interface ImageTypeSelectorProps {
  onSelect: (style: string) => void;
}

export function ImageTypeSelector({ onSelect }: ImageTypeSelectorProps) {
  const [selectedStyle, setSelectedStyle] = useState<string>('realistic');

  const handleSelect = (style: string) => {
    setSelectedStyle(style);
    onSelect(style);
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
      {imageStyles.map((style) => (
        <Button
          key={style.value}
          variant={selectedStyle === style.value ? 'default' : 'outline'}
          className="w-full"
          onClick={() => handleSelect(style.value)}
        >
          {style.label}
        </Button>
      ))}
    </div>
  );
}
