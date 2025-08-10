import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const emails = pgTable("emails", {
  id: serial("id").primaryKey(),
  sender: text("sender").notNull(),
  senderEmail: text("sender_email").notNull(),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  priority: text("priority").notNull().default("Normal"),
  unread: boolean("unread").notNull().default(true),
  status: text("status").notNull().default("inbox"), // inbox, later, archived, deleted
  attachments: integer("attachments").default(0),
  hasReply: boolean("has_reply").default(false),
  externalId: text("external_id"), // For IMAP UID or other external references
});

export const stats = pgTable("stats", {
  id: serial("id").primaryKey(),
  processedToday: integer("processed_today").default(0),
  forLater: integer("for_later").default(0),
  archived: integer("archived").default(0),
});

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  emailId: integer("email_id").references(() => emails.id),
  action: text("action").notNull(), // "archived", "later", "undone"
  emailSubject: text("email_subject").notNull(),
  emailSender: text("email_sender").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertEmailSchema = createInsertSchema(emails).omit({
  id: true,
  timestamp: true,
});

export const insertStatsSchema = createInsertSchema(stats).omit({
  id: true,
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  timestamp: true,
});

export type Email = typeof emails.$inferSelect;
export type InsertEmail = z.infer<typeof insertEmailSchema>;
export type Stats = typeof stats.$inferSelect;
export type InsertStats = z.infer<typeof insertStatsSchema>;
export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;

export const emailCredentialsSchema = z.object({
  provider: z.string().min(1, "Email provider is required"),
  user: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type EmailCredentials = z.infer<typeof emailCredentialsSchema>;

// New: Email status validation schema for use in API validation
export const emailStatusSchema = z.enum(["inbox", "later", "archived", "deleted"]);
export type EmailStatus = z.infer<typeof emailStatusSchema>;
