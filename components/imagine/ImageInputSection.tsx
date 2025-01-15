'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';

interface ImageInputSectionProps {
  onGenerate: (prompt: string) => void;
  isLoading: boolean;
}

export default function ImageInputSection({ onGenerate, isLoading }: ImageInputSectionProps) {
  const [prompt, setPrompt] = useState('');

  return (
    <div className="space-y-6">
      {/* Prompt Input */}
      <div className="space-y-2">
        <Label htmlFor="prompt">Image Prompt</Label>
        <Textarea
          id="prompt"
          placeholder="Describe the image you want to generate..."
          rows={4}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
      </div>

      <Separator />

      {/* Generate Button */}
      <Button
        className="w-full"
        size="lg"
        onClick={() => onGenerate(prompt)}
        disabled={isLoading}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="animate-spin">↻</span>
            Generating...
          </span>
        ) : (
          'Generate Image'
        )}
      </Button>
    </div>
  );
}