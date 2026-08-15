import { z } from "zod";

export const chatRequestSchema = z.object({
  conversationId: z.string().min(1, "conversationId is required"),
  message: z.string().min(1, "Message cannot be empty.").max(2000, "Message is too long."),
});

export const createConversationRequestSchema = z.object({
  customerId: z.string().min(1, "customerId is required"),
});
