import { motion } from "framer-motion";
import { Trash2, Clock } from "lucide-react";

interface ActionButtonsProps {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  disabled?: boolean;
}

export function ActionButtons({ onSwipeLeft, onSwipeRight, disabled }: ActionButtonsProps) {
  return (
    <motion.div 
      className="flex justify-center space-x-8 mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <motion.button
        onClick={onSwipeLeft}
        disabled={disabled}
        className="w-16 h-16 bg-destructive text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        whileHover={{ scale: disabled ? 1 : 1.05 }}
        whileTap={{ scale: disabled ? 1 : 0.95 }}
      >
        <Trash2 className="w-6 h-6 mx-auto" />
      </motion.button>
      
      <motion.button
        onClick={onSwipeRight}
        disabled={disabled}
        className="w-20 h-20 bg-accent text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        whileHover={{ scale: disabled ? 1 : 1.05 }}
        whileTap={{ scale: disabled ? 1 : 0.95 }}
      >
        <Clock className="w-8 h-8 mx-auto" />
      </motion.button>
    </motion.div>
  );
}
