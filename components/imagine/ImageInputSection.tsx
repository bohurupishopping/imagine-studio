'use client';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles, Send } from 'lucide-react';
import { useState, useEffect } from 'react';
import ImageStyleSelector from './ImageStyleSelector';
import { motion } from 'framer-motion';

type ImageInputSectionProps = {
  onGenerate: (prompt: string) => void;
  isLoading: boolean;
  onStyleChange?: (style: string) => void;
};

const ImageInputSection: React.FC<ImageInputSectionProps> = ({ 
  onGenerate, 
  isLoading,
  onStyleChange 
}) => {
  const [prompt, setPrompt] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhanceError, setEnhanceError] = useState<string | null>(null);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    onGenerate(prompt);
  };

  // Handle height adjustment for streaming updates
  useEffect(() => {
    const textarea = document.getElementById('prompt') as HTMLTextAreaElement;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [prompt]);

  const handleEnhance = async () => {
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
  };

  return (
    <div className="border-t border-white/10 bg-white/5 p-1.5 sm:p-2">
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
        <motion.div
          className="relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-emerald-500/10
            rounded-[24px] blur opacity-75 backdrop-blur-sm" />
          
          <div className="relative rounded-[24px] overflow-hidden
            bg-white/10 dark:bg-gray-900/20 backdrop-blur-sm
            border border-white/20 dark:border-white/10
            shadow-[0_0_0_1px_rgba(59,130,246,0.1)] dark:shadow-[0_0_0_1px_rgba(59,130,246,0.05)]
            transition-all duration-300 hover:shadow-[0_0_0_1px_rgba(59,130,246,0.2)]
            dark:hover:shadow-[0_0_0_1px_rgba(59,130,246,0.1)]">
            
            <div className="relative">
              <Textarea
                id="prompt"
                value={prompt}
                onChange={(e) => {
                  setPrompt(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
                }}
                placeholder="Describe the image you want to generate..."
                className="w-full min-h-[40px] max-h-[200px] py-2 px-3
                  bg-transparent border-0 outline-0 focus:outline-0 ring-0 focus:ring-0 focus:ring-offset-0
                  resize-none text-gray-700 dark:text-gray-200
                  placeholder:text-gray-400 dark:placeholder:text-gray-500
                  text-[15px] leading-tight
                  [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]
                  transition-colors duration-200"
                style={{
                  height: '40px',
                  boxShadow: 'none',
                  outline: 'none'
                }}
              />
              
              <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </div>

            <div className="flex items-center justify-between gap-2 px-3 py-2 
              bg-gradient-to-b from-transparent to-black/[0.02] dark:to-white/[0.02]">
              <div className="flex items-center gap-2 flex-1">
                <ImageStyleSelector
                  onStyleChange={onStyleChange || (() => {})}
                  className="h-8 text-xs font-medium bg-white/5 hover:bg-white/10 
                    dark:bg-white/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-200
                    border border-white/10 rounded-lg transition-colors duration-200"
                />
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  type="button"
                  onClick={handleEnhance}
                  disabled={!prompt.trim() || isEnhancing}
                  className="h-8 px-3 text-xs font-medium
                    bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500
                    hover:from-amber-600 hover:via-orange-600 hover:to-yellow-600
                    disabled:from-gray-400 disabled:to-gray-500
                    text-white rounded-lg
                    shadow-lg hover:shadow-xl
                    transition-all duration-300
                    disabled:shadow-none disabled:opacity-70
                    flex items-center gap-1.5"
                >
                  {isEnhancing ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  <span>{isEnhancing ? "Enhancing..." : "Enhance"}</span>
                </Button>

                <Button 
                  type="submit"
                  disabled={!prompt.trim() || isLoading}
                  className="h-8 px-4 text-xs font-medium
                    bg-gradient-to-r from-purple-500 via-blue-500 to-emerald-500
                    hover:from-purple-600 hover:via-blue-600 hover:to-emerald-600
                    disabled:from-gray-400 disabled:to-gray-500
                    text-white rounded-lg
                    shadow-lg hover:shadow-xl
                    transition-all duration-300
                    disabled:shadow-none disabled:opacity-70"
                >
                  <div className="flex items-center gap-1.5">
                    {isLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    <span>{isLoading ? "Generating..." : "Generate"}</span>
                  </div>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </form>

      {enhanceError && (
        <div className="mt-2 p-3 bg-red-50/80 backdrop-blur-sm border-l-4 border border-red-200 border-l-red-500 rounded-lg text-red-600 text-sm">
          {enhanceError}
        </div>
      )}
    </div>
  );
};

export default ImageInputSection;
