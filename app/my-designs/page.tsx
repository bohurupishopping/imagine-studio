'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import Image from 'next/image';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Trash2, Sparkles, X, Pencil } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { TextCustomizationPopup } from '@/components/imagine/TextCustomizationPopup';
import { VisuallyHidden } from '@/components/ui/visually-hidden';

interface Design {
  id: number;
  user_id: string;
  image_url: string;
  public_url: string;
  prompt: string;
  created_at: string;
  updated_at: string;
  text1?: string;
  text2?: string;
  font1?: string;
  font2?: string;
  color1?: string;
  color2?: string;
  size1?: number;
  size2?: number;
}

export default function MyDesignsPage() {
  const supabase = createClientComponentClient();
  const [designs, setDesigns] = useState<Design[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [editDesign, setEditDesign] = useState<Design | null>(null);
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);

  const handleSaveEdit = async (data: {
    text1: string;
    text2: string;
    font1: string;
    font2: string;
    color1: string;
    color2: string;
    size1: number;
    size2: number;
  }) => {
    if (!editDesign) return;

    const { error } = await supabase
      .from('designs')
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', editDesign.id);

    if (error) {
      toast({
        title: "Error updating design",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }

    setDesigns(prev =>
      prev.map(d =>
        d.id === editDesign.id
          ? { ...d, ...data, updated_at: new Date().toISOString() }
          : d
      )
    );
  };

  useEffect(() => {
    const fetchDesigns = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new Error('User not authenticated');
        }

        const { data, error } = await supabase
          .from('designs')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setDesigns(data || []);
      } catch (error) {
        console.error('Error fetching designs:', error);
        toast({
          title: "Error loading designs",
          description: "Failed to fetch your designs. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDesigns();
  }, [supabase]);

  const handleDelete = async (designId: number) => {
    try {
      const { error } = await supabase
        .from('designs')
        .delete()
        .eq('id', designId);

      if (error) {
        toast({
          title: "Error deleting design",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      setDesigns(prev => prev.filter(design => design.id !== designId));
      toast({
        title: "Design deleted",
        description: "The design has been successfully deleted",
        variant: "default",
      });

    } catch (error: any) {
      console.error('Error deleting design:', error);
      if (error?.message !== error?.code) {
        toast({
          title: "Error deleting design",
          description: error?.message || "An unknown error occurred",
          variant: "destructive",
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-white via-purple-50/50 to-blue-50/50 p-4 min-h-screen backdrop-blur-sm">
        <motion.div
          className="max-w-7xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="space-y-4">
            <motion.div
              className="py-4 md:py-6"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Skeleton className="h-10 w-48 mx-auto" />
              <Skeleton className="h-4 w-64 mt-2 mx-auto" />
            </motion.div>
            
            <Card className="p-4 space-y-4">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="flex items-center gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Skeleton className="h-20 w-20 rounded-lg" />
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-10 w-10 rounded-md" />
                  <Skeleton className="h-4 w-24" />
                </motion.div>
              ))}
            </Card>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-white via-purple-50/50 to-blue-50/50 p-4 md:pl-[78px] min-h-screen backdrop-blur-sm">
      <motion.div
        className="max-w-7xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="py-4 md:py-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-center bg-gradient-to-br from-purple-600 to-blue-600 bg-clip-text text-transparent">
            My Designs
          </h1>
          <p className="mt-2 text-center text-gray-600/90 text-sm md:text-base max-w-2xl mx-auto">
            View and manage all your created designs. Click on any design to preview it in full size.
          </p>
        </motion.div>

        <Card className="p-4">
          {designs.length > 0 ? (
            <motion.div 
              className="grid grid-cols-2 md:grid-cols-6 gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {designs.map((design) => (
                <motion.div
                  key={design.id}
                  className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                  whileHover={{ scale: 1.02 }}
                >
                  <div 
                    className="relative aspect-square cursor-pointer"
                    onClick={() => setPreviewImage(design.public_url)}
                  >
                    <Image
                      src={design.public_url}
                      alt="Design preview"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, 16.66vw"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm text-gray-600">
                          Created: {new Date(design.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:text-blue-700"
                          onClick={() => {
                            setEditDesign(design);
                            setIsEditPopupOpen(true);
                          }}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete your design.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(design.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No designs found</p>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Image Preview Dialog */}
      <Dialog open={!!previewImage} onOpenChange={(open) => !open && setPreviewImage(null)}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 overflow-hidden">
          <VisuallyHidden>
            <DialogTitle>Image Preview</DialogTitle>
          </VisuallyHidden>
          <div className="relative">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute right-2 top-2 p-2 rounded-full bg-white/90 hover:bg-gray-100 transition-colors z-10"
              aria-label="Close preview"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={previewImage || ''}
              alt="Design preview"
              className="w-full h-full object-contain max-h-[80vh]"
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Popup */}
      {isEditPopupOpen && editDesign && (
        <TextCustomizationPopup
          imageUrl={editDesign.public_url}
          prompt=""
          filePath={editDesign.id.toString()}
          onClose={() => {
            setIsEditPopupOpen(false);
            setEditDesign(null);
          }}
          onSave={handleSaveEdit}
          initialData={{
            text1: editDesign.text1 || "",
            text2: editDesign.text2 || "",
            font1: editDesign.font1 || "",
            font2: editDesign.font2 || "",
            color1: editDesign.color1 || "#000000",
            color2: editDesign.color2 || "#000000",
            size1: editDesign.size1 || 40,
            size2: editDesign.size2 || 40
          }}
        />
      )}
    </div>
  );
}
