'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import ImageInputSection from '@/components/imagine/ImageInputSection';
import ImagePreview from '@/components/imagine/ImagePreview';
import { imagineService } from '@/services/imagineService';
import { Wand2, Image as ImageIcon, Sparkles } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { TextCustomizationPopup } from '@/components/imagine/TextCustomizationPopup';

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
  const [showTextPopup, setShowTextPopup] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    prompt: string;
    filePath: string;
  } | null>(null);

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

      if (!imageUrl || !imageUrl.startsWith('https://')) {
        throw new Error('Invalid image URL');
      }

      const existingImage = generatedImages.find(img => img.url === imageUrl);
      if (!existingImage) {
        throw new Error('Image not found in generated images');
      }

      const publicUrl = existingImage.url;
      const filePath = publicUrl.split('/storage/v1/object/public/t-shirt-designs/')[1];

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

      setGeneratedImages(prev => prev.map(img => 
        img.url === imageUrl ? { ...img, saved: true } : img
      ));

      setSelectedImage({
        url: publicUrl,
        prompt: existingImage.prompt,
        filePath
      });
      setShowTextPopup(true);
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
    <div className="min-h-[calc(100vh-4rem)] relative bg-gradient-to-b from-white via-purple-50/30 to-blue-50/30">
      <div className="max-w-7xl mx-auto flex flex-col min-h-[calc(100dvh-4rem)] relative z-10">
        {/* Main Preview Area */}
        <div className="flex-1 p-2 sm:p-4 overflow-auto">
          <motion.div
            className="w-full max-w-6xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {generatedImages.length > 0 ? (
              <Card className="border-none bg-white/80 backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden">
                <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-purple-50 to-blue-50 p-4">
                  <CardTitle className="text-lg font-medium text-gray-700 flex items-center gap-2">
                    <Wand2 className="w-5 h-5 text-purple-500" />
                    Generated Designs
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 bg-white/40">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {generatedImages.map((image, index) => (
                      <motion.div
                        key={index}
                        className="relative group rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02] bg-white/50 backdrop-blur-sm border border-white/40"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div className="border-b border-gray-100/50 pb-4">
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
                              className={`w-full bg-gradient-to-r ${
                                image.saved 
                                  ? 'from-green-600 to-green-700 hover:from-green-700 hover:to-green-800' 
                                  : 'from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                              } text-white px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]`}
                              onClick={() => {
                                if (image.saved) {
                                  setSelectedImage({
                                    url: image.url,
                                    prompt: image.prompt,
                                    filePath: image.url.split('/storage/v1/object/public/t-shirt-designs/')[1]
                                  });
                                  setShowTextPopup(true);
                                } else {
                                  handleSaveImage(image.url);
                                }
                              }}
                            >
                              {image.saved ? 'Edit Design ✏️' : 'Save & Continue →'}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="flex items-center justify-center h-[50vh]">
                <motion.div 
                  className="text-center text-gray-500"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-400/50" />
                  <p className="text-lg font-medium">No images generated yet</p>
                  <p className="text-sm">Use the input below to create your first image</p>
                </motion.div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Input Section */}
        <motion.div
          className="w-full backdrop-blur-xl border-t border-gray-100 py-2 md:py-6 px-2 md:px-4 bg-gradient-to-b from-white/80 via-white to-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="w-full px-2 md:max-w-4xl mx-auto mt-4 md:mt-8">
            <Card className="w-full border border-gray-100 shadow-lg rounded-xl md:rounded-2xl overflow-hidden">
              <CardHeader className="p-4 border-b border-gray-50 bg-gradient-to-r from-purple-50 to-blue-50">
                <CardTitle className="text-lg font-medium text-gray-700 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  Create New Design
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 bg-white">
                <ImageInputSection
                  onGenerate={handleGenerate}
                  isLoading={isLoading}
                />
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Fullscreen Image Modal */}
        {fullscreenImage && (
          <motion.div
            className="fixed inset-0 bg-black/95 backdrop-blur-xl z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setFullscreenImage(null)}
          >
            <motion.div
              className="relative max-w-full max-h-full"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            >
              <motion.img
                src={fullscreenImage}
                alt="Fullscreen preview"
                className="max-w-full max-h-[90vh] rounded-xl shadow-2xl border border-white/10"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              />
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  setFullscreenImage(null);
                }}
                className="absolute -top-12 right-0 p-2 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-all duration-300 transform hover:scale-110"
                whileHover={{ rotate: 90 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </motion.button>
            </motion.div>
          </motion.div>
        )}

        {/* Text Customization Popup */}
        {showTextPopup && selectedImage && (
          <TextCustomizationPopup
            imageUrl={selectedImage.url}
            prompt={selectedImage.prompt}
            filePath={selectedImage.filePath}
            onClose={() => setShowTextPopup(false)}
            onSave={async (customizationData) => {
              try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) throw new Error('No active session');

                const { error } = await supabase
                  .from('designs')
                  .update({ 
                    text1: customizationData.text1,
                    text2: customizationData.text2,
                    font1: customizationData.font1,
                    font2: customizationData.font2,
                    color1: customizationData.color1,
                    color2: customizationData.color2,
                    size1: customizationData.size1,
                    size2: customizationData.size2,
                    updated_at: new Date().toISOString()
                  })
                  .eq('image_url', selectedImage.filePath);

                if (error) throw error;
              } catch (error) {
                console.error('Error saving text customization:', error);
                throw error;
              }
            }}
          />
        )}

        {/* Loading Overlay */}
        {isLoading && (
          <motion.div
            className="fixed inset-0 bg-white/90 backdrop-blur-xl flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="flex flex-col items-center gap-5 bg-gradient-to-br from-white/80 to-purple-50/80 p-10 rounded-3xl border border-white/50 shadow-2xl backdrop-blur-md"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            >
              <motion.div
                className="relative"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              >
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 blur-md opacity-50 animate-pulse" />
                <div className="relative rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent" />
              </motion.div>
              <motion.p
                className="text-2xl font-bold bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Crafting your vision...
              </motion.p>
              <motion.p
                className="text-gray-600 text-sm mt-1 font-medium"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                This usually takes 10-20 seconds
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
