'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { X, Sparkles, Palette, TextCursor, Type, Image as ImageIcon } from 'lucide-react';
import { HexColorPicker } from 'react-colorful';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

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

const FONT_OPTIONS = [
  { value: 'Noto Sans Bengali', label: 'Noto Sans' },
  { value: 'Hind Siliguri', label: 'Hind Siliguri' },
  { value: 'Kalpurush', label: 'Kalpurush' }
];

const SIZE_OPTIONS = [
  { value: 20, label: 'Small' },
  { value: 40, label: 'Medium' },
  { value: 60, label: 'Large' },
  { value: 80, label: 'X-Large' }
];

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
  const [font1, setFont1] = useState(FONT_OPTIONS[0].value);
  const [font2, setFont2] = useState(FONT_OPTIONS[0].value);
  const [color1, setColor1] = useState('#000000');
  const [color2, setColor2] = useState('#000000');
  const [size1, setSize1] = useState([40]);
  const [size2, setSize2] = useState([40]);
  const [isSaving, setIsSaving] = useState(false);
  const [showText2, setShowText2] = useState(false);

  const router = useRouter();

  const handleSave = useCallback(async () => {
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
      router.push('/order');
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
  }, [text1, text2, font1, font2, color1, color2, size1, size2, onSave, onClose, toast]);

  const previewStyles1 = useMemo(() => ({
    fontFamily: font1,
    color: color1,
    fontSize: `${size1[0]}px`
  }), [font1, color1, size1]);

  const previewStyles2 = useMemo(() => ({
    fontFamily: font2,
    color: color2,
    fontSize: `${size2[0]}px`
  }), [font2, color2, size2]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white rounded-xl w-full max-w-3xl overflow-hidden shadow-lg border flex flex-col h-[90vh] sm:h-auto"
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-purple-50 to-blue-50">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <h2 className="text-xl font-semibold">Customize Your Design</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-md hover:bg-gray-100 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-auto p-4 grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-4">
            {/* Preview Section */}
            <div className="space-y-4">
              <div className="bg-white rounded-lg shadow-sm border p-4">
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <TextCursor className="w-4 h-4" />
                  Text Preview
                </h3>
                <div className="space-y-3">
                  <div 
                    className="p-3 bg-gray-50 rounded-lg border shadow-inner min-h-[60px] flex items-center"
                    style={previewStyles1}
                  >
                    {text1 || 'Text 1 Preview'}
                  </div>
                  <AnimatePresence>
                    {showText2 && (
                      <motion.div
                        className="p-3 bg-gray-50 rounded-lg border shadow-inner min-h-[60px] flex items-center"
                        style={previewStyles2}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        {text2 || 'Text 2 Preview'}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border p-4">
                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Image Preview
                </h3>
                <div className="w-full aspect-square bg-gray-50 rounded-lg overflow-hidden border shadow-inner max-sm:w-42 max-sm:h-32">
                  <img
                    src={imageUrl}
                    alt="Customization preview"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>

            {/* Customization Controls */}
            <div className="space-y-4">
              {/* Text 1 Section */}
              <div className="space-y-2">
                <Label className="text-sm flex items-center gap-2">
                  <Type className="w-4 h-4" />
                  Text 1
                </Label>
                <Input
                  value={text1}
                  onChange={(e) => setText1(e.target.value)}
                  placeholder="Enter first text..."
                  className="text-sm"
                />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <Label className="text-xs">Font</Label>
                    <Select value={font1} onValueChange={setFont1}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Font" />
                      </SelectTrigger>
                      <SelectContent>
                        {FONT_OPTIONS.map(option => (
                          <SelectItem 
                            key={option.value} 
                            value={option.value}
                            className="text-xs"
                          >
                            {option.label}
                          </SelectItem>
                        ))}
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
                        {SIZE_OPTIONS.map(option => (
                          <SelectItem 
                            key={option.value} 
                            value={option.value.toString()}
                            className="text-xs"
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Text 2 Section */}
              <AnimatePresence>
                {showText2 && (
                  <motion.div
                    className="space-y-2"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <Label className="text-sm flex items-center gap-2">
                      <Type className="w-4 h-4" />
                      Text 2
                    </Label>
                    <Input
                      value={text2}
                      onChange={(e) => setText2(e.target.value)}
                      placeholder="Enter second text..."
                      className="text-sm"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="space-y-1">
                        <Label className="text-xs">Font</Label>
                        <Select value={font2} onValueChange={setFont2}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Select font" />
                          </SelectTrigger>
                          <SelectContent>
                            {FONT_OPTIONS.map(option => (
                              <SelectItem 
                                key={option.value} 
                                value={option.value}
                                className="text-xs"
                              >
                                {option.label}
                              </SelectItem>
                            ))}
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
                            {SIZE_OPTIONS.map(option => (
                              <SelectItem 
                                key={option.value} 
                                value={option.value.toString()}
                                className="text-xs"
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex justify-between pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowText2(!showText2)}
                  className="gap-2"
                >
                  {showText2 ? 'Remove Text 2' : 'Add Text 2'}
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={handleSave} 
                    disabled={isSaving}
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
