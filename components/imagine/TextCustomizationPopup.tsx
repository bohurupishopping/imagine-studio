'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { X, Sparkles, TextCursor, Type, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FONT_OPTIONS, useFontLoader } from '@/lib/fonts';

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
  initialData?: {
    text1: string;
    text2: string;
    font1: string;
    font2: string;
    color1: string;
    color2: string;
    size1: number;
    size2: number;
  };
}

const SIZE_OPTIONS = [
  { value: 20, label: 'Small' },
  { value: 40, label: 'Medium' },
  { value: 60, label: 'Large' },
  { value: 80, label: 'X-Large' }
];

const COLOR_OPTIONS = [
  { value: '#000000', label: 'Black' },
  { value: '#FFFFFF', label: 'White' },
  { value: '#FF0000', label: 'Red' },
  { value: '#0000FF', label: 'Blue' },
  { value: '#FFD700', label: 'Gold' },
  { value: '#4CAF50', label: 'Green' },
  { value: '#9C27B0', label: 'Purple' },
  { value: '#FF9800', label: 'Orange' }
];

export function TextCustomizationPopup({
  imageUrl,
  prompt,
  filePath,
  onClose,
  onSave,
  initialData
}: TextCustomizationPopupProps) {
  const { toast } = useToast();

  // Load fonts
  useEffect(() => {
    const { injectFontStyles } = useFontLoader();
    const style = injectFontStyles();

    // Cleanup on unmount
    return () => {
      if (style && document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);
  const [text1, setText1] = useState(initialData?.text1 ?? '');
  const [text2, setText2] = useState(initialData?.text2 ?? '');
  const [font1, setFont1] = useState(initialData?.font1 ?? FONT_OPTIONS[0].value);
  const [font2, setFont2] = useState(initialData?.font2 ?? FONT_OPTIONS[0].value);
  const [color1, setColor1] = useState(initialData?.color1 ?? '#000000');
  const [color2, setColor2] = useState(initialData?.color2 ?? '#000000');
  const [size1, setSize1] = useState([initialData?.size1 ?? 40]);
  const [size2, setSize2] = useState([initialData?.size2 ?? 40]);
  const [isSaving, setIsSaving] = useState(false);
  const [showText2, setShowText2] = useState(!!initialData?.text2);

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
          className="bg-white/90 backdrop-blur-md rounded-xl w-full max-w-3xl overflow-hidden shadow-2xl border border-white/40 flex flex-col h-[90vh] sm:h-auto"
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 sm:p-4 border-b bg-gradient-to-r from-purple-50/80 to-blue-50/80 backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <h2 className="text-lg sm:text-xl font-semibold bg-gradient-to-br from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Customize Your Design
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md hover:bg-white/50 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
            </button>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-auto p-3 sm:p-4 grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-3 sm:gap-4">
            {/* Preview Section */}
            <div className="space-y-4">
              <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg border border-white/60 p-3 sm:p-4">
                <h3 className="text-xs sm:text-sm font-medium mb-2 sm:mb-3 flex items-center gap-2 text-gray-700">
                  <TextCursor className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Text Preview
                </h3>
                <div className="space-y-2 sm:space-y-3">
                  <div
                    className="p-2 sm:p-3 bg-gray-50/80 rounded-lg border shadow-inner min-h-[50px] sm:min-h-[60px] flex items-center justify-center text-center"
                    style={previewStyles1}
                  >
                    {text1 || 'Text 1 Preview'}
                  </div>
                  <AnimatePresence>
                    {showText2 && (
                      <motion.div
                        className="p-2 sm:p-3 bg-gray-50/80 rounded-lg border shadow-inner min-h-[50px] sm:min-h-[60px] flex items-center justify-center text-center"
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

              <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg border border-white/60 p-3 sm:p-4">
                <h3 className="text-xs sm:text-sm font-medium mb-2 sm:mb-3 flex items-center gap-2 text-gray-700">
                  <ImageIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Image Preview
                </h3>
                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-50/80 rounded-lg overflow-hidden border shadow-inner mx-auto">
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
              <div className="space-y-1.5 sm:space-y-2">
                <Label className="text-xs sm:text-sm flex items-center gap-1.5 text-gray-700">
                  <Type className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Text 1
                </Label>
                <Input
                  value={text1}
                  onChange={(e) => setText1(e.target.value)}
                  placeholder="Enter first text..."
                  className="text-xs sm:text-sm h-8 sm:h-9"
                />
                <div className="grid grid-cols-3 gap-1 sm:gap-2">
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
                    <Select value={color1} onValueChange={setColor1}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue>
                          <div className="flex items-center gap-2">
                            <div
                              className="h-3 w-3 rounded-full border"
                              style={{ backgroundColor: color1 }}
                            />
                            <span>
                              {COLOR_OPTIONS.find(c => c.value === color1)?.label || 'Select color'}
                            </span>
                          </div>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {COLOR_OPTIONS.map(option => (
                          <SelectItem
                            key={option.value}
                            value={option.value}
                            className="text-xs"
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className="h-3 w-3 rounded-full border"
                                style={{ backgroundColor: option.value }}
                              />
                              {option.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                    className="space-y-1.5 sm:space-y-2"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <Label className="text-xs sm:text-sm flex items-center gap-1.5 text-gray-700">
                      <Type className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      Text 2
                    </Label>
                    <Input
                      value={text2}
                      onChange={(e) => setText2(e.target.value)}
                      placeholder="Enter second text..."
                      className="text-xs sm:text-sm h-8 sm:h-9"
                    />
                    <div className="grid grid-cols-3 gap-1 sm:gap-2">
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
                        <Select value={color2} onValueChange={setColor2}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue>
                              <div className="flex items-center gap-2">
                                <div
                                  className="h-3 w-3 rounded-full border"
                                  style={{ backgroundColor: color2 }}
                                />
                                <span>
                                  {COLOR_OPTIONS.find(c => c.value === color2)?.label || 'Select color'}
                                </span>
                              </div>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {COLOR_OPTIONS.map(option => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                                className="text-xs"
                              >
                                <div className="flex items-center gap-2">
                                  <div
                                    className="h-3 w-3 rounded-full border"
                                    style={{ backgroundColor: option.value }}
                                  />
                                  {option.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
