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
    onDrag: ({ down, movement: [mx], direction: [xDir], velocity: [vx] }) => {
      setIsDragging(down);
      
      if (down) {
        setDragOffset(mx);
        
        // Show direction indicator
        if (Math.abs(mx) > 50) {
          setSwipeDirection(mx > 0 ? 'right' : 'left');
        } else {
          setSwipeDirection(null);
        }
      } else {
        // Release
        setDragOffset(0);
        setSwipeDirection(null);
        
        // Determine if swipe was significant enough
        const isSignificantSwipe = Math.abs(mx) > threshold || Math.abs(vx) > 0.5;
        
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
  });

  return {
    isDragging,
    dragOffset,
    swipeDirection,
    bind,
  };
}
