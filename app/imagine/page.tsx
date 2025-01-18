'use client';

import { useState, useEffect } from 'react';
import { handleError, handleSupabaseError } from '@/utils/errorHandler';
import { useLoading } from '@/hooks/useLoading';

interface GeneratedImage {
  url: string;
  prompt: string;
  timestamp: number;
  saved?: boolean;
}

interface SelectedImage {
  url: string;
  prompt: string;
  filePath: string;
}

interface ImageGenerationResponse {
  success: boolean;
  data: Array<{
    url: string;
  }>;
  error?: string;
}
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
  const { isLoading, withLoading } = useLoading();
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [showTextPopup, setShowTextPopup] = useState(false);
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(null);

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

    await withLoading(async () => {
      const response: ImageGenerationResponse = await imagineService.generateImage({
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
    }, (error) => handleError(error, toast));
  };

  const handleSaveImage = async (imageUrl: string) => {
    await withLoading(async () => {
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
    }, (error) => handleSupabaseError(error, toast));
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] relative bg-gradient-to-br from-gray-100 via-purple-50 to-blue-100">
      <div className="max-w-7xl mx-auto flex flex-col min-h-[calc(100dvh-4rem)] relative z-10 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="py-6 md:py-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-800">
            AI Image Generator
          </h1>
          <p className="mt-2 text-center text-gray-600">
            Create stunning images with the power of AI
          </p>
        </motion.div>

        {/* Input Section */}
        <motion.div
          className="mb-6 md:mb-8 w-full md:max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-none shadow-xl rounded-2xl bg-white/90 backdrop-blur-md">
            <CardContent className="p-4">
              <ImageInputSection
                onGenerate={handleGenerate}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Preview Area */}
        <div className="flex-1 mb-6 md:mb-8">
          <motion.div
            className="w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {generatedImages.length > 0 ? (
              <div className="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-4 pb-24">
                {generatedImages.map((image, index) => (
                  <motion.div
                    key={index}
                    className="relative group rounded-xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl bg-white/80 backdrop-blur-md border border-white/40 aspect-square"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
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
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent rounded-b-xl">
                      <button
                        className={`w-full text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300 shadow-md ${
                          image.saved 
                            ? 'bg-green-600 hover:bg-green-700' 
                            : 'bg-blue-600 hover:bg-blue-700'
                        }`}
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
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[40vh] bg-white/50 backdrop-blur-sm rounded-xl p-6">
                <motion.div 
                  className="text-center text-gray-500"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <ImageIcon className="w-12 h-12 mx-auto mb-3 text-gray-400/50" />
                  <p className="text-base font-medium">
                    Start creating! Enter a prompt above.
                  </p>
                </motion.div>
              </div>
            )}
          </motion.div>
        </div>

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
                
                // Navigate to order page after successful save
                router.push('/order');
              } catch (error) {
                handleSupabaseError(error, toast);
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
