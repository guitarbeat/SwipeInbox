import { emails, stats, type Email, type InsertEmail, type Stats, type InsertStats } from "@shared/schema";

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

export class MemStorage implements IStorage {
  private emails: Map<number, Email>;
  private stats: Stats;
  private currentEmailId: number;

  constructor() {
    this.emails = new Map();
    this.currentEmailId = 1;
    this.stats = {
      id: 1,
      processedToday: 0,
      forLater: 0,
      archived: 0,
    };
    
    // Initialize with some sample emails
    this.initializeEmails();
  }

  private async initializeEmails() {
    const sampleEmails: InsertEmail[] = [
      {
        sender: "Sarah Anderson",
        senderEmail: "sarah@company.com",
        subject: "Meeting Reschedule Request",
        body: "Hi Team,\n\nI hope this email finds you well. I need to reschedule our meeting that was planned for tomorrow at 2 PM due to an unexpected client call that came up.\n\nWould it be possible to move it to Thursday at the same time? I know this is short notice, but I wanted to give you as much heads up as possible.\n\nPlease let me know if this works for everyone. If not, I'm flexible with alternative times throughout the week.\n\nThe agenda will remain the same:\n• Project timeline review\n• Budget allocation discussion\n• Next quarter planning\n\nThanks for your understanding!\n\nBest regards,\nSarah",
        priority: "Urgent",
        unread: true,
        status: "inbox",
        attachments: 2,
        hasReply: true,
      },
      {
        sender: "John Doe",
        senderEmail: "john@company.com",
        subject: "Project Update Required",
        body: "Hi there!\n\nI need an update on the current project status. Could you please provide:\n\n• Current progress percentage\n• Any blockers or challenges\n• Expected completion date\n• Resource requirements\n\nThis will help me prepare for the client meeting next week.\n\nThanks!",
        priority: "Important",
        unread: true,
        status: "inbox",
        attachments: 0,
        hasReply: false,
      },
      {
        sender: "Marketing Team",
        senderEmail: "marketing@company.com",
        subject: "Q4 Campaign Results",
        body: "Our Q4 marketing campaign exceeded expectations with:\n\n• 45% increase in website traffic\n• 32% boost in lead generation\n• 28% improvement in conversion rates\n\nDetailed report attached. Great work everyone!",
        priority: "Marketing",
        unread: true,
        status: "inbox",
        attachments: 1,
        hasReply: false,
      },
      {
        sender: "HR Department",
        senderEmail: "hr@company.com",
        subject: "Annual Review Process",
        body: "It's time for annual performance reviews. Please complete your self-assessment form by end of week.",
        priority: "Important",
        unread: true,
        status: "inbox",
        attachments: 1,
        hasReply: false,
      },
      {
        sender: "Finance Team",
        senderEmail: "finance@company.com",
        subject: "Expense Report Submission",
        body: "Please submit your expense reports for this quarter by Friday. All receipts must be attached.",
        priority: "Normal",
        unread: true,
        status: "inbox",
        attachments: 0,
        hasReply: false,
      },
    ];

    for (const email of sampleEmails) {
      await this.createEmail(email);
    }
  }

  async getAllEmails(): Promise<Email[]> {
    return Array.from(this.emails.values()).sort((a, b) => 
      new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime()
    );
  }

  async getEmailsByStatus(status: string): Promise<Email[]> {
    return Array.from(this.emails.values())
      .filter(email => email.status === status)
      .sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime());
  }

  async getEmail(id: number): Promise<Email | undefined> {
    return this.emails.get(id);
  }

  async createEmail(insertEmail: InsertEmail): Promise<Email> {
    const id = this.currentEmailId++;
    const email: Email = {
      ...insertEmail,
      id,
      timestamp: new Date(),
    };
    this.emails.set(id, email);
    return email;
  }

  async updateEmailStatus(id: number, status: string): Promise<Email | undefined> {
    const email = this.emails.get(id);
    if (!email) return undefined;

    const updatedEmail = { ...email, status };
    this.emails.set(id, updatedEmail);
    
    // Update stats
    if (status === "later") {
      this.stats.forLater++;
    } else if (status === "archived") {
      this.stats.archived++;
    }
    this.stats.processedToday++;
    
    return updatedEmail;
  }

  async deleteEmail(id: number): Promise<boolean> {
    const deleted = this.emails.delete(id);
    if (deleted) {
      this.stats.processedToday++;
      this.stats.archived++;
    }
    return deleted;
  }

  async getStats(): Promise<Stats> {
    return { ...this.stats };
  }

  async updateStats(newStats: Partial<InsertStats>): Promise<Stats> {
    this.stats = { ...this.stats, ...newStats };
    return this.stats;
  }

  async incrementStat(field: keyof InsertStats): Promise<Stats> {
    if (typeof this.stats[field] === 'number') {
      (this.stats as any)[field]++;
    }
    return this.stats;
  }
}

export const storage = new MemStorage();
