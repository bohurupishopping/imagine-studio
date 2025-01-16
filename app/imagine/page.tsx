'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import ImageInputSection from '@/components/imagine/ImageInputSection';
import ImageOptionsMenu from '@/components/imagine/ImageOptionsMenu';
import ImagePreview from '@/components/imagine/ImagePreview';
import { imagineService } from '@/services/imagineService';
import { Sparkles, Wand2, Image as ImageIcon } from 'lucide-react';

export default function GeneratePage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState('');

  const handleGenerate = async (prompt: string) => {
    if (!prompt.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a prompt',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await imagineService.generateImage({
        prompt,
        size: '1024x1024',
      });

      if (response.success && response.data[0]?.url) {
        setGeneratedImage(response.data[0].url);
        setGeneratedPrompt(prompt);
        toast({
          title: 'Success',
          description: 'Image generated successfully!',
        });
      } else {
        throw new Error(response.error || 'Failed to generate image');
      }
    } catch (error) {
      console.error('Error generating image:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate image',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStyleChange = (style: string) => {
    console.log('Selected style:', style);
  };

  const handleQualityChange = (quality: string) => {
    console.log('Selected quality:', quality);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-white via-purple-50 to-blue-50 px-1 sm:px-2 pb-2 lg:px-1 lg:pb-1">
      <div className="max-w-7xl mx-auto h-full flex flex-col">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 flex-1 overflow-hidden">
          {/* Input Section */}
          <motion.div 
            className="lg:col-span-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border border-gray-100 bg-white h-full flex flex-col hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="space-y-3 p-2 sm:p-3 pb-1 sm:pb-2 lg:p-2 lg:pb-1">
                <div className="flex items-center gap-3">
                  <motion.div
                    className="p-2 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg hover:scale-105 transition-transform"
                    whileHover={{ rotate: 10 }}
                  >
                    <Wand2 className="w-7 h-7 text-purple-600 hover:text-purple-700 transition-colors" />
                  </motion.div>
                  <div>
                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                      Create
                    </CardTitle>
                    <p className="text-gray-600 text-sm leading-tight">
                      Describe your imagination in detail
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 p-3 sm:p-4 pt-0 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-200 scrollbar-track-transparent lg:p-3">
                <ImageInputSection
                  onGenerate={handleGenerate}
                  isLoading={isLoading}
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* Preview Section */}
          <motion.div 
            className="lg:col-span-8"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border border-gray-100 bg-white h-full flex flex-col hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="space-y-3 p-3 sm:p-4 pb-2 sm:pb-4 lg:p-3 lg:pb-2">
                <div className="flex items-center gap-3">
                  <motion.div
                    className="p-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg hover:scale-105 transition-transform"
                    whileHover={{ rotate: 10 }}
                  >
                    <ImageIcon className="w-7 h-7 text-blue-600 hover:text-blue-700 transition-colors" />
                  </motion.div>
                  <div>
                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Preview
                    </CardTitle>
                    <p className="text-gray-600 text-sm leading-tight">
                      Your generated masterpiece
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 p-3 sm:p-4 pt-0 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-transparent lg:p-3">
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="h-full"
                >
                  <ImagePreview
                    src={generatedImage || ''}
                    alt="Generated image preview"
                    prompt={generatedPrompt}
                    onClose={() => setGeneratedImage(null)}
                  />
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Loading Overlay */}
        {isLoading && (
          <motion.div 
            className="fixed inset-0 bg-white/95 backdrop-blur-lg flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex flex-col items-center gap-4 bg-gradient-to-br from-white to-purple-50 p-8 rounded-2xl border border-purple-100 shadow-2xl">
              <motion.div
                className="animate-spin rounded-full h-14 w-14 border-4 border-purple-600 border-t-transparent"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              />
              <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Crafting your vision...
              </p>
              <p className="text-gray-600 text-sm mt-1">
                This usually takes 10-20 seconds
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
