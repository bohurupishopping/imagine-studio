'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import ImageInputSection from '@/components/imagine/ImageInputSection';
import ImageOptionsMenu from '@/components/imagine/ImageOptionsMenu';
import ImagePreview from '@/components/imagine/ImagePreview';
import { imagineService } from '@/services/imagineService';

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
    <div className="space-y-6 p-0">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Generate Images</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Input Section */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Create Your Image</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <ImageInputSection
              onGenerate={handleGenerate}
              isLoading={isLoading}
            />
            <ImageOptionsMenu
              onStyleChange={handleStyleChange}
            />
          </CardContent>
        </Card>

        {/* Preview Section */}
        <Card>
          <CardHeader>
            <CardTitle>Image Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <ImagePreview
              src={generatedImage || ''}
              alt="Generated image preview"
              prompt={generatedPrompt}
              onClose={() => setGeneratedImage(null)}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
