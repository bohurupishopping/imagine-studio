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
            className="flex-1 h-9 text-sm bg-white/80 border-gray-200/80 focus:border-purple-300 focus:ring-purple-200 placeholder:text-gray-500/70"
          />
          
          <div className="flex flex-wrap gap-2">
            <ImageStyleSelector
              onStyleChange={onStyleChange || (() => {})}
              className="flex-grow sm:flex-grow-0 min-w-[120px] h-9 text-sm"
            />
            
            <div className="flex gap-2 flex-grow sm:flex-grow-0">
              <Button
                onClick={handleEnhance}
                disabled={!prompt.trim() || isEnhancing}
                className="h-9 text-sm bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white shadow-md hover:shadow-lg transition-all duration-300 flex-1 sm:flex-none min-w-[90px] rounded-full"
              >
                {isEnhancing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Enhance
              </Button>
              
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="h-9 text-sm bg-gradient-to-r from-fuchsia-500 to-pink-500 hover:from-fuchsia-600 hover:to-pink-600 text-white shadow-md hover:shadow-lg transition-all duration-300 flex-1 sm:flex-none min-w-[90px] rounded-full"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="mr-2 h-4 w-4" />
                )}
                Generate
              </Button>
            </div>
          </div>
        </div>
      </div>

      {enhanceError && (
        <div className="p-3 bg-red-50/80 backdrop-blur-sm border-l-4 border border-red-200 border-l-red-500 rounded-lg text-red-600 text-sm">
          {enhanceError}
        </div>
      )}
    </div>
  );
};

export default ImageInputSection;
