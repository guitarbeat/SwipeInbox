import { useState, useCallback } from "react";
import { useGesture } from "@use-gesture/react";

interface UseSwipeOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
}

export function useSwipe({
  onSwipeLeft,
  onSwipeRight,
  threshold = 100,
}: UseSwipeOptions) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

  const bind = useGesture({
    onDrag: ({ down, movement: [mx], direction: [xDir], velocity: [vx], cancel }) => {
      setIsDragging(down);
      
      if (down) {
        setDragOffset(mx);
        
        // Show direction indicator earlier for better feedback
        if (Math.abs(mx) > 30) {
          setSwipeDirection(mx > 0 ? 'right' : 'left');
        } else {
          setSwipeDirection(null);
        }
        
        // Cancel drag if movement is too far to prevent weird behavior
        if (Math.abs(mx) > 300) {
          cancel();
        }
      } else {
        // Release
        setDragOffset(0);
        setSwipeDirection(null);
        
        // More sensitive swipe detection
        const isSignificantSwipe = Math.abs(mx) > threshold || Math.abs(vx) > 0.3;
        
        if (isSignificantSwipe) {
          if (mx > 0) {
            onSwipeRight?.();
          } else {
            onSwipeLeft?.();
          }
        }
      }
    },
    onDragEnd: () => {
      setIsDragging(false);
      setDragOffset(0);
      setSwipeDirection(null);
    },
  }, {
    drag: {
      filterTaps: true,
      axis: 'x', // Only allow horizontal dragging
      from: () => [0, 0], // Reset drag from current position
    }
  });

  return {
    isDragging,
    dragOffset,
    swipeDirection,
    bind,
  };
}
