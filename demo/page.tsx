"use client";

import { useState, Suspense, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ImageIcon, RefreshCw, Sparkles, Trash2 } from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import Sidebar from '@/components/shared/Sidebar';
import ImagePreview from '@/components/imagine/ImagePreview';
import { ImageHistoryService, type ImageSession } from '@/services/imageHistoryService';
import { useInView } from 'react-intersection-observer';
import { LazyMotion, domAnimation, m } from 'framer-motion';
import ImageInputSection from '@/components/imagine/ImageInputSection';
import Image from 'next/image';

// Optimize image variants for smoother performance
const imageVariants = {
  hidden: { 
    opacity: 0,
    scale: 0.98
  },
  visible: { 
    opacity: 1,
    scale: 1,
    transition: { 
      duration: 0.2,
      ease: "easeOut"
    }
  },
  exit: { 
    opacity: 0,
    scale: 0.98,
    transition: { 
      duration: 0.15,
      ease: "easeIn"
    }
  },
  hover: {
    y: -2,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  }
};

// Optimize loading variants
const loadingVariants = {
  initial: { opacity: 0, scale: 0.98 },
  animate: { 
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  },
  exit: { 
    opacity: 0,
    scale: 0.98,
    transition: {
      duration: 0.15,
      ease: "easeIn"
    }
  }
};

