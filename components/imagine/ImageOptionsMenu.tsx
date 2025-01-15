'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ImageStyleSelector from './ImageStyleSelector';

interface ImageOptionsMenuProps {
  onStyleChange: (style: string) => void;
}

export default function ImageOptionsMenu({
  onStyleChange}: ImageOptionsMenuProps) {
  return (
    <div className="space-y-6">
      <ImageStyleSelector onStyleChange={onStyleChange} />

    </div>
  );
}