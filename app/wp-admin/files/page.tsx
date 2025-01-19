"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createClient } from "@/utils/supabase/client";
import { FileEdit, Trash2 } from "lucide-react";
import { formatBytes, formatDate } from "@/lib/utils";

type StorageFile = {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  metadata: Record<string, any>;
};

export default function FilesPage() {
  const [files, setFiles] = useState<StorageFile[]>([]);
  const supabase = createClient();

  useEffect(() => {
    fetchFiles();
  }, []);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch files with metadata
      const { data: files, error: listError } = await supabase
        .storage
        .from('t-shirt-designs')
        .list('', {
          limit: 100,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (listError) throw listError;

      // Get public URLs and additional metadata
      const filesWithMetadata = await Promise.all(
        files.map(async (file) => {
          const { data: urlData } = supabase
            .storage
            .from('t-shirt-designs')
            .getPublicUrl(file.name);

          return {
            ...file,
            metadata: {
              ...file.metadata,
              url: urlData?.publicUrl
            }
          };
        })
      );

      setFiles(filesWithMetadata as StorageFile[]);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch files');
      console.error('Error fetching files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file: File) => {
    try {
      const filePath = `${Date.now()}-${file.name}`;
      
      const { error } = await supabase
        .storage
        .from('t-shirt-designs')
        .upload(filePath, file);

      if (error) throw error;
      
      // Refresh files after upload
      await fetchFiles();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to upload file');
      console.error('Error uploading file:', error);
    }
  };

  const handleDelete = async (filePath: string) => {
    try {
      const { error } = await supabase
        .storage
        .from('t-shirt-designs')
        .remove([filePath]);

      if (error) throw error;
      
      // Refresh files after deletion
      await fetchFiles();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete file');
      console.error('Error deleting file:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Storage Files</h1>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {files.map((file) => (
            <TableRow key={file.id}>
              <TableCell>{file.name}</TableCell>
              <TableCell>{formatBytes(file.metadata.size)}</TableCell>
              <TableCell>{file.metadata.mimetype}</TableCell>
              <TableCell>{formatDate(file.created_at)}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm">
                    <FileEdit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDelete(file.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
