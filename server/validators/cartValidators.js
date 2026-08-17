import { z } from "zod";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid product id");

export const addCartItemSchema = z.object({
  productId: objectId,
  size: z.string().trim().min(1),
  color: z.string().trim().min(1),
  quantity: z.number().int().min(1).max(20).default(1),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(1).max(20),
});
