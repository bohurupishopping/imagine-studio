'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
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
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ImageIcon, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';

interface Design {
  id: number;
  user_id: string;
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

export default function DesignsPage() {
  const supabase = createClientComponentClient();
  const [designs, setDesigns] = useState<Design[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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

  useEffect(() => {
    const fetchDesigns = async () => {
      try {
        const { data, error } = await supabase
          .from('designs')
          .select(`*`)
          .order('created_at', { ascending: false })
          .range(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage - 1
          );

        if (error) throw error;
        setDesigns(data || []);
      } catch (error) {
        console.error('Error fetching designs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDesigns();
  }, [currentPage, supabase]);

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] p-4">
        <div className="max-w-7xl mx-auto space-y-4">
          <div className="flex justify-between items-center">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-32" />
          </div>
          
          <Card className="p-4 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-20 w-20 rounded-lg" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-10 w-10 rounded-md" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4">
      <div className="max-w-7xl mx-auto space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg">
              <ImageIcon className="w-6 h-6 text-purple-600" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Designs Management
            </h1>
          </div>
          <Button asChild variant="outline" className="gap-2">
            <Link href="/wp-admin/wp-dashboard">
              <ChevronLeft className="w-4 h-4" />
              Dashboard
            </Link>
          </Button>
        </div>

        <Card className="p-4">
          <Table>
            <TableHeader className="hidden sm:table-header-group">
              <TableRow>
                <TableHead className="w-[100px]">Preview</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Design Details</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
                <TableHead className="w-[150px]">Created At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {designs.map((design) => (
                <TableRow 
                  key={design.id} 
                  className="grid grid-cols-[80px_1fr_1fr_100px_120px] sm:table-row gap-2 sm:gap-0 p-2 sm:p-0"
                >
                  <TableCell className="flex items-center gap-2">
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden">
                      <Image
                        src={design.public_url}
                        alt="Design preview"
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 64px, 80px"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium">
                      {design.user_id}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm space-x-2">
                      {design.text1 && <span>Text 1: {design.text1}</span>}
                      {design.text2 && <span>Text 2: {design.text2}</span>}
                      {design.font1 && <span>Font 1: {design.font1}</span>}
                      {design.font2 && <span>Font 2: {design.font2}</span>}
                      {design.color1 && <span>Color 1: {design.color1}</span>}
                      {design.color2 && <span>Color 2: {design.color2}</span>}
                      {design.size1 && <span>Size 1: {design.size1}px</span>}
                      {design.size2 && <span>Size 2: {design.size2}px</span>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full sm:w-auto bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="ml-2 sm:hidden">Delete</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the design.
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
                  </TableCell>
                  <TableCell className="text-sm">
                    {new Date(design.created_at).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex justify-between items-center p-4 border-t">
            <Button
              variant="ghost"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            <span className="text-sm text-gray-600">Page {currentPage}</span>
            <Button
              variant="ghost"
              onClick={() => setCurrentPage((prev) => prev + 1)}
              disabled={designs.length < itemsPerPage}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
