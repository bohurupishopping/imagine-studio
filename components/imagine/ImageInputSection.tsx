'use client';

import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import ImageStyleSelector, { imageStyles } from './ImageStyleSelector';
import { Sparkles, Loader2 } from 'lucide-react';

interface ImageInputSectionProps {
  onGenerate: (prompt: string) => void;
  isLoading: boolean;
  onStyleChange?: (style: string) => void;
}

export default function ImageInputSection({ 
  onGenerate, 
  isLoading,
  onStyleChange 
}: ImageInputSectionProps) {
  const [prompt, setPrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('minimalist');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhanceError, setEnhanceError] = useState<string | null>(null);

  const handleStyleChange = (style: string) => {
    setSelectedStyle(style);
    onStyleChange?.(imageStyles[style as keyof typeof imageStyles].prompt);
  };

  return (
    <div className="w-full">
      {/* Input Area */}
      <div className={cn(
        "relative flex flex-col gap-3",
        "rounded-xl",
        "p-3",
        "bg-white/90 dark:bg-gray-800/90",
        "border border-blue-200 dark:border-blue-800/50",
        "shadow-[0_0_0_1px_rgba(59,130,246,0.1)]",
        "dark:shadow-[0_0_0_1px_rgba(59,130,246,0.05)]"
      )}>
        {/* Text Input */}
        <div className="flex-1 relative">
          <Textarea
            id="prompt"
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
            }}
            placeholder="Describe your image..."
            className={cn(
              "w-full min-h-[100px] max-h-[160px] py-3 px-4",
              "bg-gradient-to-b from-white/50 to-white/20 dark:from-gray-800/50 dark:to-gray-800/20",
              "border border-gray-200 dark:border-gray-700",
              "rounded-lg",
              "resize-none",
              "text-gray-700 dark:text-gray-200",
              "placeholder:text-gray-400 dark:placeholder:text-gray-500",
              "text-[14px] leading-snug",
              "focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
              "transition-all duration-200",
              "[&::-webkit-scrollbar]:hidden",
              "[-ms-overflow-style:none]",
              "[scrollbar-width:none]"
            )}
            style={{
              boxShadow: 'none',
              outline: 'none'
            }}
          />
        </div>

        {/* Bottom Controls */}
        <div className="flex items-center gap-2">
          {/* Style Selector */}
          <div className="flex-1">
            <ImageStyleSelector onStyleChange={handleStyleChange} />
          </div>

          {/* Enhance Button */}
          <Button
            type="button"
            onClick={async () => {
              setIsEnhancing(true);
              setEnhanceError(null);
              
              try {
                const response = await fetch('/api/enhance-prompt', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ prompt })
                });

                if (!response.ok) {
                  throw new Error('Failed to enhance prompt');
                }

                const reader = response.body?.getReader();
                const decoder = new TextDecoder();
                let buffer = '';
                let enhancedPrompt = '';

                while (reader) {
                  const { done, value } = await reader.read();
                  if (done) break;

                  buffer += decoder.decode(value, { stream: true });
                  const lines = buffer.split('\n');
                  buffer = lines.pop() || '';

                  for (const line of lines) {
                    if (line.startsWith('data:')) {
                      const json = line.slice(5).trim();
                      if (json === '[DONE]') break;
                      
                      try {
                        const data = JSON.parse(json);
                        if (data.content) {
                          enhancedPrompt += data.content;
                          setPrompt(enhancedPrompt);
                        }
                      } catch (error) {
                        console.error('Error parsing stream data:', error);
                      }
                    }
                  }
                }
              } catch (error) {
                console.error('Error enhancing prompt:', error);
                setEnhanceError('Failed to enhance prompt. Please try again.');
              } finally {
                setIsEnhancing(false);
              }
            }}
            disabled={!prompt.trim() || isEnhancing}
            className={cn(
              "h-9 w-24",
              "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600",
              "text-white text-xs font-medium",
              "rounded-lg",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "transition-all duration-200",
              "flex items-center justify-center gap-1"
            )}
          >
            {isEnhancing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            {isEnhancing ? 'Enhancing...' : 'Enhance'}
          </Button>

          {enhanceError && (
            <div className="absolute bottom-20 left-4 right-4 text-red-500 text-sm">
              {enhanceError}
            </div>
          )}

          {/* Generate Button */}
          <Button
            type="button"
            onClick={() => onGenerate(prompt)}
            disabled={isLoading || !prompt.trim()}
            className={cn(
              "h-9 w-32",
              "bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600",
              "text-white text-xs font-medium",
              "rounded-lg",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "transition-all duration-200",
              "flex items-center justify-center gap-1"
            )}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                Generate
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
