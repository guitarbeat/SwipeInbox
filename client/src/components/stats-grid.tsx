import { motion } from "framer-motion";
import { CheckCircle, Clock, Archive } from "lucide-react";
import { type Stats } from "@shared/schema";

interface StatsGridProps {
  stats?: Stats;
}

export function StatsGrid({ stats }: StatsGridProps) {
  if (!stats) return null;

  const statItems = [
    {
      label: "Processed Today",
      value: stats.processedToday,
      icon: CheckCircle,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "For Later",
      value: stats.forLater,
      icon: Clock,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      label: "Archived",
      value: stats.archived,
      icon: Archive,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
  ];

  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-3 gap-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
    >
      {statItems.map((item, index) => (
        <motion.div
          key={item.label}
          className="bg-white p-4 rounded-xl shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 + (index * 0.1) }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[var(--app-text-secondary)] text-sm">{item.label}</p>
              <p className="text-2xl font-semibold text-[var(--app-text)]">{item.value}</p>
            </div>
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.bgColor}`}>
              <item.icon className={`w-5 h-5 ${item.color}`} />
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
