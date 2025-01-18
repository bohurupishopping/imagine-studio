'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import ImageStyleSelector from './ImageStyleSelector';

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

  const handleSubmit = () => {
    onGenerate(prompt);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSubmit();
    }
    // Auto-adjust height on input
    const target = event.target as HTMLInputElement;
    target.style.height = 'auto';
    target.style.height = `${Math.min(target.scrollHeight, 200)}px`;
  };

  // Handle height adjustment for streaming updates
  useEffect(() => {
    const input = document.getElementById('prompt');
    if (input) {
      input.style.height = 'auto';
      input.style.height = `${Math.min(input.scrollHeight, 200)}px`;
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
    <div className="flex flex-col space-y-2">
      <div className="flex flex-col space-y-2">
        <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
          <Input
            id="prompt"
            placeholder="A futuristic cityscape at sunset"
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            className="resize-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-purple-500 flex-1"
          />
          
          <div className="flex space-x-1">
            <ImageStyleSelector 
              onStyleChange={onStyleChange || (() => {})}
              className="flex-1 min-w-[80px] text-xs"
            />
            
            <Button
              onClick={handleEnhance}
              disabled={!prompt.trim() || isEnhancing}
              className="flex-1 md:flex-none rounded-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg transition-all duration-200 min-w-[60px] px-2 py-0.5 text-xs"
            >
              {isEnhancing && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
              {!isEnhancing && (
                <>
                  <Sparkles className="w-3 h-3 mr-1" />
                  Enhance
                </>
              )}
            </Button>
            
            <Button 
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex-1 md:flex-none rounded-full bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 text-white shadow-lg transition-all duration-200 min-w-[60px] px-2 py-0.5 text-xs"
            >
              {isLoading && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
              {!isLoading && (
                <>
                  <Sparkles className="w-3 h-3 mr-1" />
                  Generate
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {enhanceError && (
        <div className="text-red-500 text-sm mt-1">
          {enhanceError}
        </div>
      )}
    </div>
  );
};

export default ImageInputSection;
