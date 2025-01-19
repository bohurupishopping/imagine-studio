import { motion } from 'framer-motion';
import { Paintbrush, Palette, Mountain, Camera, Sparkles, Lightbulb, Image, Wand2, Type, PenTool, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SuggestionProps {
  icon: React.ElementType;
  title: string;
  description: string;
  onClick: () => void;
}

const Suggestion = ({ icon: Icon, title, description, onClick }: SuggestionProps) => (
  <motion.div
    className={cn(
      "group cursor-pointer",
      "p-1.5 sm:p-3",
      "border border-gray-200 dark:border-gray-700/50",
      "rounded-lg",
      "bg-white/50 dark:bg-gray-800/50",
      "hover:bg-white dark:hover:bg-gray-800",
      "transition-all duration-200",
      "hover:shadow-md hover:scale-[1.01]",
      "active:scale-[0.98]"
    )}
    onClick={onClick}
    whileHover={{ y: -2 }}
    whileTap={{ scale: 0.98 }}
  >
    <div className="flex items-start gap-3">
      <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
        <Icon className="w-4 h-4 text-blue-500" />
      </div>
      <div className="flex-1">
        <h3 className="font-medium text-sm text-gray-900 dark:text-gray-100 mb-1">
          {title}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  </motion.div>
);

interface WelcomeSectionProps {
  onSuggestionClick: (prompt: string) => void;
  visible: boolean;
}

export const WelcomeSection = ({
  onSuggestionClick,
  visible
}: WelcomeSectionProps) => {
  const suggestions = [
    {
      icon: Paintbrush,
      title: "Minimalist Design",
      description: "Clean and simple t-shirt graphics",
      prompt: "minimalist design, clean lines, simple shapes, monochromatic color scheme, negative space, modern aesthetic, geometric patterns, flat design, vector art, white background, isolated elements, print-ready, scalable graphics, professional t-shirt design, commercial use, no background, high resolution, 300dpi, CMYK color mode, ready for screen printing"
    },
    {
      icon: Sparkles,
      title: "Vintage Style",
      description: "Retro-inspired t-shirt designs",
      prompt: "vintage t-shirt design, retro style, distressed textures, faded colors, classic typography, old school aesthetic, weathered look, hand-drawn elements, screen print effect, white background, isolated elements, print-ready, scalable graphics, professional t-shirt design, commercial use, no background, high resolution, 300dpi, CMYK color mode, ready for screen printing"
    },
    {
      icon: Type,
      title: "Typography Art",
      description: "Creative text-based designs",
      prompt: "typographic design, bold fonts, creative text arrangement, modern typography, clean layout, white background, isolated elements, print-ready, scalable graphics, professional t-shirt design, commercial use, no background, high resolution, 300dpi, CMYK color mode, ready for screen printing"
    },
    {
      icon: PenTool,
      title: "Illustrative Design",
      description: "Hand-drawn style illustrations",
      prompt: "illustrative design, hand-drawn elements, detailed line work, creative composition, artistic style, white background, isolated elements, print-ready, scalable graphics, professional t-shirt design, commercial use, no background, high resolution, 300dpi, CMYK color mode, ready for screen printing"
    },
    {
      icon: Palette,
      title: "Graphic Patterns",
      description: "Bold and colorful graphics",
      prompt: "graphic design, bold colors, geometric shapes, modern patterns, abstract composition, white background, isolated elements, print-ready, scalable graphics, professional t-shirt design, commercial use, no background, high resolution, 300dpi, CMYK color mode, ready for screen printing"
    },
    {
      icon: Pencil,
      title: "Hand-Drawn Art",
      description: "Sketch-style t-shirt designs",
      prompt: "hand-drawn design, sketch style, organic shapes, artistic imperfections, creative illustration, white background, isolated elements, print-ready, scalable graphics, professional t-shirt design, commercial use, no background, high resolution, 300dpi, CMYK color mode, ready for screen printing"
    }
  ];

  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-2xl mx-auto px-4 py-8 space-y-6"
    >
      <div className="text-center space-y-2">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="w-16 h-16 mx-auto bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center"
        >
          <Image className="w-8 h-8 text-blue-500" />
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-bold text-gray-900 dark:text-gray-100"
        >
          Let's Create! 🎨
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-gray-500 dark:text-gray-400 text-sm"
        >
          Start with one of these ideas or create your own
        </motion.p>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2"
      >
        {suggestions.map((suggestion, index) => (
          <Suggestion
            key={index}
            icon={suggestion.icon}
            title={suggestion.title}
            description={suggestion.description}
            onClick={() => onSuggestionClick(suggestion.prompt)}
          />
        ))}
      </motion.div>
    </motion.div>
  );
};
