'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import ImageInputSection from '@/components/imagine/ImageInputSection';
import ImagePreview from '@/components/imagine/ImagePreview';
import { imagineService } from '@/services/imagineService';
import { Wand2, Image as ImageIcon } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';

export default function GeneratePage() {
  const { toast } = useToast();
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [isLoading, setIsLoading] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<Array<{
    url: string;
    prompt: string;
    timestamp: number;
    saved?: boolean;
  }>>([]);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/');
      }
    };
    checkSession();
  }, [supabase, router]);

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
        const newImage = {
          url: response.data[0].url,
          prompt,
          timestamp: Date.now()
        };
        setGeneratedImages(prev => [newImage, ...prev]);
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

  const handleSaveImage = async (imageUrl: string) => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No active session');
      }

      // Validate image URL
      if (!imageUrl || !imageUrl.startsWith('https://')) {
        throw new Error('Invalid image URL');
      }

      // Get the existing image URL from generated images
      const existingImage = generatedImages.find(img => img.url === imageUrl);
      if (!existingImage) {
        throw new Error('Image not found in generated images');
      }

      // Use the existing image URL from the generated image
      const publicUrl = existingImage.url;
      const filePath = publicUrl.split('/storage/v1/object/public/t-shirt-designs/')[1];

      // Save metadata to Supabase database
      const { error: dbError } = await supabase
        .from('designs')
        .insert({
          user_id: session.user.id,
          image_url: filePath,
          public_url: publicUrl,
          prompt: existingImage.prompt,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select();

      if (dbError) throw dbError;

      // Update local state to mark image as saved
      setGeneratedImages(prev => prev.map(img => 
        img.url === imageUrl ? { ...img, saved: true } : img
      ));

      // Navigate to Text Customization Page
      router.push(`/imagine/customize?image=${encodeURIComponent(filePath)}`);
    } catch (error) {
      console.error('Error saving image:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save image',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 p-4">
                    {generatedImages.map((image, index) => (
                      <div 
                        key={index}
                        className="relative group rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]"
                      >
                        <div className="border-b border-gray-100 pb-4">
                          <div 
                            className="cursor-pointer"
                            onClick={() => setFullscreenImage(image.url)}
                          >
                            <ImagePreview
                              src={image.url}
                              alt={`Generated image ${index + 1}`}
                              prompt={image.prompt}
                              onClose={() => setGeneratedImages(prev => 
                                prev.filter(img => img.url !== image.url)
                              )}
                            />
                          </div>
                          <div className="px-4 pt-4">
                            <button
                              onClick={() => handleSaveImage(image.url)}
                              className={`w-full ${
                                image.saved 
                                  ? 'bg-green-600 cursor-not-allowed' 
                                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                              } text-white px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]`}
                              disabled={image.saved}
                            >
                              {image.saved ? 'Saved ✓' : 'Save & Continue →'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Fullscreen Image Modal */}
        {fullscreenImage && (
          <motion.div 
            className="fixed inset-0 bg-black/90 backdrop-blur-lg z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setFullscreenImage(null)}
          >
            <div className="relative max-w-full max-h-full">
              <img
                src={fullscreenImage}
                alt="Fullscreen preview"
                className="max-w-full max-h-[90vh] rounded-lg"
              />
              <button
                onClick={() => setFullscreenImage(null)}
                className="absolute -top-10 right-0 text-white hover:text-gray-200 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </motion.div>
        )}

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
