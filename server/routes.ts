import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { emailCredentialsSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all emails
  app.get("/api/emails", async (req, res) => {
    try {
      const emails = await storage.getAllEmails();
      res.json(emails);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch emails" });
    }
  });

  // Get emails by status
  app.get("/api/emails/status/:status", async (req, res) => {
    try {
      const { status } = req.params;
      const emails = await storage.getEmailsByStatus(status);
      res.json(emails);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch emails by status" });
    }
  });

  // Get single email
  app.get("/api/emails/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const email = await storage.getEmail(id);
      if (!email) {
        return res.status(404).json({ error: "Email not found" });
      }
      res.json(email);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch email" });
    }
  });

  // Update email status
  app.patch("/api/emails/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ error: "Status is required" });
      }

      const email = await storage.updateEmailStatus(id, status);
      if (!email) {
        return res.status(404).json({ error: "Email not found" });
      }
      
      res.json(email);
    } catch (error) {
      res.status(500).json({ error: "Failed to update email status" });
    }
  });

  // Delete email
  app.delete("/api/emails/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteEmail(id);
      if (!deleted) {
        return res.status(404).json({ error: "Email not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete email" });
    }
  });

  // Get stats
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // Undo last action
  app.post("/api/emails/:id/undo", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const email = await storage.updateEmailStatus(id, "inbox");
      if (!email) {
        return res.status(404).json({ error: "Email not found" });
      }
      res.json(email);
    } catch (error) {
      res.status(500).json({ error: "Failed to undo action" });
    }
  });

  // Get activities
  app.get("/api/activities", async (req, res) => {
    try {
      const activities = await storage.getActivities();
      res.json(activities);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch activities" });
    }
  });

  // Test email connection
  app.post("/api/email/test", async (req, res) => {
    try {
      const result = emailCredentialsSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          error: "Invalid request body",
          details: result.error.flatten().fieldErrors
        });
      }
      const { provider, user, password } = result.data;

      const { EmailService, EMAIL_PROVIDERS } = await import('./email-service');
      
      const providerConfig = EMAIL_PROVIDERS[provider as keyof typeof EMAIL_PROVIDERS];
      if (!providerConfig) {
        return res.status(400).json({ error: "Unsupported email provider" });
      }

      const emailService = new EmailService({
        ...providerConfig,
        user,
        password
      });

      const connectionResult = await emailService.testConnection();
      res.json(connectionResult);
    } catch (error) {
      res.status(500).json({ 
        error: "Connection test failed", 
        message: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // Fetch emails from IMAP
  app.post("/api/email/fetch", async (req, res) => {
    try {
      const result = emailCredentialsSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({
          error: "Invalid request body",
          details: result.error.flatten().fieldErrors
        });
      }
      const { provider, user, password } = result.data;
      const { limit = 20 } = req.body;

      const { EmailService, EMAIL_PROVIDERS } = await import('./email-service');
      
      const providerConfig = EMAIL_PROVIDERS[provider as keyof typeof EMAIL_PROVIDERS];
      if (!providerConfig) {
        return res.status(400).json({ error: "Unsupported email provider" });
      }

      const emailService = new EmailService({
        ...providerConfig,
        user,
        password
      });

      const fetchedEmails = await emailService.fetchEmails(limit);
      
      // Convert and save emails to database
      const savedEmails = [];
      for (const email of fetchedEmails) {
        const insertEmail = EmailService.toInsertEmail(email);
        const savedEmail = await storage.createEmail(insertEmail);
        savedEmails.push(savedEmail);
      }

      res.json({ 
        success: true, 
        count: savedEmails.length, 
        emails: savedEmails 
      });
    } catch (error) {
      res.status(500).json({ 
        error: "Failed to fetch emails", 
        message: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // Get supported email providers
  app.get("/api/email/providers", async (req, res) => {
    try {
      const { EMAIL_PROVIDERS } = await import('./email-service');
      res.json(EMAIL_PROVIDERS);
    } catch (error) {
      res.status(500).json({ error: "Failed to get providers" });
    }
  });

  // Add demo emails for testing
  app.post("/api/seed", async (req, res) => {
    try {
      const demoEmails = [
        {
          sender: "Sarah Wilson",
          senderEmail: "sarah@company.com",
          subject: "Q1 Marketing Campaign Results",
          body: "Hi team, I wanted to share the exciting results from our Q1 marketing campaign. We exceeded our target by 25% and generated significant new leads...",
          priority: "high",
          status: "inbox"
        },
        {
          sender: "LinkedIn",
          senderEmail: "noreply@linkedin.com",
          subject: "5 people viewed your profile this week",
          body: "Your profile has been gaining attention! Here are the professionals who viewed your profile recently...",
          priority: "normal",
          status: "inbox"
        },
        {
          sender: "GitHub",
          senderEmail: "notifications@github.com",
          subject: "Pull request merged: Fix authentication bug",
          body: "Your pull request #247 has been successfully merged into the main branch. The authentication bug fix is now live...",
          priority: "normal",
          status: "inbox"
        },
        {
          sender: "Newsletter Team",
          senderEmail: "news@techworld.com",
          subject: "This Week in Tech: AI Breakthroughs & More",
          body: "Welcome to your weekly tech digest! This week we're covering the latest AI developments, new startup funding rounds...",
          priority: "low",
          status: "inbox"
        }
      ];

      const savedEmails = [];
      for (const email of demoEmails) {
        const savedEmail = await storage.createEmail(email);
        savedEmails.push(savedEmail);
      }

      res.json({ 
        success: true, 
        count: savedEmails.length, 
        message: "Demo emails created successfully" 
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to create demo emails" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
