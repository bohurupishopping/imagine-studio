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
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 p-4 md:p-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-8"
      >
        {/* Header Section */}
        <motion.div 
          className="flex flex-col md:flex-row justify-between items-center gap-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-6 rounded-lg"
          whileHover={{ scale: 1.01 }}
        >
          <div className="flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-transparent bg-clip-text">
              AI Image Generator
            </h1>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Input Section */}
          <motion.div 
            className="lg:col-span-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-2 border-primary/20 backdrop-blur-sm bg-background/80">
              <CardHeader className="space-y-1">
                <div className="flex items-center gap-2">
                  <Wand2 className="w-5 h-5 text-primary" />
                  <CardTitle>Create Your Masterpiece</CardTitle>
                </div>
                <p className="text-muted-foreground text-sm">
                  Describe your imagination and let AI bring it to life
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                <ImageInputSection
                  onGenerate={handleGenerate}
                  isLoading={isLoading}
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* Preview Section */}
          <motion.div 
            className="lg:col-span-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="border-2 border-primary/20 backdrop-blur-sm bg-background/80 sticky top-4">
              <CardHeader className="space-y-1">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-primary" />
                  <CardTitle>Preview</CardTitle>
                </div>
                <p className="text-muted-foreground text-sm">
                  Your generated image will appear here
                </p>
              </CardHeader>
              <CardContent>
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="text-primary font-medium">Generating your image...</p>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
