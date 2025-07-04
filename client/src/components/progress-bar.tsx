import { motion } from "framer-motion";
import { type Email, type Stats } from "@shared/schema";

interface ProgressBarProps {
  emails: Email[];
  stats?: Stats;
}

export function ProgressBar({ emails, stats }: ProgressBarProps) {
  const totalEmails = (stats?.processedToday || 0) + emails.length;
  const processed = stats?.processedToday || 0;
  const progress = totalEmails > 0 ? (processed / totalEmails) * 100 : 0;

  return (
    <motion.div 
      className="mb-6"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-[var(--app-text-secondary)]">Progress</span>
        <span className="text-sm font-medium text-[var(--app-text)]">
          {Math.round(progress)}% Complete
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <motion.div 
          className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-300"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, delay: 0.3 }}
        />
      </div>
    </motion.div>
  );
}
