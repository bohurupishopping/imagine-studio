"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import ImageTypeSelector from "@/components/imagine/ImageTypeSelector";
import ModelSelector from "@/components/imagine/ModelSelector";
import SizeSelector from "@/components/imagine/SizeSelector";
import { Send, Sparkles, RefreshCw } from 'lucide-react';

interface ImageInputSectionProps {
  prompt: string;
  onPromptChange: (value: string) => void;
  selectedModel: string;
  onModelChange: (model: string) => void;
  selectedSize: string;
  onSizeChange: (size: string) => void;
  selectedStyle: string;
  onStyleChange: (style: string) => void;
  isEnhancing: boolean;
  isLoading: boolean;
  onEnhance: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function ImageInputSection({
  prompt,
  onPromptChange,
  selectedModel,
  onModelChange,
  selectedSize,
  onSizeChange,
  selectedStyle,
  onStyleChange,
  isEnhancing,
  isLoading,
  onEnhance,
  onSubmit
}: ImageInputSectionProps) {
  return (
    <div className="border-t border-white/10 bg-white/5 p-1.5 sm:p-2">
      <form onSubmit={onSubmit} className="max-w-2xl mx-auto">
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
            
            <div className="flex items-center justify-between gap-2 px-3 pt-2 pb-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <ImageTypeSelector onStyleChange={onStyleChange} />
                <ModelSelector onModelChange={onModelChange} />
                <SizeSelector onSizeChange={onSizeChange} />
              </div>
            </div>

            <div className="relative">
              <Textarea
                value={prompt}
                onChange={(e) => {
                  onPromptChange(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 200)}px`;
                }}
                placeholder="Describe the image you want to generate..."
                className="w-full min-h-[40px] max-h-[200px] py-2 px-1
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

            <div className="flex items-center justify-between px-3 py-1.5 
              bg-gradient-to-b from-transparent to-black/[0.02] dark:to-white/[0.02]">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={onEnhance}
                  disabled={!prompt.trim() || isEnhancing}
                  className="h-8 px-3 text-xs font-medium
                    bg-white/5 hover:bg-white/10 
                    dark:bg-white/5 dark:hover:bg-white/10
                    text-gray-700 dark:text-gray-200
                    border border-white/10 rounded-lg
                    transition-colors duration-200"
                >
                  {isEnhancing ? (
                    <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                  )}
                  <span>{isEnhancing ? "Enhancing..." : "Enhance"}</span>
                </Button>
              </div>

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
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>{isLoading ? "Generating..." : "Generate"}</span>
                </div>
              </Button>
            </div>
          </div>
        </motion.div>
      </form>
    </div>
  );
}
