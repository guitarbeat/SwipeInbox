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
    onDragStart: () => {
      setIsDragging(true);
    },
    onDrag: ({ down, movement: [mx], velocity: [vx], cancel }) => {
      if (!down) return;
      
      // Always update position for visual feedback
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
    },
    onDragEnd: ({ movement: [mx], velocity: [vx] }) => {
      // Check if we should trigger swipe action
      const willSwipe = Math.abs(mx) > threshold || Math.abs(vx) > 0.5;
      
      if (willSwipe) {
        // Trigger the action
        if (mx > 0) {
          onSwipeRight?.();
        } else {
          onSwipeLeft?.();
        }
      }
      
      // Reset states with a slight delay to allow for smooth animation
      setTimeout(() => {
        setIsDragging(false);
        setDragOffset(0);
        setSwipeDirection(null);
        setRotation(0);
      }, willSwipe ? 0 : 200);
    },
  }, {
    drag: {
      filterTaps: true,
      axis: 'x',
      bounds: { left: -300, right: 300 },
      rubberband: 0.2,
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
