import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle, Clock, Archive, BarChart3, Activity } from "lucide-react";
import { Link } from "wouter";
import { type Stats, type Activity as ActivityType } from "@shared/schema";
import { formatTimeAgo } from "@/lib/utils";

export default function Settings() {
  const { data: stats } = useQuery<Stats>({
    queryKey: ["/api/stats"],
  });

  const { data: activities = [] } = useQuery<ActivityType[]>({
    queryKey: ["/api/activities"],
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

        {/* Recent Activity Section */}
        <motion.div 
          className="bg-white rounded-2xl p-6 shadow-sm mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center mb-4">
            <Activity className="w-5 h-5 text-primary mr-2" />
            <h2 className="text-lg font-medium text-[var(--app-text)]">Recent Activity</h2>
          </div>
          
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {activities.length > 0 ? (
              activities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 py-2">
                  <div className={`w-3 h-3 rounded-full mt-2 ${
                    activity.action === 'archived' ? 'bg-red-500' : 
                    activity.action === 'later' ? 'bg-green-500' : 'bg-blue-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm text-[var(--app-text)]">
                      <span className="capitalize">{activity.action}</span> "{activity.emailSubject}" from {activity.emailSender}
                    </p>
                    <p className="text-xs text-[var(--app-text-secondary)]">
                      {formatTimeAgo(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-[var(--app-text-secondary)] text-center py-4">
                No activity yet. Start processing emails!
              </p>
            )}
          </div>
        </motion.div>

        {/* Email Integration Guide */}
        <motion.div 
          className="bg-white rounded-2xl p-6 shadow-sm mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 className="text-lg font-medium text-[var(--app-text)] mb-4">Connect Real Email</h2>
          
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-[var(--app-text)] mb-2">Gmail Integration</h3>
              <p className="text-sm text-[var(--app-text-secondary)] mb-2">
                Use Gmail API with OAuth2 authentication:
              </p>
              <ul className="text-sm text-[var(--app-text-secondary)] space-y-1">
                <li>• Enable Gmail API in Google Cloud Console</li>
                <li>• Set up OAuth2 credentials</li>
                <li>• Use gmail.messages.list() to fetch emails</li>
                <li>• Handle rate limits (250 quota units/user/second)</li>
              </ul>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-medium text-[var(--app-text)] mb-2">Outlook Integration</h3>
              <p className="text-sm text-[var(--app-text-secondary)] mb-2">
                Use Microsoft Graph API:
              </p>
              <ul className="text-sm text-[var(--app-text-secondary)] space-y-1">
                <li>• Register app in Azure Portal</li>
                <li>• Request Mail.Read permissions</li>
                <li>• Use /me/messages endpoint</li>
                <li>• Implement token refresh flow</li>
              </ul>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-medium text-[var(--app-text)] mb-2">IMAP Integration</h3>
              <p className="text-sm text-[var(--app-text-secondary)] mb-2">
                Direct email server connection:
              </p>
              <ul className="text-sm text-[var(--app-text-secondary)] space-y-1">
                <li>• Works with most email providers</li>
                <li>• Requires app-specific passwords</li>
                <li>• Use libraries like imap-simple</li>
                <li>• Handle SSL/TLS connections</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* How to Use Section */}
        <motion.div 
          className="bg-white rounded-2xl p-6 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
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