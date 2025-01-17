'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { X, Sparkles } from 'lucide-react';
import { HexColorPicker } from 'react-colorful';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface TextCustomizationPopupProps {
  imageUrl: string;
  prompt: string;
  filePath: string;
  onClose: () => void;
  onSave: (data: {
    text1: string;
    text2: string;
    font1: string;
    font2: string;
    color1: string;
    color2: string;
    size1: number;
    size2: number;
  }) => Promise<void>;
}

export function TextCustomizationPopup({
  imageUrl,
  prompt,
  filePath,
  onClose,
  onSave
}: TextCustomizationPopupProps) {
  const { toast } = useToast();
  const [text1, setText1] = useState('');
  const [text2, setText2] = useState('');
  const [font1, setFont1] = useState('Noto Sans Bengali');
  const [font2, setFont2] = useState('Noto Sans Bengali');
  const [color1, setColor1] = useState('#000000');
  const [color2, setColor2] = useState('#000000');
  const [size1, setSize1] = useState([40]);
  const [size2, setSize2] = useState([40]);
  const [isSaving, setIsSaving] = useState(false);
  const [showText2, setShowText2] = useState(false);

  const handleSave = async () => {
    if (!text1.trim() && !text2.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter text in at least one field',
        variant: 'destructive',
      });
      return;
    }

    const customizationData = {
      text1: text1.trim(),
      text2: text2.trim(),
      font1,
      font2,
      color1,
      color2,
      size1: size1[0],
      size2: size2[0]
    };

    setIsSaving(true);
    try {
      await onSave(customizationData);
      toast({
        title: 'Success',
        description: 'Text customization saved!',
      });
      onClose();
    } catch (error) {
      console.error('Error saving text:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save text',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-xl w-full max-w-3xl overflow-hidden shadow-lg border"
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h2 className="text-xl font-semibold">Customize Your Design</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-gray-100"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-4">
            {/* Preview Section */}
            <div className="space-y-4">
              {/* Preview Section */}
              <div className="space-y-4">
                <div className="bg-white rounded-lg shadow-sm border p-4">
                  <h3 className="text-sm font-medium mb-3">Text Preview</h3>
                  <div className="space-y-3">
                    <div 
                      className="p-3 bg-gray-50 rounded-lg border shadow-inner min-h-[60px] flex items-center"
                      style={{
                        fontFamily: font1,
                        color: color1,
                        fontSize: `${size1[0]}px`
                      }}
                    >
                      {text1 || 'Text 1 Preview'}
                    </div>
                    {showText2 && (
                      <div 
                        className="p-3 bg-gray-50 rounded-lg border shadow-inner min-h-[60px] flex items-center"
                        style={{
                          fontFamily: font2,
                          color: color2,
                          fontSize: `${size2[0]}px`
                        }}
                      >
                        {text2 || 'Text 2 Preview'}
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border p-4">
                  <h3 className="text-sm font-medium mb-3">Image Preview</h3>
                  <div className="w-full aspect-square bg-gray-50 rounded-lg overflow-hidden border shadow-inner">
                    <img
                      src={imageUrl}
                      alt="Customization preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Customization Controls */}
            <div className="space-y-4">
              {/* Text 1 Section */}
              <div className="space-y-2">
                <Label className="text-sm">Text 1</Label>
                <Input
                  value={text1}
                  onChange={(e) => setText1(e.target.value)}
                  placeholder="Enter first text..."
                  className="text-sm"
                />
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Font</Label>
                    <Select value={font1} onValueChange={setFont1}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Font" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Noto Sans Bengali" className="text-xs">Noto Sans Bengali</SelectItem>
                        <SelectItem value="Hind Siliguri" className="text-xs">Hind Siliguri</SelectItem>
                        <SelectItem value="Kalpurush" className="text-xs">Kalpurush</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Color</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-full justify-start text-xs"
                        >
                          <div 
                            className="h-4 w-4 rounded-full mr-2 border"
                            style={{ backgroundColor: color1 }}
                          />
                          <span>Pick color</span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-fit p-2">
                        <HexColorPicker
                          color={color1}
                          onChange={setColor1}
                          className="w-40 h-40"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Size</Label>
                    <Select 
                      value={size1[0].toString()} 
                      onValueChange={(value) => setSize1([Number(value)])}
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="20" className="text-xs">Small</SelectItem>
                        <SelectItem value="40" className="text-xs">Medium</SelectItem>
                        <SelectItem value="60" className="text-xs">Large</SelectItem>
                        <SelectItem value="80" className="text-xs">X-Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Text 2 Section */}
              {showText2 && (
                <div className="space-y-2">
                  <Label className="text-sm">Text 2</Label>
                  <Input
                    value={text2}
                    onChange={(e) => setText2(e.target.value)}
                    placeholder="Enter second text..."
                    className="text-sm"
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Font</Label>
                      <Select value={font2} onValueChange={setFont2}>
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Select font" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Noto Sans Bengali" className="text-xs">Noto Sans Bengali</SelectItem>
                          <SelectItem value="Hind Siliguri" className="text-xs">Hind Siliguri</SelectItem>
                          <SelectItem value="Kalpurush" className="text-xs">Kalpurush</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Color</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-full justify-start text-xs"
                          >
                            <div 
                              className="h-4 w-4 rounded-full mr-2 border"
                              style={{ backgroundColor: color2 }}
                            />
                            <span>Pick color</span>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-fit p-2">
                          <HexColorPicker
                            color={color2}
                            onChange={setColor2}
                            className="w-40 h-40"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Size</Label>
                      <Select 
                        value={size2[0].toString()} 
                        onValueChange={(value) => setSize2([Number(value)])}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="20" className="text-xs">Small</SelectItem>
                          <SelectItem value="40" className="text-xs">Medium</SelectItem>
                          <SelectItem value="60" className="text-xs">Large</SelectItem>
                          <SelectItem value="80" className="text-xs">X-Large</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowText2(!showText2)}
                >
                  {showText2 ? 'Remove Text 2' : 'Add Text 2'}
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSave} disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