function ImagineContent() {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedModel, setSelectedModel] = useState('black-forest-labs/FLUX.1-schnell-Free');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [selectedSize, setSelectedSize] = useState('1024x1024');
  const { toast } = useToast();
  const imageHistoryServiceRef = useRef(ImageHistoryService.getInstance());
  const [historyImages, setHistoryImages] = useState<ImageSession[]>([]);
  const [selectedImagePrompt, setSelectedImagePrompt] = useState<string>('');
  const [visibleImages, setVisibleImages] = useState(6);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isPreloading, setIsPreloading] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState('(photorealistic:1.4), (hyperrealistic:1.3), masterpiece, professional photography, 8k resolution, highly detailed, sharp focus, HDR, high contrast, cinematic lighting, volumetric lighting, ambient occlusion, ray tracing, professional color grading, dramatic atmosphere, shot on Hasselblad H6D-400C, 100mm f/2.8 lens, golden hour photography, detailed textures, intricate details, pristine quality, award-winning photography');

  // Add scroll container ref
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Optimize scroll behavior
  const smoothScrollToTop = useCallback(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: 0,
        behavior: 'auto'
      });
    }
  }, []);

  // Optimize image loading with intersection observer
  const { ref: gridRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
    rootMargin: '100px'
  });

  // Optimize load more images function
  const loadMoreImages = useCallback(() => {
    setIsLoadingMore(true);
    setVisibleImages(prev => prev + 6);
    requestAnimationFrame(() => {
      setIsLoadingMore(false);
    });
  }, []);

  useEffect(() => {
    loadImageHistory();
    
    const handleHistoryUpdate = () => {
      loadImageHistory();
    };
    
    window.addEventListener('image-history-updated', handleHistoryUpdate);
    return () => {
      window.removeEventListener('image-history-updated', handleHistoryUpdate);
    };
  }, []);

  const loadImageHistory = async () => {
    try {
      const history = await imageHistoryServiceRef.current.getImageHistory();
      setHistoryImages(history);
    } catch (error) {
      console.error('Error loading image history:', error);
      toast({
        title: "Error",
        description: "Failed to load image history",
        variant: "destructive",
      });
    }
  };

  const handleEnhancePrompt = async () => {
    if (!prompt.trim() || isEnhancing) return;

    setIsEnhancing(true);
    try {
      const response = await fetch('/api/enhance-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt,
          styleType: selectedStyle,
          size: selectedSize
        }),
      });

      const data = await response.json();
      if (data.success && data.enhancedPrompt) {
        setPrompt(data.enhancedPrompt);
        toast({
          title: "Prompt Enhanced",
          description: "Your prompt has been enhanced for better results",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to enhance prompt",
        variant: "destructive",
      });
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setIsPreloading(true);
    
    // Start smooth scroll
    smoothScrollToTop();

    try {
      // Make API request immediately without delay
      const response = await fetch('/api/imagine', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: `${prompt}, ${selectedStyle}`,
          model: selectedModel,
          size: selectedSize,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate image');
      }

      if (data.success && data.data[0]?.url) {
        const imageUrl = data.data[0].url;
        
        // Preload image and update state simultaneously
        await Promise.all([
          new Promise<void>((resolve, reject) => {
            const img = document.createElement('img');
            img.onload = () => resolve();
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = imageUrl;
          }),
          imageHistoryServiceRef.current.saveImage(prompt, imageUrl)
        ]);

        // Update states after both image preload and save are complete
        setGeneratedImage(imageUrl);
        await loadImageHistory();
        
        // Ensure minimum 6 visible images
        setVisibleImages(prev => Math.max(prev, 6));
        
        toast({
          title: "Success",
          description: "Image generated successfully!",
        });
      } else {
        throw new Error('No image URL received');
      }
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate image",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsPreloading(false);
    }
  };

  const handleDeleteImage = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      toast({
        title: "Deleting...",
        description: "Please wait while we delete the image",
      });

      const imageToDelete = historyImages.find(img => img.id === id);
      
      await imageHistoryServiceRef.current.deleteImage(id);

      if (imageToDelete && selectedImage === imageToDelete.image_url) {
        setSelectedImage(null);
        setSelectedImagePrompt('');
      }

      toast({
        title: "Success",
        description: "Image deleted successfully",
      });

      await loadImageHistory();
    } catch (error) {
      console.error('Error deleting image:', error);
      toast({
        title: "Error",
        description: "Failed to delete image",
        variant: "destructive",
      });
    }
  };

  // Optimize image loading with virtualization
  const virtualizedImages = useCallback(() => {
    return historyImages.slice(0, visibleImages).map((imageSession, index) => {
      const isVisible = index < visibleImages;
      const isPriority = index < 4;
      
      return (
        <m.div
          key={`history-${imageSession.id}`}
          variants={imageVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          whileHover="hover"
          layout="position"
          layoutId={`image-${imageSession.id}`}
          className="relative aspect-square rounded-2xl overflow-hidden
            shadow-lg hover:shadow-xl 
            bg-white/50 backdrop-blur-sm border border-white/20
            cursor-pointer group transform-gpu will-change-transform"
          onClick={() => {
            setSelectedImage(imageSession.image_url);
            setSelectedImagePrompt(imageSession.prompt);
          }}
        >
          {isVisible && (
            <>
              <div className="absolute inset-0 bg-gray-100 animate-pulse" />
              <Image
                src={imageSession.image_url}
                alt={`Generated image ${index + 1}`}
                fill
                priority={isPriority}
                className="object-contain bg-black/50"
                sizes="(max-width: 768px) 45vw, (max-width: 1200px) 30vw, 23vw"
                loading={isPriority ? "eager" : "lazy"}
                quality={isPriority ? 85 : 70}
                onLoad={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                  const img = e.target as HTMLImageElement;
                  if (img.naturalWidth > img.naturalHeight) {
                    img.classList.remove('object-contain');
                    img.classList.add('object-cover');
                  }
                }}
              />
              
              <m.div 
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 
                  transition-opacity duration-200"
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="destructive"
                  size="icon"
                  className="h-8 w-8 rounded-full bg-red-500/80 hover:bg-red-600
                    shadow-lg backdrop-blur-sm"
                  onClick={(e: React.MouseEvent) => handleDeleteImage(imageSession.id, e)}
                >
                  <Trash2 className="h-4 w-4 text-white" />
                </Button>
              </m.div>
            </>
          )}
        </m.div>
      );
    });
  }, [historyImages, visibleImages, handleDeleteImage]);

  // Optimize scroll behavior with throttling
  const throttledLoadMore = useCallback(() => {
    if (!isLoadingMore) {
      requestAnimationFrame(() => {
        loadMoreImages();
      });
    }
  }, [isLoadingMore, loadMoreImages]);

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-gray-50">
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      <main className="flex-1 overflow-hidden">
        <div className="h-[100dvh] flex flex-col overflow-hidden w-full">
          <Card className="flex-1 bg-white border-none rounded-none
            relative flex flex-col overflow-hidden">
            
            <div
              ref={scrollContainerRef}
              className="flex-1 overflow-y-auto overflow-x-hidden p-2 relative z-10
                scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent"
            >
              <LazyMotion features={domAnimation} strict>
                <m.div 
                  ref={gridRef}
                  className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-7xl mx-auto"
                >
                  {isLoading && (
                    <m.div
                      variants={loadingVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      className="relative aspect-square rounded-2xl overflow-hidden
                        shadow-lg bg-white/50 backdrop-blur-sm border border-white/20
                        flex items-center justify-center col-span-1 row-start-1
                        transform-gpu"
                    >
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
                        <RefreshCw className="w-8 h-8 text-gray-400/80 animate-spin" />
                        <div className="mt-4 text-sm text-gray-500 text-center font-medium">
                          Creating your masterpiece...
                        </div>
                      </div>
                    </m.div>
                  )}
                  
                  <AnimatePresence mode="popLayout">
                    {virtualizedImages()}
                  </AnimatePresence>

                  {historyImages.length > visibleImages && inView && (
                    <m.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="col-span-full flex justify-center my-4"
                    >
                      <Button
                        variant="outline"
                        onClick={throttledLoadMore}
                        disabled={isLoadingMore}
                        className="bg-white/50 backdrop-blur-sm hover:bg-white/60
                          transform-gpu transition-all duration-200"
                      >
                        {isLoadingMore ? (
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        ) : null}
                        Load More Images
                      </Button>
                    </m.div>
                  )}
                </m.div>
              </LazyMotion>
            </div>

            <ImageInputSection
              prompt={prompt}
              onPromptChange={setPrompt}
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
              selectedSize={selectedSize}
              onSizeChange={setSelectedSize}
              selectedStyle={selectedStyle}
              onStyleChange={setSelectedStyle}
              isEnhancing={isEnhancing}
              isLoading={isLoading}
              onEnhance={handleEnhancePrompt}
              onSubmit={handleSubmit}
            />
          </Card>
        </div>
      </main>
      <AnimatePresence mode="wait">
        {selectedImage && (
          <ImagePreview
            src={selectedImage}
            alt="Generated image preview"
            prompt={selectedImagePrompt}
            onClose={() => {
              setSelectedImage(null);
              setSelectedImagePrompt('');
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ImaginePage() {
  return (
    <Suspense fallback={
      <div className="flex h-[100dvh] items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50/50 to-pink-50/50">
        <div className="animate-spin">
          <RefreshCw className="w-8 h-8 text-gray-400" />
        </div>
      </div>
    }>
      <ImagineContent />
    </Suspense>
  );
}
