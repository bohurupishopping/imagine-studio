'use client';

import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import ImageStyleSelector, { imageStyles } from './ImageStyleSelector';
import ImageOptionsMenu from './ImageOptionsMenu';
import { Sparkles, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

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
      <motion.div 
        className="w-full max-w-4xl mx-auto px-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {/* Input Area */}
        <motion.div
          className={cn(
            "relative flex flex-col gap-3 md:gap-4 rounded-xl",
            "transition-all duration-300 ease-in-out"
          )}
          whileHover={{ scale: 1.005 }}
          whileTap={{ scale: 0.99 }}
        >
          {/* Text Input */}
          <Textarea
            id="prompt"
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
            }}
            placeholder="Describe your image..."
            className={cn(
              "w-full min-h-[60px] md:min-h-[80px] max-h-[120px] p-2 md:p-3",
              "bg-white/50 dark:bg-gray-800/50 rounded-lg",
              "border border-white/30 dark:border-gray-700/50",
              "text-gray-800 dark:text-gray-100 text-sm",
              "placeholder:text-gray-400/80 dark:placeholder:text-gray-500/80",
              "focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50",
              "transition-all duration-200 ease-out",
              "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            )}
          />

          {/* Bottom Controls */}
          <div className="flex flex-col gap-2">
            {/* Controls Container */}
            <div className="flex flex-row gap-1.5 w-full">
              {/* Image Options Menu */}
              <div className="flex-1">
                <ImageOptionsMenu onStyleChange={handleStyleChange} />
              </div>
              
              {/* Buttons */}
              <div className="flex gap-1.5">
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
                    "h-9 w-full px-2 md:px-3",
                    "bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
                    "text-white text-xs md:text-sm font-medium rounded-xl",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    "transition-all duration-200 ease-out",
                    "flex items-center justify-center gap-1",
                    "shadow-sm hover:shadow-md active:scale-95"
                  )}
                >
                  {isEnhancing ? (
                    <Loader2 className="w-3.5 h-3.5 md:w-4 md:h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  )}
                  <span>{isEnhancing ? 'Enhancing...' : 'Enhance'}</span>
                </Button>

                {/* Generate Button */}
                <Button
                  type="button"
                  onClick={() => onGenerate(prompt)}
                  disabled={isLoading || !prompt.trim()}
                  className={cn(
                    "h-9 w-full px-2 md:px-3",
                    "bg-gradient-to-br from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700",
                    "text-white text-xs md:text-sm font-medium rounded-xl",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    "transition-all duration-200 ease-out",
                    "flex items-center justify-center gap-1",
                    "shadow-sm hover:shadow-md active:scale-95"
                  )}
                >
                  {isLoading ? (
                    <Loader2 className="w-3.5 h-3.5 md:w-4 md:h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  )}
                  <span>{isLoading ? 'Generating...' : 'Generate'}</span>
                </Button>
              </div>
            </div>

            {enhanceError && (
              <div className="absolute bottom-20 left-4 right-4 text-red-500 text-sm">
                {enhanceError}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
  );
}
