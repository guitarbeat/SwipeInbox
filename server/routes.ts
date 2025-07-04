import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";

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
      const { provider, user, password } = req.body;
      
      if (!provider || !user || !password) {
        return res.status(400).json({ error: "Provider, email, and password are required" });
      }

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

      const result = await emailService.testConnection();
      res.json(result);
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
      const { provider, user, password, limit = 20 } = req.body;
      
      if (!provider || !user || !password) {
        return res.status(400).json({ error: "Provider, email, and password are required" });
      }

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

      const emails = await emailService.fetchEmails(limit);
      
      // Convert and save emails to database
      const savedEmails = [];
      for (const email of emails) {
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

  const httpServer = createServer(app);
  return httpServer;
}
