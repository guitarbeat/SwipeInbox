import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { emailCredentialsSchema, emailStatusSchema } from "@shared/schema";

// Simple in-memory rate limiter keyed by IP + endpoint
const rateLimitBuckets = new Map<string, { count: number; windowStart: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 10;

function isRateLimited(ip: string, key: string): boolean {
  const bucketKey = `${ip}:${key}`;
  const now = Date.now();
  const bucket = rateLimitBuckets.get(bucketKey);
  if (!bucket || now - bucket.windowStart >= RATE_LIMIT_WINDOW_MS) {
    rateLimitBuckets.set(bucketKey, { count: 1, windowStart: now });
    return false;
  }
  if (bucket.count < RATE_LIMIT_MAX) {
    bucket.count += 1;
    return false;
  }
  return true;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all emails (with pagination)
  app.get("/api/emails", async (req, res) => {
    try {
      const querySchema = z.object({
        limit: z.coerce.number().int().min(1).max(100).optional(),
        offset: z.coerce.number().int().min(0).optional(),
      });
      const { limit, offset } = querySchema.parse(req.query);
      const emails = await storage.getAllEmails(limit, offset);
      res.json(emails);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch emails" });
    }
  });

  // Get emails by status (with pagination)
  app.get("/api/emails/status/:status", async (req, res) => {
    try {
      const status = emailStatusSchema.parse(req.params.status);
      const querySchema = z.object({
        limit: z.coerce.number().int().min(1).max(100).optional(),
        offset: z.coerce.number().int().min(0).optional(),
      });
      const { limit, offset } = querySchema.parse(req.query);
      const emails = await storage.getEmailsByStatus(status, limit, offset);
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

  // Update email status (validated)
  app.patch("/api/emails/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const bodySchema = z.object({ status: emailStatusSchema });
      const { status } = bodySchema.parse(req.body);

      const email = await storage.updateEmailStatus(id, status);
      if (!email) {
        return res.status(404).json({ error: "Email not found" });
      }
      res.json(email);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid status", details: error.flatten().fieldErrors });
      }
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

  // Search/filter emails
  app.get("/api/emails/search", async (req, res) => {
    try {
      const querySchema = z.object({
        sender: z.string().trim().min(1).optional(),
        subject: z.string().trim().min(1).optional(),
        status: emailStatusSchema.optional(),
        startDate: z.string().datetime().optional(),
        endDate: z.string().datetime().optional(),
        limit: z.coerce.number().int().min(1).max(100).optional(),
        offset: z.coerce.number().int().min(0).optional(),
      });
      const { sender, subject, status, startDate, endDate, limit, offset } = querySchema.parse(req.query);
      const emails = await storage.searchEmails({ sender, subject, status, startDate, endDate }, limit, offset);
      res.json(emails);
    } catch (error) {
      res.status(500).json({ error: "Failed to search emails" });
    }
  });

  // Get stats
  app.get("/api/stats", async (_req, res) => {
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
  app.get("/api/activities", async (_req, res) => {
    try {
      const activities = await storage.getActivities();
      res.json(activities);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch activities" });
    }
  });

  // Healthcheck
  app.get("/api/health", async (_req, res) => {
    res.json({ ok: true, uptime: process.uptime() });
  });

  // Test email connection (rate limited)
  app.post("/api/email/test", async (req, res) => {
    try {
      const ip = req.ip || req.headers["x-forwarded-for"]?.toString() || "unknown";
      if (isRateLimited(ip, "email_test")) {
        return res.status(429).json({ error: "Too many requests" });
      }

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

  // Fetch emails from IMAP (rate limited)
  app.post("/api/email/fetch", async (req, res) => {
    try {
      const ip = req.ip || req.headers["x-forwarded-for"]?.toString() || "unknown";
      if (isRateLimited(ip, "email_fetch")) {
        return res.status(429).json({ error: "Too many requests" });
      }

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
      const savedEmails = [] as any[];
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
  app.get("/api/email/providers", async (_req, res) => {
    try {
      const { EMAIL_PROVIDERS } = await import('./email-service');
      res.json(EMAIL_PROVIDERS);
    } catch (error) {
      res.status(500).json({ error: "Failed to get providers" });
    }
  });

  // Add demo emails for testing
  app.post("/api/seed", async (_req, res) => {
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

      const savedEmails = [] as any[];
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
