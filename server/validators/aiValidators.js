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

export const outfitSchema = z.object({
  productId: z.string().trim().regex(/^[0-9a-fA-F]{24}$/, "Invalid product id"),
});

export const sizeSchema = z.object({
  productId: z.string().trim().regex(/^[0-9a-fA-F]{24}$/, "Invalid product id"),
  height: z.coerce.number().min(0).max(300).optional(),
  weight: z.coerce.number().min(0).max(500).optional(),
  chest: z.coerce.number().min(0).max(300).optional(),
  waist: z.coerce.number().min(0).max(300).optional(),
  usualSize: z.string().trim().max(20).optional(),
  preferredFit: z.string().trim().max(40).optional(),
});

export const productDescriptionSchema = z.object({
  name: z.string().trim().min(1, "Product name is required").max(140),
  category: z.string().trim().max(60).optional(),
  material: z.string().trim().max(100).optional(),
  color: z.string().trim().max(60).optional(),
  features: z.string().trim().max(400).optional(),
  fit: z.string().trim().max(60).optional(),
  audience: z.string().trim().max(100).optional(),
  price: z.coerce.number().min(0).optional(),
});

export const marketingSchema = z.object({
  productId: z
    .string()
    .trim()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid product id")
    .optional(),
  contentType: z.enum([
    "instagram_caption",
    "facebook_post",
    "email_campaign",
    "whatsapp_promo",
    "ad_copy",
    "product_launch",
    "sale_announcement",
  ]),
  audience: z.string().trim().max(100).optional(),
  tone: z.string().trim().max(60).optional(),
  offer: z.string().trim().max(200).optional(),
  goal: z.string().trim().max(200).optional(),
});
