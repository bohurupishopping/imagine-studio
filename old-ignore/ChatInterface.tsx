import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';

import { Search, Settings, MoreVertical, X, Trash2, BookOpen, RefreshCw, TrendingUp } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { ConversationService } from '@/services/conversationService';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAIGeneration } from './logic-ai-generation';
import { StoryCreationPopup } from './interface/StoryCreationPopup';
import { StoryRewriterPopup } from './interface/StoryRewriterPopup';
import { SEOOptimizerPopup } from './interface/SEOOptimizerPopup';
import { ChatInput } from './ChatInput';
import { MessageContainer } from './interface/MessageContainer';
import { WelcomeSection } from './interface/WelcomeSection';
import { v4 as uuidv4 } from 'uuid';

import { FileUpload, ExtendedMessage } from '@/types/conversation';

interface ChatInterfaceProps {
  defaultMessage?: string;
  sessionId?: string;
  onModelChange?: (model: string) => void;
}

const stripHtmlAndFormatText = (html: string): string => {
  if (!html.includes('<')) return html;

  const temp = document.createElement('div');
  temp.innerHTML = html;
  
  const processNode = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent || '';
    }
    
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;
      let text = Array.from(node.childNodes)
        .map(child => processNode(child))
        .join('');
      
      switch (element.tagName.toLowerCase()) {
        case 'h1': return `\n# ${text}\n`;
        case 'h2': return `\n## ${text}\n`;
        case 'h3': return `\n### ${text}\n`;
        case 'p': return `\n${text}\n`;
        case 'li': return `\n• ${text}`;
        case 'ul': return `\n${text}\n`;
        case 'ol': return `\n${text}\n`;
        case 'code': return `\`${text}\``;
        case 'pre': return `\n\`\`\`\n${text}\n\`\`\`\n`;
        case 'blockquote': return `\n> ${text}\n`;
        case 'br': return '\n';
        case 'div': return `\n${text}\n`;
        default: return text;
      }
    }
    return '';
  };
  
  let text = processNode(temp)
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^\n+|\n+$/g, '')
    .trim();
  
  return text;
};

