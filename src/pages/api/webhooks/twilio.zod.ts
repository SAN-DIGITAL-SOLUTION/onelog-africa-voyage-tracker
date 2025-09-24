import { z } from 'zod';

// Zod schema for Twilio webhook payload
default export z.object({
  MessageSid: z.string().min(10),
  SmsSid: z.string().optional(),
  SmsMessageSid: z.string().optional(),
  AccountSid: z.string(),
  MessagingServiceSid: z.string().optional(),
  From: z.string(),
  To: z.string(),
  Body: z.string(),
  NumMedia: z.string().optional(),
  // Add more fields as needed for your use case
});
