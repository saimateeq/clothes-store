import { z } from "zod";

export const couponSchema = z.object({
  code: z.string().trim().min(3).max(30),
  type: z.enum(["percentage", "fixed"]),
  value: z.number().min(0),
  minimumOrder: z.number().min(0).optional(),
  maximumDiscount: z.number().min(0).optional(),
  startDate: z.coerce.date().optional(),
  expiryDate: z.coerce.date(),
  usageLimit: z.number().int().min(1).optional(),
  applicableProducts: z.array(z.string()).optional(),
  applicableCategories: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

export const updateCouponSchema = couponSchema.partial();

export const validateCouponSchema = z.object({
  code: z.string().trim().min(1),
  shippingMethod: z.enum(["standard", "express"]).default("standard"),
});
