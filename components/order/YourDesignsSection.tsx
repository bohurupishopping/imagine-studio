"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Sparkles, Pencil } from "lucide-react";
import { TextCustomizationPopup } from "@/components/imagine/TextCustomizationPopup";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { WooCommerceOrder } from "@/types/woocommerce";

export type Design = {
  id: string;
  user_id: string;
  public_url: string;
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
};

type YourDesignsSectionProps = {
  orderDetails: WooCommerceOrder | null;
  onPlaceOrder: (design: Design) => Promise<void>;
  onPreviewImage: (url: string) => void;
};

export function YourDesignsSection({ orderDetails, onPlaceOrder, onPreviewImage }: YourDesignsSectionProps) {
  const { toast } = useToast();
  const supabase = createClientComponentClient();
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDesign, setEditDesign] = useState<Design | null>(null);
  const [isEditPopupOpen, setIsEditPopupOpen] = useState(false);

  const handleEditDesign = (design: Design) => {
    setEditDesign(design);
    setIsEditPopupOpen(true);
  };

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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("designs")
        .select("*")
        .eq("user_id", user.id);

      if (!error && data) {
        setDesigns(data);
        if (data.length === 0) {
          toast({
            title: "No designs found",
            description: "Create your first design to get started",
            variant: "default",
          });
        }
      } else if (error) {
        toast({
          title: "Error loading designs",
          description: error.message,
          variant: "destructive",
        });
      }
      setLoading(false);
    };

    fetchDesigns();
  }, [supabase, toast]);

  const handleDeleteDesign = async (designId: string) => {
    if (confirm('Are you sure you want to delete this design?')) {
      const { error } = await supabase
        .from('designs')
        .delete()
        .eq('id', designId);
      
      if (!error) {
        setDesigns(prev => prev.filter(d => d.id !== designId));
        toast({
          title: "Design deleted",
          description: "Your design has been successfully deleted",
          variant: "default",
        });
      } else {
        toast({
          title: "Error deleting design",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  };

  if (loading) {
    return (
    <div className="bg-white rounded-lg p-6 sm:p-8">
      <div className="flex items-center justify-center">
        <div className="animate-pulse space-y-4 w-full max-w-sm">
          <div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
    );
  }

  if (designs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 p-8">
        <div className="text-center space-y-2">
          <Sparkles className="w-8 h-8 text-purple-500 mx-auto" />
          <h3 className="text-lg font-semibold text-gray-800">No Designs Found</h3>
          <p className="text-sm text-gray-500">Create your first design to get started</p>
        </div>
        <Button 
          variant="outline" 
          className="border-purple-500 text-purple-500 hover:bg-purple-50"
          onClick={() => window.location.href = "/imagine"}
        >
          Create Design 
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-lg border border-gray-100/80 shadow-sm">
        <Table className="min-w-full text-sm bg-white/60 backdrop-blur-sm">
          <TableHeader className="bg-gray-50/80">
            <TableRow>
              <TableHead className="p-3 font-medium text-gray-700">Image</TableHead>
              <TableHead className="p-3 font-medium text-gray-700">Customizations</TableHead>
              <TableHead className="p-3 w-32 font-medium text-gray-700">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {designs.map((design) => (
              <TableRow key={design.id} className="hover:bg-gray-50 transition-colors">
                <TableCell className="p-1.5 sm:p-2">
                  <button 
                    onClick={() => onPreviewImage(design.public_url)}
                    className="hover:opacity-80 transition-opacity"
                    aria-label="Preview design"
                  >
                    <img 
                      src={design.public_url} 
                      alt="Design" 
                      className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded border shadow-sm"
                    />
                  </button>
                </TableCell>
                <TableCell className="p-2">
                  <div className="space-y-1 text-sm">
                    {design.text1 && (
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-700">{design.text1}</span>
                          <div className="w-3 h-3 rounded-full border shadow-sm" style={{ backgroundColor: design.color1 }} />
                        </div>
                        <div className="text-xs text-gray-500">
                          <span>{design.font1}</span> · <span>{design.size1}</span>
                        </div>
                      </div>
                    )}
                    {design.text2 && (
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-700">{design.text2}</span>
                          <div className="w-3 h-3 rounded-full border shadow-sm" style={{ backgroundColor: design.color2 }} />
                        </div>
                        <div className="text-xs text-gray-500">
                          <span>{design.font2}</span> · <span>{design.size2}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="p-2">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs px-2"
                      disabled={!orderDetails || !designs.length}
                      onClick={() => onPlaceOrder(design)}
                    >
                      Place Order
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs px-2 bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 border-blue-200"
                      onClick={() => handleEditDesign(design)}
                    >
                      <Pencil className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="h-7 text-xs px-2"
                      onClick={() => handleDeleteDesign(design.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit Popup */}
      {isEditPopupOpen && editDesign && (
        <TextCustomizationPopup
          imageUrl={editDesign.public_url}
          prompt=""
          filePath={editDesign.id}
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
