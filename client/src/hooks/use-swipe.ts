import { useState, useRef, useCallback } from "react";
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
  const [rotation, setRotation] = useState(0);
  const isResetting = useRef(false);
  const isDraggingRef = useRef(false);

  const resetState = useCallback(() => {
    if (isResetting.current || isDraggingRef.current) return;
    isResetting.current = true;
    
    // Use requestAnimationFrame for smoother state reset
    requestAnimationFrame(() => {
      setIsDragging(false);
      setDragOffset(0);
      setSwipeDirection(null);
      setRotation(0);
      
      setTimeout(() => {
        isResetting.current = false;
      }, 16); // One frame delay
    });
  }, []);

  const bind = useGesture({
    onDragStart: () => {
      if (isResetting.current) return;
      isDraggingRef.current = true;
      setIsDragging(true);
    },
    onDrag: ({ down, movement: [mx], velocity: [vx], cancel }) => {
      if (!down || isResetting.current) return;
      
      // Ensure we're still tracking as dragging
      isDraggingRef.current = true;
      
      // Smooth damping for large movements
      const dampedMx = mx > 0 
        ? Math.min(mx, 250 + (mx - 250) * 0.3)
        : Math.max(mx, -250 + (mx + 250) * 0.3);
      
      setDragOffset(dampedMx);
      
      // Calculate rotation with smoother easing
      const maxRotation = 12;
      const rotationValue = (dampedMx / 200) * maxRotation;
      setRotation(Math.max(-maxRotation, Math.min(maxRotation, rotationValue)));
      
      // Show direction indicator
      if (Math.abs(dampedMx) > 40) {
        setSwipeDirection(dampedMx > 0 ? 'right' : 'left');
      } else {
        setSwipeDirection(null);
      }
    },
    onDragEnd: ({ movement: [mx], velocity: [vx] }) => {
      if (isResetting.current) return;
      
      // Mark dragging as complete
      isDraggingRef.current = false;
      
      // Determine if we should swipe
      const shouldSwipe = Math.abs(mx) > threshold || Math.abs(vx) > 0.8;
      
      if (shouldSwipe) {
        // Execute the swipe action immediately
        if (mx > 0) {
          onSwipeRight?.();
        } else {
          onSwipeLeft?.();
        }
        // Reset immediately after swipe
        resetState();
      } else {
        // Animate back to center
        resetState();
      }
    },
  }, {
    drag: {
      filterTaps: true,
      axis: 'x',
      from: () => [dragOffset, 0],
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
