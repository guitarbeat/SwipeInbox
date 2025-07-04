import { db } from "./db";
import { emails } from "@shared/schema";

async function seedDatabase() {
  const sampleEmails = [
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

  try {
    for (const email of sampleEmails) {
      await db.insert(emails).values(email);
    }
    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seedDatabase();