import { z } from "zod";

export const stylistSchema = z.object({
  occasion: z.string().trim().max(60).optional(),
  style: z.string().trim().max(60).optional(),
  budgetMin: z.coerce.number().min(0).optional(),
  budgetMax: z.coerce.number().min(0).optional(),
  colors: z.array(z.string().trim().max(40)).max(5).optional(),
  category: z.string().trim().max(60).optional(),
  notes: z.string().trim().max(300).optional(),
});

export const chatSchema = z.object({
  message: z.string().trim().min(1, "Message is required").max(1000),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(2000),
      })
    )
    .max(20)
    .optional(),
});
