import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Clock } from "lucide-react";

interface SwipeOverlayProps {
  isVisible?: boolean;
  direction?: 'left' | 'right';
}

export function SwipeOverlay({ isVisible = false, direction }: SwipeOverlayProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 pointer-events-none z-40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            {direction === 'left' && (
              <motion.div
                className="absolute left-8 bg-destructive text-white px-6 py-3 rounded-lg shadow-lg"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="flex items-center space-x-2">
                  <Trash2 className="w-5 h-5" />
                  <span className="font-medium">Delete</span>
                </div>
              </motion.div>
            )}
            
            {direction === 'right' && (
              <motion.div
                className="absolute right-8 bg-accent text-white px-6 py-3 rounded-lg shadow-lg"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span className="font-medium">Later</span>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
