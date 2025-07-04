import { motion } from "framer-motion";
import { Paperclip, Reply } from "lucide-react";
import { type Email } from "@shared/schema";

interface EmailCardProps {
  email: Email;
  index: number;
  onSwipe?: (direction: 'left' | 'right') => void;
  isDragging?: boolean;
  dragOffset?: number;
}

export function EmailCard({ email, index, onSwipe, isDragging, dragOffset = 0 }: EmailCardProps) {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-red-100 text-red-600',
      'bg-blue-100 text-blue-600',
      'bg-green-100 text-green-600',
      'bg-yellow-100 text-yellow-600',
      'bg-purple-100 text-purple-600',
      'bg-pink-100 text-pink-600',
    ];
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'urgent':
        return 'bg-red-100 text-red-600';
      case 'important':
        return 'bg-yellow-100 text-yellow-600';
      case 'marketing':
        return 'bg-blue-100 text-blue-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getTimeAgo = (timestamp: Date | null) => {
    if (!timestamp) return 'Unknown';
    
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return 'Just now';
    if (hours === 1) return '1 hour ago';
    if (hours < 24) return `${hours} hours ago`;
    
    const days = Math.floor(hours / 24);
    if (days === 1) return '1 day ago';
    return `${days} days ago`;
  };

  const cardVariants = {
    initial: { scale: 0.95 - (index * 0.02), opacity: 0.5 + (index * 0.25), rotate: index * 2 },
    animate: { scale: 1 - (index * 0.03), opacity: 1 - (index * 0.25), rotate: index * 2 },
    exit: { scale: 0.8, opacity: 0, rotate: dragOffset > 0 ? 20 : -20 }
  };

  return (
    <motion.div
      className={`absolute inset-0 bg-white rounded-xl shadow-lg ${
        index === 0 ? 'cursor-grab active:cursor-grabbing' : ''
      } transition-all duration-300`}
      variants={cardVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{
        zIndex: 10 - index,
        transform: isDragging && index === 0 
          ? `translateX(${dragOffset}px) rotate(${dragOffset * 0.1}deg)`
          : undefined,
      }}
    >
      <div className="p-6 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getAvatarColor(email.sender)}`}>
              <span className="font-medium text-sm">{getInitials(email.sender)}</span>
            </div>
            <div>
              <h3 className="font-medium text-[var(--app-text)]">{email.sender}</h3>
              <p className="text-xs text-[var(--app-text-secondary)]">
                {getTimeAgo(email.timestamp)}
              </p>
            </div>
          </div>
          <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(email.priority)}`}>
            {email.priority}
          </span>
        </div>
        
        <h4 className="font-medium text-[var(--app-text)] mb-3">{email.subject}</h4>
        
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          <div className="text-[var(--app-text-secondary)] text-sm leading-relaxed whitespace-pre-wrap">
            {email.body}
          </div>
        </div>
        
        {(email.attachments > 0 || email.hasReply) && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-2 text-xs text-[var(--app-text-secondary)]">
              {email.attachments > 0 && (
                <>
                  <Paperclip className="w-3 h-3" />
                  <span>{email.attachments} attachment{email.attachments > 1 ? 's' : ''}</span>
                </>
              )}
              {email.attachments > 0 && email.hasReply && <span>•</span>}
              {email.hasReply && (
                <>
                  <Reply className="w-3 h-3" />
                  <span>Reply expected</span>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
