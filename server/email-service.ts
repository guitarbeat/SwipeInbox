// @ts-ignore - imap-simple types not available
import * as imaps from 'imap-simple';
import { InsertEmail } from '@shared/schema';

export interface EmailConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  tls: boolean;
}

export interface EmailMessage {
  id: string;
  subject: string;
  from: string;
  date: Date;
  body: string;
  priority: string;
}

export class EmailService {
  private config: EmailConfig;

  constructor(config: EmailConfig) {
    this.config = config;
  }

  async connect(): Promise<imaps.ImapSimple> {
    try {
      const connection = await imaps.connect({
        imap: {
          user: this.config.user,
          password: this.config.password,
          host: this.config.host,
          port: this.config.port,
          tls: this.config.tls,
          authTimeout: 10000,
          connTimeout: 10000,
          tlsOptions: { rejectUnauthorized: false }
        }
      });
      return connection;
    } catch (error) {
      console.error('Failed to connect to email server:', error);
      throw new Error('Email connection failed. Please check your credentials.');
    }
  }

  async fetchEmails(limit: number = 20): Promise<EmailMessage[]> {
    let connection: imaps.ImapSimple | null = null;
    
    try {
      connection = await this.connect();
      
      // Open inbox
      await connection.openBox('INBOX');
      
      // Search for unread emails
      const searchCriteria = ['UNSEEN'];
      const fetchOptions = {
        bodies: ['HEADER', 'TEXT'],
        markSeen: false,
        struct: true
      };
      
      const messages = await connection.search(searchCriteria, fetchOptions);
      
      const emails: EmailMessage[] = [];
      
      for (const message of messages.slice(0, limit)) {
        try {
          const header = message.parts.find((part: any) => part.which === 'HEADER');
          const body = message.parts.find((part: any) => part.which === 'TEXT');
          
          if (header) {
            const parsed = imaps.getParsedHeaders(header.body);
            
            // Extract email details
            const subject = (parsed.subject && parsed.subject[0]) || 'No Subject';
            const fromField = (parsed.from && parsed.from[0]) || 'Unknown Sender';
            const dateField = (parsed.date && parsed.date[0]) || new Date().toISOString();
            const priority = (parsed['x-priority'] && parsed['x-priority'][0]) || 'normal';
            
            // Parse sender name and email
            const fromMatch = fromField.match(/^(.*?)\s*<(.+)>$/) || fromField.match(/^(.+)$/);
            const senderName = fromMatch ? (fromMatch[1] || fromMatch[0]).trim().replace(/"/g, '') : 'Unknown';
            const senderEmail = fromMatch && fromMatch[2] ? fromMatch[2].trim() : fromField;
            
            // Get body text
            let bodyText = '';
            if (body && body.body) {
              bodyText = body.body.toString().substring(0, 500); // Limit body length
            }
            
            emails.push({
              id: message.attributes.uid.toString(),
              subject: subject,
              from: senderName,
              date: new Date(dateField),
              body: bodyText,
              priority: priority.toLowerCase()
            });
          }
        } catch (parseError) {
          console.warn('Failed to parse email:', parseError);
          continue;
        }
      }
      
      return emails;
      
    } catch (error) {
      console.error('Failed to fetch emails:', error);
      throw error;
    } finally {
      if (connection) {
        try {
          connection.end();
        } catch (closeError) {
          console.warn('Error closing connection:', closeError);
        }
      }
    }
  }

  async markAsRead(emailId: string): Promise<void> {
    let connection: imaps.ImapSimple | null = null;
    
    try {
      connection = await this.connect();
      await connection.openBox('INBOX');
      
      await connection.addFlags([emailId], ['\\Seen']);
    } catch (error) {
      console.error('Failed to mark email as read:', error);
      throw error;
    } finally {
      if (connection) {
        try {
          connection.end();
        } catch (closeError) {
          console.warn('Error closing connection:', closeError);
        }
      }
    }
  }

  async moveToFolder(emailId: string, folder: string): Promise<void> {
    let connection: imaps.ImapSimple | null = null;
    
    try {
      connection = await this.connect();
      await connection.openBox('INBOX');
      
      await connection.move([emailId], folder);
    } catch (error) {
      console.error(`Failed to move email to ${folder}:`, error);
      throw error;
    } finally {
      if (connection) {
        try {
          connection.end();
        } catch (closeError) {
          console.warn('Error closing connection:', closeError);
        }
      }
    }
  }

  // Convert EmailMessage to database format
  static toInsertEmail(email: EmailMessage): InsertEmail {
    return {
      subject: email.subject,
      sender: email.from,
      senderEmail: '', // Will be extracted separately if needed
      body: email.body,
      status: 'inbox',
      priority: email.priority,
      externalId: email.id
    };
  }

  // Test connection
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const connection = await this.connect();
      connection.end();
      return { success: true, message: 'Connection successful' };
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Connection failed' 
      };
    }
  }
}

// Common email provider configurations
export const EMAIL_PROVIDERS = {
  gmail: {
    host: 'imap.gmail.com',
    port: 993,
    tls: true
  },
  outlook: {
    host: 'outlook.office365.com',
    port: 993,
    tls: true
  },
  yahoo: {
    host: 'imap.mail.yahoo.com',
    port: 993,
    tls: true
  },
  icloud: {
    host: 'imap.mail.me.com',
    port: 993,
    tls: true
  }
};