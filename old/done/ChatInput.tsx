import { useState, useRef, useCallback } from 'react';
import { Send, Paperclip, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { AttachmentPreview } from '@/components/ui/attachment-preview';
import { FileUpload } from '@/types/conversation';
import { cn } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';
import { ModelSelector } from './ModelSelector';

// Supported file types
const SUPPORTED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'text/javascript',
  'application/x-javascript',
  'application/x-python',
  'text/x-python',
  'text/plain',
  'text/html',
  'text/css',
  'text/md',
  'text/csv',
  'text/xml',
  'text/rtf'
];

interface ChatInputProps {
  onSubmit: (message: string, attachments?: FileUpload[]) => void;
  isLoading?: boolean;
  selectedModel?: string;
  onModelChange?: (model: string) => void;
  className?: string;
}

export const ChatInput = ({ 
  onSubmit, 
  isLoading, 
  selectedModel = 'groq',
  onModelChange = () => {},
  className 
}: ChatInputProps) => {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<FileUpload[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      const scrollHeight = Math.max(24, inputRef.current.scrollHeight);
      inputRef.current.style.height = `${Math.min(scrollHeight, 200)}px`;
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() && attachments.length === 0) return;
    
    // Check if any attachments are still uploading
    if (attachments.some(att => att.uploading)) {
      console.warn('Attachments are still uploading');
      return;
    }
    
    onSubmit(message, attachments);
    setMessage('');
    setAttachments([]);
  };

  const handleFileUpload = useCallback(async (files: FileList | File[]) => {
    setIsUploading(true);
    const newAttachments: FileUpload[] = [];

    try {
      for (const file of Array.from(files)) {
        if (!SUPPORTED_FILE_TYPES.includes(file.type)) {
          console.warn(`Unsupported file type: ${file.type}`);
          continue;
        }

        if (file.size > 20 * 1024 * 1024) { // 20MB limit
          console.warn('File too large');
          continue;
        }

        // Create preview for images
        let preview: string | undefined;
        if (file.type.startsWith('image/')) {
          preview = URL.createObjectURL(file);
        }

        const attachment: FileUpload = {
          id: uuidv4(),
          file,
          type: file.type.startsWith('image/') ? 'image' : 'document',
          preview,
          uploading: true
        };

        // Process file through vision API if it's a document
        if (attachment.type === 'document') {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('fileType', file.type);
          formData.append('model', 'gemini-1.5-flash');
          formData.append('prompt', 'Please analyze this document and provide insights.');
          formData.append('systemPrompt', 'You are a helpful AI assistant analyzing documents.');

          try {
            const response = await fetch('/api/vision', {
              method: 'POST',
              body: formData,
            });

            if (!response.ok) {
              throw new Error('Failed to process document');
            }

            const result = await response.json();
            attachment.uploading = false;
            attachment.url = result.url;
            attachment.path = result.path;
          } catch (error) {
            console.error('Error processing document:', error);
            attachment.uploading = false;
          }
        } else {
          attachment.uploading = false;
        }

        newAttachments.push(attachment);
      }

      setAttachments(prev => [...prev, ...newAttachments]);
    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, []);

  // Handle paste events
  const handlePaste = useCallback(async (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    const imageFiles: File[] = [];

    for (const item of Array.from(items)) {
      // Handle image files
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          imageFiles.push(file);
        }
      }
    }

    if (imageFiles.length > 0) {
      e.preventDefault(); // Prevent default paste only if we found images
      await handleFileUpload(imageFiles);
    }
  }, [handleFileUpload]);

  const handleRemoveAttachment = useCallback((id: string) => {
    setAttachments(prev => {
      const updated = prev.filter(att => att.id !== id);
      // Clean up previews
      prev.forEach(att => {
        if (att.id === id && att.preview) {
          URL.revokeObjectURL(att.preview);
        }
      });
      return updated;
    });
  }, []);

  return (
    <motion.div 
      className="relative w-full max-w-4xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {/* Attachment Preview */}
      {attachments.length > 0 && (
        <AttachmentPreview
          attachments={attachments}
          onRemove={handleRemoveAttachment}
        />
      )}

      {/* Main Input Form */}
      <motion.form
        onSubmit={handleSubmit}
        className={cn(
          "relative flex items-center gap-2",
          "rounded-[24px]",
          "p-1.5 pr-2",
          "transition-all duration-300 ease-in-out",
          "backdrop-blur-sm",
          isFocused ? [
            "bg-white/90 dark:bg-gray-800/90",
            "border border-blue-200 dark:border-blue-800/50",
            "shadow-[0_0_0_1px_rgba(59,130,246,0.1)]",
            "dark:shadow-[0_0_0_1px_rgba(59,130,246,0.05)]"
          ] : [
            "bg-gray-50/80 dark:bg-gray-800/80",
            "border border-gray-100 dark:border-gray-700/50"
          ]
        )}
      >
        {/* Action Buttons */}
        <motion.div 
          className="flex items-center gap-1.5 pl-2"
          initial={false}
          animate={isFocused ? { opacity: 1 } : { opacity: 0.8 }}
        >
          <ModelSelector
            onModelChange={onModelChange}
            selectedModel={selectedModel}
            compact
            isChatMode
          />
          <div className="w-[1px] h-5 bg-gray-200 dark:bg-gray-700 mx-0.5" />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8 rounded-full",
              "text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300",
              "hover:bg-gray-100/50 dark:hover:bg-gray-700/50",
              "transition-colors duration-200",
              attachments.length > 0 && "text-blue-500 hover:text-blue-600"
            )}
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading || isUploading}
          >
            {isUploading ? (
              <Loader2 className="w-[18px] h-[18px] animate-spin" />
            ) : (
              <Paperclip className="w-[18px] h-[18px]" />
            )}
          </Button>
        </motion.div>

        {/* Text Input */}
        <div className="flex-1 relative">
          <Textarea
            ref={inputRef}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              adjustHeight();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            onPaste={handlePaste}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={attachments.length > 0 ? "Add a message about your attachments..." : "Type your message..."}
            className={cn(
              "w-full min-h-[40px] max-h-[200px] py-2 px-1",
              "bg-transparent",
              "border-0 outline-0 focus:outline-0 ring-0 focus:ring-0 focus:ring-offset-0",
              "resize-none",
              "text-gray-700 dark:text-gray-200",
              "placeholder:text-gray-400 dark:placeholder:text-gray-500",
              "transition-colors duration-200",
              "text-[15px] leading-tight",
              "[&::-webkit-scrollbar]:hidden",
              "[-ms-overflow-style:none]",
              "[scrollbar-width:none]"
            )}
            style={{ 
              height: '40px',
              boxShadow: 'none',
              outline: 'none'
            }}
          />
        </div>

        {/* Send Button */}
        <motion.div 
          initial={false}
          animate={isFocused ? { scale: 1, opacity: 1 } : { scale: 1, opacity: 0.9 }}
        >
          <Button 
            type="submit"
            disabled={(!message.trim() && attachments.length === 0) || isLoading || attachments.some(a => a.uploading)}
            className={cn(
              "h-8 w-8",
              "bg-blue-500 hover:bg-blue-600",
              "text-white",
              "rounded-full",
              "disabled:opacity-40 disabled:cursor-not-allowed",
              "transition-colors duration-200",
              "flex items-center justify-center",
              "group",
              "shadow-none focus:shadow-none"
            )}
          >
            <motion.div
              animate={isLoading ? { rotate: 360 } : { rotate: 0 }}
              transition={{ duration: 1, repeat: isLoading ? Infinity : 0, ease: "linear" }}
              className="flex items-center justify-center"
            >
              {isLoading ? (
                <Loader2 className="w-[18px] h-[18px] animate-spin" />
              ) : (
                <Send 
                  className="w-[18px] h-[18px] group-hover:translate-x-0.5 
                    transition-transform duration-200" 
                  strokeWidth={2.5}
                />
              )}
            </motion.div>
          </Button>
        </motion.div>
      </motion.form>

      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
        className="hidden"
        multiple
        accept={SUPPORTED_FILE_TYPES.join(',')}
      />
    </motion.div>
  );
}; 