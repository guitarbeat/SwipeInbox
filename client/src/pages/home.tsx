import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Settings, Moon, Sun } from "lucide-react";
import { Link } from "wouter";
import { CardStack } from "@/components/card-stack";
import { useTheme } from "@/contexts/theme-context";
import { type Email, type Stats } from "@shared/schema";

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  
  const { data: emails = [], isLoading: emailsLoading } = useQuery<Email[]>({
    queryKey: ["/api/emails/status/inbox"],
  });

  const { data: stats, isLoading: statsLoading } = useQuery<Stats>({
    queryKey: ["/api/stats"],
  });

  if (emailsLoading || statsLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading emails...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md relative">
        {/* Theme toggle and Settings buttons */}
        <motion.div
          className="absolute top-0 right-0 z-20 flex gap-2"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <button 
            onClick={toggleTheme}
            className="w-10 h-10 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-all duration-200"
          >
            {theme === 'dark' ? 
              <Sun className="w-5 h-5 text-yellow-500" /> : 
              <Moon className="w-5 h-5 text-gray-600" />
            }
          </button>
          <Link href="/settings">
            <button className="w-10 h-10 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-all duration-200">
              <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </Link>
        </motion.div>

        {/* Minimal header with counter */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-2xl font-light text-[var(--app-text)] mb-2">
            {emails.length} emails
          </div>
        </motion.div>

        {/* Card Stack */}
        <CardStack emails={emails} />
      </div>
    </div>
  );
}
