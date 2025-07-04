import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle, Clock, Archive, BarChart3 } from "lucide-react";
import { Link } from "wouter";
import { type Stats } from "@shared/schema";

export default function Settings() {
  const { data: stats } = useQuery<Stats>({
    queryKey: ["/api/stats"],
  });

  return (
    <div className="min-h-screen bg-[var(--app-background)] p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <motion.div 
          className="flex items-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link href="/" className="mr-4">
            <ArrowLeft className="w-6 h-6 text-[var(--app-text)]" />
          </Link>
          <h1 className="text-2xl font-light text-[var(--app-text)]">Settings</h1>
        </motion.div>

        {/* Stats Section */}
        <motion.div 
          className="bg-white rounded-2xl p-6 mb-6 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex items-center mb-4">
            <BarChart3 className="w-5 h-5 text-primary mr-2" />
            <h2 className="text-lg font-medium text-[var(--app-text)]">Statistics</h2>
          </div>
          
          {stats && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                    <CheckCircle className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-[var(--app-text-secondary)]">Processed Today</span>
                </div>
                <span className="text-xl font-semibold text-[var(--app-text)]">
                  {stats.processedToday || 0}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center mr-3">
                    <Clock className="w-4 h-4 text-accent" />
                  </div>
                  <span className="text-[var(--app-text-secondary)]">Saved for Later</span>
                </div>
                <span className="text-xl font-semibold text-[var(--app-text)]">
                  {stats.forLater || 0}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-destructive/10 rounded-lg flex items-center justify-center mr-3">
                    <Archive className="w-4 h-4 text-destructive" />
                  </div>
                  <span className="text-[var(--app-text-secondary)]">Archived</span>
                </div>
                <span className="text-xl font-semibold text-[var(--app-text)]">
                  {stats.archived || 0}
                </span>
              </div>
            </div>
          )}
        </motion.div>

        {/* How to Use Section */}
        <motion.div 
          className="bg-white rounded-2xl p-6 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-lg font-medium text-[var(--app-text)] mb-4">How to Use</h2>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center mr-3 mt-1">
                <span className="text-white text-sm">←</span>
              </div>
              <div>
                <h3 className="font-medium text-[var(--app-text)]">Swipe Left</h3>
                <p className="text-sm text-[var(--app-text-secondary)]">Delete email permanently</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mr-3 mt-1">
                <span className="text-white text-sm">→</span>
              </div>
              <div>
                <h3 className="font-medium text-[var(--app-text)]">Swipe Right</h3>
                <p className="text-sm text-[var(--app-text-secondary)]">Save for later review</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mr-3 mt-1">
                <span className="text-white text-sm">⌨</span>
              </div>
              <div>
                <h3 className="font-medium text-[var(--app-text)]">Keyboard</h3>
                <p className="text-sm text-[var(--app-text-secondary)]">Use arrow keys ← → to navigate</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}