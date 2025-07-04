import { emails, stats, type Email, type InsertEmail, type Stats, type InsertStats } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Email operations
  getAllEmails(): Promise<Email[]>;
  getEmailsByStatus(status: string): Promise<Email[]>;
  getEmail(id: number): Promise<Email | undefined>;
  createEmail(email: InsertEmail): Promise<Email>;
  updateEmailStatus(id: number, status: string): Promise<Email | undefined>;
  deleteEmail(id: number): Promise<boolean>;
  
  // Stats operations
  getStats(): Promise<Stats>;
  updateStats(stats: Partial<InsertStats>): Promise<Stats>;
  incrementStat(field: keyof InsertStats): Promise<Stats>;
}

export class DatabaseStorage implements IStorage {
  async getAllEmails(): Promise<Email[]> {
    const allEmails = await db.select().from(emails).orderBy(emails.timestamp);
    return allEmails.reverse();
  }

  async getEmailsByStatus(status: string): Promise<Email[]> {
    const emailsByStatus = await db.select().from(emails).where(eq(emails.status, status));
    return emailsByStatus.sort((a, b) => 
      new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime()
    );
  }

  async getEmail(id: number): Promise<Email | undefined> {
    const [email] = await db.select().from(emails).where(eq(emails.id, id));
    return email || undefined;
  }

  async createEmail(insertEmail: InsertEmail): Promise<Email> {
    const [email] = await db
      .insert(emails)
      .values({
        sender: insertEmail.sender,
        senderEmail: insertEmail.senderEmail,
        subject: insertEmail.subject,
        body: insertEmail.body,
        priority: insertEmail.priority || "Normal",
        unread: insertEmail.unread ?? true,
        status: insertEmail.status || "inbox",
        attachments: insertEmail.attachments || 0,
        hasReply: insertEmail.hasReply || false,
      })
      .returning();
    return email;
  }

  async updateEmailStatus(id: number, status: string): Promise<Email | undefined> {
    const [updatedEmail] = await db
      .update(emails)
      .set({ status })
      .where(eq(emails.id, id))
      .returning();
    
    if (updatedEmail) {
      // Update stats
      const [currentStats] = await db.select().from(stats).limit(1);
      if (currentStats) {
        await db
          .update(stats)
          .set({
            processedToday: (currentStats.processedToday || 0) + 1,
            forLater: status === "later" ? (currentStats.forLater || 0) + 1 : currentStats.forLater,
            archived: status === "archived" ? (currentStats.archived || 0) + 1 : currentStats.archived,
          })
          .where(eq(stats.id, currentStats.id));
      }
    }
    
    return updatedEmail || undefined;
  }

  async deleteEmail(id: number): Promise<boolean> {
    const result = await db.delete(emails).where(eq(emails.id, id));
    const deleted = result.rowCount ? result.rowCount > 0 : false;
    
    if (deleted) {
      // Update stats
      const [currentStats] = await db.select().from(stats).limit(1);
      if (currentStats) {
        await db
          .update(stats)
          .set({
            processedToday: (currentStats.processedToday || 0) + 1,
            archived: (currentStats.archived || 0) + 1,
          })
          .where(eq(stats.id, currentStats.id));
      }
    }
    
    return deleted;
  }

  async getStats(): Promise<Stats> {
    const [currentStats] = await db.select().from(stats).limit(1);
    if (currentStats) {
      return currentStats;
    }
    
    // Create initial stats if none exist
    const [newStats] = await db
      .insert(stats)
      .values({
        processedToday: 0,
        forLater: 0,
        archived: 0,
      })
      .returning();
    
    return newStats;
  }

  async updateStats(newStats: Partial<InsertStats>): Promise<Stats> {
    const [currentStats] = await db.select().from(stats).limit(1);
    if (currentStats) {
      const [updatedStats] = await db
        .update(stats)
        .set(newStats)
        .where(eq(stats.id, currentStats.id))
        .returning();
      return updatedStats;
    }
    
    const [createdStats] = await db
      .insert(stats)
      .values({
        processedToday: newStats.processedToday || 0,
        forLater: newStats.forLater || 0,
        archived: newStats.archived || 0,
      })
      .returning();
    
    return createdStats;
  }

  async incrementStat(field: keyof InsertStats): Promise<Stats> {
    const [currentStats] = await db.select().from(stats).limit(1);
    if (currentStats) {
      const increment = { [field]: (currentStats[field] || 0) + 1 };
      return this.updateStats(increment);
    }
    
    const initialStats = { processedToday: 0, forLater: 0, archived: 0, [field]: 1 };
    return this.updateStats(initialStats);
  }
}

export const storage = new DatabaseStorage();
