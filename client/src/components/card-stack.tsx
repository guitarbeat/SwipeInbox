import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { EmailCard } from "./email-card";
import { useSwipe } from "@/hooks/use-swipe";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { type Email, type Stats } from "@shared/schema";

interface CardStackProps {
  emails: Email[];
}

export function CardStack({ emails }: CardStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lastAction, setLastAction] = useState<{ id: number; action: string } | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const updateEmailMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return apiRequest("PATCH", `/api/emails/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/emails/status/inbox"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
  });

  const undoMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("POST", `/api/emails/${id}/undo`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/emails/status/inbox"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
  });

  const {
    isDragging,
    dragOffset,
    swipeDirection,
    bind,
  } = useSwipe({
    onSwipeLeft: () => handleSwipe('left'),
    onSwipeRight: () => handleSwipe('right'),
    threshold: 80,
  });

  const handleSwipe = (direction: 'left' | 'right') => {
    if (currentIndex >= emails.length) return;

    const currentEmail = emails[currentIndex];
    const status = direction === 'left' ? 'archived' : 'later';
    const message = direction === 'left' ? 'Deleted' : 'Saved for later';

    setLastAction({ id: currentEmail.id, action: status });
    updateEmailMutation.mutate({ id: currentEmail.id, status });

    toast({
      title: message,
      action: (
        <button
          onClick={handleUndo}
          className="text-accent hover:text-accent/80 font-medium text-sm"
        >
          UNDO
        </button>
      ),
      duration: 3000,
    });

    setCurrentIndex(prev => prev + 1);
  };

  const handleUndo = () => {
    if (!lastAction) return;

    undoMutation.mutate(lastAction.id);
    setCurrentIndex(prev => Math.max(0, prev - 1));
    setLastAction(null);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        handleSwipe('left');
      } else if (e.key === 'ArrowRight') {
        handleSwipe('right');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, emails]);

  if (emails.length === 0) {
    return (
      <div className="h-[500px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🎉</span>
          </div>
          <h3 className="text-lg font-medium text-[var(--app-text)] mb-2">
            Inbox Zero!
          </h3>
          <p className="text-[var(--app-text-secondary)]">
            All emails have been processed
          </p>
        </div>
      </div>
    );
  }

  const visibleEmails = emails.slice(currentIndex, currentIndex + 3);

  return (
    <div className="relative h-[500px]">
      <AnimatePresence>
        {visibleEmails.map((email, index) => (
          <div
            key={email.id}
            {...(index === 0 ? bind() : {})}
            className="absolute inset-0"
          >
            <EmailCard
              email={email}
              index={index}
              isDragging={isDragging && index === 0}
              dragOffset={dragOffset}
              swipeDirection={swipeDirection}
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
