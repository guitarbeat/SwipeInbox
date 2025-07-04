import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle, Clock, Archive, BarChart3, Activity, Mail, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { type Stats, type Activity as ActivityType } from "@shared/schema";
import { formatTimeAgo } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";

export default function Settings() {
  const [emailProvider, setEmailProvider] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: stats } = useQuery<Stats>({
    queryKey: ["/api/stats"],
  });

  const { data: activities = [] } = useQuery<ActivityType[]>({
    queryKey: ["/api/activities"],
  });

  const { data: providers = {} } = useQuery<Record<string, any>>({
    queryKey: ["/api/email/providers"],
  });

  const testConnectionMutation = useMutation({
    mutationFn: async (credentials: { provider: string; user: string; password: string }) => {
      return apiRequest("POST", "/api/email/test", credentials);
    },
    onSuccess: (data: any) => {
      if (data.success) {
        toast({
          title: "Connection successful!",
          description: "Your email credentials are working correctly.",
        });
      } else {
        toast({
          title: "Connection failed",
          description: data.message,
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Connection failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
    },
  });

  const fetchEmailsMutation = useMutation({
    mutationFn: async (credentials: { provider: string; user: string; password: string; limit?: number }) => {
      return apiRequest("POST", "/api/email/fetch", credentials);
    },
    onSuccess: (data: any) => {
      toast({
        title: "Emails fetched successfully!",
        description: `Imported ${data.count} new emails from your inbox.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/emails/status/inbox"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to fetch emails",
        description: error.message || "Please check your connection and try again.",
        variant: "destructive",
      });
    },
  });

  const handleTestConnection = () => {
    if (!emailProvider || !emailAddress || !password) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields to test the connection.",
        variant: "destructive",
      });
      return;
    }

    testConnectionMutation.mutate({
      provider: emailProvider,
      user: emailAddress,
      password: password,
    });
  };

  const handleFetchEmails = () => {
    if (!emailProvider || !emailAddress || !password) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields to fetch emails.",
        variant: "destructive",
      });
      return;
    }

    fetchEmailsMutation.mutate({
      provider: emailProvider,
      user: emailAddress,
      password: password,
      limit: 20,
    });
  };

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

        {/* Email Integration */}
        <motion.div 
          className="bg-white rounded-2xl p-6 shadow-sm mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex items-center mb-4">
            <Mail className="w-5 h-5 text-primary mr-2" />
            <h2 className="text-lg font-medium text-[var(--app-text)]">Connect Your Email</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="provider">Email Provider</Label>
              <Select value={emailProvider} onValueChange={setEmailProvider}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select your email provider" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(providers || {}).map((provider) => (
                    <SelectItem key={provider} value={provider}>
                      {provider.charAt(0).toUpperCase() + provider.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your-email@example.com"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="password">Password / App Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Your email password or app-specific password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <p className="text-xs text-[var(--app-text-secondary)] mt-1">
                For Gmail/Outlook, use an app-specific password, not your regular password
              </p>
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={handleTestConnection}
                disabled={testConnectionMutation.isPending}
                variant="outline"
                className="flex-1"
              >
                {testConnectionMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  'Test Connection'
                )}
              </Button>
              
              <Button 
                onClick={handleFetchEmails}
                disabled={fetchEmailsMutation.isPending || !emailProvider}
                className="flex-1"
              >
                {fetchEmailsMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Fetching...
                  </>
                ) : (
                  'Fetch Emails'
                )}
              </Button>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-[var(--app-text)] mb-2">Setup Instructions:</h3>
              <ul className="text-sm text-[var(--app-text-secondary)] space-y-1">
                <li>• <strong>Gmail:</strong> Enable 2FA and create an app-specific password</li>
                <li>• <strong>Outlook:</strong> Use your Microsoft account app password</li>
                <li>• <strong>Yahoo:</strong> Generate an app password in account security</li>
                <li>• <strong>iCloud:</strong> Use an app-specific password from Apple ID settings</li>
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