import { emails, stats, activities, type Email, type InsertEmail, type Stats, type InsertStats, type Activity, type InsertActivity } from "@shared/schema";
import { db } from "./db";
import { and, desc, eq, ilike, gte, lte } from "drizzle-orm";

export interface IStorage {
  // Email operations
  getAllEmails(limit?: number, offset?: number): Promise<Email[]>;
  getEmailsByStatus(status: string, limit?: number, offset?: number): Promise<Email[]>;
  getEmail(id: number): Promise<Email | undefined>;
  createEmail(email: InsertEmail): Promise<Email>;
  updateEmailStatus(id: number, status: string): Promise<Email | undefined>;
  deleteEmail(id: number): Promise<boolean>;
  searchEmails(
    filters: { status?: string; sender?: string; subject?: string; startDate?: string; endDate?: string },
    limit?: number,
    offset?: number,
  ): Promise<Email[]>;
  
  // Stats operations
  getStats(): Promise<Stats>;
  updateStats(stats: Partial<InsertStats>): Promise<Stats>;
  incrementStat(field: keyof InsertStats): Promise<Stats>;
  
  // Activity operations
  getActivities(): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
}

export class DatabaseStorage implements IStorage {
  async getAllEmails(limit?: number, offset?: number): Promise<Email[]> {
    const base = db.select().from(emails).orderBy(desc(emails.timestamp));
    const withLimit = typeof limit === "number" ? base.limit(limit) : base;
    const withOffset = typeof offset === "number" ? withLimit.offset(offset) : withLimit;
    const allEmails = await withOffset;
    return allEmails;
  }

  async getEmailsByStatus(status: string, limit?: number, offset?: number): Promise<Email[]> {
    const base = db.select().from(emails).where(eq(emails.status, status)).orderBy(desc(emails.timestamp));
    const withLimit = typeof limit === "number" ? base.limit(limit) : base;
    const withOffset = typeof offset === "number" ? withLimit.offset(offset) : withLimit;
    const emailsByStatus = await withOffset;
    return emailsByStatus;
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
        externalId: insertEmail.externalId,
      })
      .returning();
    return email;
  }

  async updateEmailStatus(id: number, status: string): Promise<Email | undefined> {
    return await db.transaction(async (tx) => {
      const [updatedEmail] = await tx
        .update(emails)
        .set({ status })
        .where(eq(emails.id, id))
        .returning();
      
      if (!updatedEmail) return undefined;

      await this.createActivity({
        emailId: updatedEmail.id,
        action: status,
        emailSubject: updatedEmail.subject,
        emailSender: updatedEmail.sender,
      });

      const [currentStats] = await tx.select().from(stats).limit(1);
      if (currentStats) {
        await tx
          .update(stats)
          .set({
            processedToday: (currentStats.processedToday || 0) + 1,
            forLater: status === "later" ? (currentStats.forLater || 0) + 1 : currentStats.forLater,
            archived: status === "archived" ? (currentStats.archived || 0) + 1 : currentStats.archived,
          })
          .where(eq(stats.id, currentStats.id));
      }

      return updatedEmail;
    });
  }

  async deleteEmail(id: number): Promise<boolean> {
    return await db.transaction(async (tx) => {
      const [existing] = await tx.select().from(emails).where(eq(emails.id, id));
      if (!existing) return false;

      const deletedRows = await tx.delete(emails).where(eq(emails.id, id));
      const deleted = deletedRows.rowCount ? deletedRows.rowCount > 0 : true;

      if (deleted) {
        await this.createActivity({
          emailId: existing.id,
          action: "deleted",
          emailSubject: existing.subject,
          emailSender: existing.sender,
        });

        const [currentStats] = await tx.select().from(stats).limit(1);
        if (currentStats) {
          await tx
            .update(stats)
            .set({
              processedToday: (currentStats.processedToday || 0) + 1,
              archived: (currentStats.archived || 0) + 1,
            })
            .where(eq(stats.id, currentStats.id));
        }
      }

      return deleted;
    });
  }

  async getStats(): Promise<Stats> {
    const [currentStats] = await db.select().from(stats).limit(1);
    if (currentStats) {
      return currentStats;
    }
    
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
      const increment = { [field]: (currentStats[field] || 0) + 1 } as Partial<InsertStats>;
      return this.updateStats(increment);
    }
    
    const initialStats = { processedToday: 0, forLater: 0, archived: 0, [field]: 1 } as Partial<InsertStats>;
    return this.updateStats(initialStats);
  }

  async getActivities(): Promise<Activity[]> {
    const allActivities = await db.select().from(activities).orderBy(desc(activities.timestamp)).limit(50);
    return allActivities;
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const [activity] = await db
      .insert(activities)
      .values(insertActivity)
      .returning();
    return activity;
  }

  async searchEmails(
    filters: { status?: string; sender?: string; subject?: string; startDate?: string; endDate?: string },
    limit?: number,
    offset?: number,
  ): Promise<Email[]> {
    const whereClauses = [] as any[];
    if (filters.status) whereClauses.push(eq(emails.status, filters.status));
    if (filters.sender) whereClauses.push(ilike(emails.sender, `%${filters.sender}%`));
    if (filters.subject) whereClauses.push(ilike(emails.subject, `%${filters.subject}%`));
    if (filters.startDate) whereClauses.push(gte(emails.timestamp, new Date(filters.startDate)));
    if (filters.endDate) whereClauses.push(lte(emails.timestamp, new Date(filters.endDate)));

    const base = db
      .select()
      .from(emails)
      .where(whereClauses.length ? and(...whereClauses) : undefined as any)
      .orderBy(desc(emails.timestamp));

    const withLimit = typeof limit === "number" ? base.limit(limit) : base;
    const withOffset = typeof offset === "number" ? withLimit.offset(offset) : withLimit;

    const results = await withOffset;
    return results;
  }
}

export const storage = new DatabaseStorage();
