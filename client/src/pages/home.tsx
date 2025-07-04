import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Mail, Settings } from "lucide-react";
import { CardStack } from "@/components/card-stack";
import { ActionButtons } from "@/components/action-buttons";
import { StatsGrid } from "@/components/stats-grid";
import { ProgressBar } from "@/components/progress-bar";
import { SwipeOverlay } from "@/components/swipe-overlay";
import { type Email, type Stats } from "@shared/schema";

export default function Home() {
  const { data: emails = [], isLoading: emailsLoading } = useQuery<Email[]>({
    queryKey: ["/api/emails/status/inbox"],
  });

  const { data: stats, isLoading: statsLoading } = useQuery<Stats>({
    queryKey: ["/api/stats"],
  });

  if (emailsLoading || statsLoading) {
    return (
      <div className="min-h-screen bg-[var(--app-background)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-[var(--app-text-secondary)]">Loading emails...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--app-background)]">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center space-x-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <Mail className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-[var(--app-text)]">SwipeEmail</h1>
            </motion.div>
            
            <div className="flex items-center space-x-4">
              <motion.div 
                className="bg-primary text-white px-3 py-1 rounded-full text-sm font-medium"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {emails.length} left
              </motion.div>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <Settings className="w-5 h-5 text-[var(--app-text-secondary)]" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Progress Bar */}
        <ProgressBar emails={emails} stats={stats} />

        {/* Card Stack */}
        <div className="relative mb-6">
          <CardStack emails={emails} />
        </div>

        {/* Action Buttons */}
        <ActionButtons />

        {/* Instructions */}
        <div className="text-center mb-6">
          <p className="text-[var(--app-text-secondary)] text-sm mb-2">
            Swipe or use buttons to process emails
          </p>
          <div className="flex justify-center space-x-6 text-xs text-[var(--app-text-secondary)]">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-destructive rounded-full"></div>
              <span>Swipe left to delete</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-accent rounded-full"></div>
              <span>Swipe right for later</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <StatsGrid stats={stats} />
      </main>

      {/* Swipe Overlay */}
      <SwipeOverlay />
    </div>
  );
}
