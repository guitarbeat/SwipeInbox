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
  threshold = 120,
}: UseSwipeOptions) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [rotation, setRotation] = useState(0);

  const bind = useGesture({
    onDrag: ({ down, movement: [mx], direction: [xDir], velocity: [vx], cancel }) => {
      if (down) {
        setIsDragging(true);
        setDragOffset(mx);
        
        // Calculate rotation based on drag distance (Tinder-like effect)
        const maxRotation = 15;
        const rotationValue = (mx / 150) * maxRotation;
        setRotation(Math.max(-maxRotation, Math.min(maxRotation, rotationValue)));
        
        // Show direction indicator when dragging past certain threshold
        if (Math.abs(mx) > 50) {
          setSwipeDirection(mx > 0 ? 'right' : 'left');
        } else {
          setSwipeDirection(null);
        }
        
        // Prevent excessive dragging
        if (Math.abs(mx) > 400) {
          cancel();
        }
      } else {
        // Release - check if we should trigger swipe action
        const willSwipe = Math.abs(mx) > threshold || Math.abs(vx) > 0.5;
        
        if (willSwipe) {
          // Trigger the action
          if (mx > 0) {
            onSwipeRight?.();
          } else {
            onSwipeLeft?.();
          }
        }
        
        // Reset states
        setIsDragging(false);
        setDragOffset(0);
        setSwipeDirection(null);
        setRotation(0);
      }
    },
    onDragEnd: () => {
      setIsDragging(false);
      setDragOffset(0);
      setSwipeDirection(null);
      setRotation(0);
    },
  }, {
    drag: {
      filterTaps: true,
      axis: 'x',
      bounds: { left: -400, right: 400 },
      rubberband: 0.1,
    }
  });

  return {
    isDragging,
    dragOffset,
    swipeDirection,
    rotation,
    bind,
  };
}