function ChatInterface({ defaultMessage, sessionId, onModelChange }: ChatInterfaceProps) {
  const [conversationService] = useState(() => new ConversationService(sessionId));
  const { selectedModel, setSelectedModel, generateContent } = useAIGeneration({ 
    conversationService,
    defaultModel: 'groq'
  });
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ExtendedMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isStoryCreatorOpen, setIsStoryCreatorOpen] = useState(false);
  const [isStoryRewriterOpen, setIsStoryRewriterOpen] = useState(false);
  const [isSEOOptimizerOpen, setIsSEOOptimizerOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);

  // Load chat history
  useEffect(() => {
    const loadChatHistory = async () => {
      if (sessionId) {
        try {
          const history = await conversationService.loadChatSession(sessionId);
          if (history.length > 0) {
            setMessages(history);
          }
        } catch (error) {
          console.error('Error loading chat history:', error);
          toast({
            title: "Error",
            description: "Failed to load chat history",
            variant: "destructive",
          });
        }
      }
    };

    loadChatHistory();
  }, [sessionId, conversationService, toast]);

  // Optimized search filtering
  const filteredMessages = useMemo(() => 
    messages.filter(message => 
      message.content.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    [messages, searchQuery]
  );

  const toggleSearch = () => {
    setIsSearching(!isSearching);
    setSearchQuery('');
  };

  const copyToClipboard = async (text: string, index: number) => {
    try {
      const formattedText = stripHtmlAndFormatText(text);
      await navigator.clipboard.writeText(formattedText);
      setCopiedIndex(index);
      toast({
        title: "Copied",
        description: "Text copied to clipboard",
        duration: 2000,
      });
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
      toast({
        title: "Copy failed",
        description: "Please try selecting and copying manually",
        variant: "destructive",
      });
    }
  };

  const handleModelChange = (model: string) => {
    setSelectedModel(model);
    if (onModelChange) {
      onModelChange(model);
    }
  };

  const handleSubmit = async (content: string, attachments: FileUpload[] = []) => {
    if ((!content.trim() && attachments.length === 0) || isLoading) return;

    setShowWelcome(false);

    const currentAttachments = attachments
      .filter(att => att.url)
      .map(att => att.url as string);

    const fileType = attachments.length > 0 ? attachments[0].type : undefined;

    const userMessage: ExtendedMessage = {
      role: 'user',
      content,
      attachments: currentAttachments,
      fileType,
      id: uuidv4()
    };

    try {
      setMessages(prev => [...prev, userMessage]);
      setIsLoading(true);
      setIsTyping(true);

      const response = await generateContent(content, attachments);
      
      if (response && typeof response === 'object' && 'content' in response) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: response.content,
          fileType: response.fileType,
          id: uuidv4()
        }]);
      } else if (response) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: response as string,
          id: uuidv4()
        }]);
      }
    } catch (error) {
      console.error('Error generating response:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to generate response',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleSuggestionClick = (prompt: string) => {
    handleSubmit(prompt);
  };

  const handleClearChat = async () => {
    try {
      if (window.confirm('Are you sure you want to clear this chat?')) {
        setMessages([]);
        setShowWelcome(true);

        if (sessionId) {
          await conversationService.deleteChatSession(sessionId);
          toast({
            title: "Chat Cleared",
            description: "This chat session has been cleared successfully.",
            duration: 3000,
          });
        } else {
          toast({
            title: "Chat Cleared",
            description: "Messages have been cleared from this chat.",
            duration: 3000,
          });
        }

        window.dispatchEvent(new CustomEvent('chat-updated'));
      }
    } catch (error) {
      console.error('Error clearing chat:', error);
      toast({
        title: "Error",
        description: "Failed to clear chat. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="h-[100dvh] flex flex-col overflow-hidden
      px-0 sm:px-2 md:px-4 lg:px-6 py-0
      w-full">
      <Card className="flex-1 m-0
        bg-white/40 dark:bg-gray-900/40
        backdrop-blur-[12px]
        rounded-none sm:rounded-lg
        border border-white/20 dark:border-white/10
        shadow-sm
        relative flex flex-col overflow-hidden
        w-full
        h-[100dvh]
        transform-gpu">
        
        <div className="absolute inset-0 rounded-[2rem] sm:rounded-[2.5rem]
          bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 
          dark:from-blue-400/20 dark:via-purple-400/20 dark:to-pink-400/20
          opacity-50
          pointer-events-none">
        </div>

        <CardHeader
          className="border-b border-white/20 dark:border-white/10
            px-4 py-2
            flex flex-row justify-between items-center
            bg-white/40 dark:bg-gray-900/40 backdrop-blur-md
            relative z-10
            h-auto flex-shrink-0"
        >
          <div className="flex items-center space-x-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src="/assets/ai-icon.png" alt="AI Avatar" />
            </Avatar>
            <span className="font-medium text-sm">FeludaAI</span>
          </div>
          <div className="flex items-center space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 sm:h-10 sm:w-10 rounded-full hover:bg-red-50 group"
                    onClick={handleClearChat}
                  >
                    <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 group-hover:text-red-600 transition-colors" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Clear chat</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10 rounded-full" onClick={toggleSearch}>
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10 rounded-full" onClick={() => setIsStoryCreatorOpen(true)}>
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10 rounded-full" onClick={() => setIsStoryRewriterOpen(true)}>
              <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10 rounded-full" onClick={() => setIsSEOOptimizerOpen(true)}>
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10 rounded-full">
              <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-10 sm:w-10 rounded-full">
              <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col overflow-hidden p-0 
          h-[calc(100dvh-60px)] sm:h-[calc(94dvh-100px)]">
          
          {isSearching && (
            <div className="p-2 sm:p-3 border-b border-white/20 bg-white/40 backdrop-blur-[10px] flex-shrink-0">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  onClick={toggleSearch}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
          
          {showWelcome && messages.length === 0 ? (
            <WelcomeSection
              onSuggestionClick={handleSuggestionClick}
              onOpenSEOOptimizer={() => setIsSEOOptimizerOpen(true)}
              onOpenStoryRewriter={() => setIsStoryRewriterOpen(true)}
            />
          ) : (
            <MessageContainer 
              messages={messages}
              searchQuery={searchQuery}
              filteredMessages={filteredMessages}
              copiedIndex={copiedIndex}
              copyToClipboard={copyToClipboard}
              isLoading={isLoading}
              isTyping={isTyping}
            />
          )}

          <div className="border-t border-white/10 bg-white/5 p-2 sm:p-4">
            <ChatInput
              onSubmit={handleSubmit}
              isLoading={isLoading}
              selectedModel={selectedModel}
              onModelChange={handleModelChange}
            />
          </div>
        </CardContent>
      </Card>
      <>
        <StoryCreationPopup 
          isOpen={isStoryCreatorOpen}
          onClose={() => setIsStoryCreatorOpen(false)}
          onSubmit={async (prompt: string) => {
            try {
              setIsLoading(true);
              setIsTyping(true);
              const response = await generateContent(prompt);
              if (response) {
                setMessages(prev => [...prev, {
                  role: 'assistant',
                  content: response as string,
                  id: uuidv4()
                }]);
              }
            } catch (error) {
              console.error('Error generating story:', error);
              toast({
                title: "Error",
                description: error instanceof Error ? error.message : 'Failed to generate story',
                variant: "destructive",
              });
            } finally {
              setIsLoading(false);
              setIsTyping(false);
            }
          }}
        />
        <StoryRewriterPopup
          isOpen={isStoryRewriterOpen}
          onClose={() => setIsStoryRewriterOpen(false)}
          onSubmit={async (prompt: string) => {
            try {
              setIsLoading(true);
              setIsTyping(true);
              const response = await generateContent(prompt);
              if (response) {
                setMessages(prev => [...prev, {
                  role: 'assistant',
                  content: response as string,
                  id: uuidv4()
                }]);
              }
            } catch (error) {
              console.error('Error rewriting story:', error);
              toast({
                title: "Error",
                description: error instanceof Error ? error.message : 'Failed to rewrite story',
                variant: "destructive",
              });
            } finally {
              setIsLoading(false);
              setIsTyping(false);
            }
          }}
        />
        <SEOOptimizerPopup
          isOpen={isSEOOptimizerOpen}
          onClose={() => setIsSEOOptimizerOpen(false)}
          onSubmit={async (prompt: string) => {
            try {
              setIsLoading(true);
              setIsTyping(true);
              const response = await generateContent(prompt);
              if (response) {
                setMessages(prev => [...prev, {
                  role: 'assistant',
                  content: response as string,
                  id: uuidv4()
                }]);
              }
            } catch (error) {
              console.error('Error optimizing SEO:', error);
              toast({
                title: "Error",
                description: error instanceof Error ? error.message : 'Failed to optimize SEO',
                variant: "destructive",
              });
            } finally {
              setIsLoading(false);
              setIsTyping(false);
            }
          }}
        />
      </>
    </div>
  );
}

export default React.memo(ChatInterface);