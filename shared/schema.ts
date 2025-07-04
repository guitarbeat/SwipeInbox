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
});

export const stats = pgTable("stats", {
  id: serial("id").primaryKey(),
  processedToday: integer("processed_today").default(0),
  forLater: integer("for_later").default(0),
  archived: integer("archived").default(0),
});

export const insertEmailSchema = createInsertSchema(emails).omit({
  id: true,
  timestamp: true,
});

export const insertStatsSchema = createInsertSchema(stats).omit({
  id: true,
});

export type Email = typeof emails.$inferSelect;
export type InsertEmail = z.infer<typeof insertEmailSchema>;
export type Stats = typeof stats.$inferSelect;
export type InsertStats = z.infer<typeof insertStatsSchema>;
