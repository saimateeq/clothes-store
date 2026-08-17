import { z } from "zod";

export const createReviewSchema = z.object({
  product: z.string().min(1, "Product is required"),
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().max(120).optional(),
  comment: z.string().trim().min(3).max(2000),
});

export const updateReviewStatusSchema = z.object({
  status: z.enum(["pending", "approved", "rejected"]),
});
