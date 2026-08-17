import { z } from "zod";

const addressSnapshotSchema = z.object({
  fullName: z.string().trim().min(2),
  phone: z.string().trim().min(5),
  line1: z.string().trim().min(3),
  line2: z.string().trim().optional(),
  city: z.string().trim().min(1),
  state: z.string().trim().optional(),
  postalCode: z.string().trim().min(2),
  country: z.string().trim().min(2),
});

export const createOrderSchema = z.object({
  paymentIntentId: z.string().min(1, "Missing payment confirmation"),
  shippingAddress: addressSnapshotSchema,
  billingAddress: addressSnapshotSchema,
  shippingMethod: z.enum(["standard", "express"]).default("standard"),
});

export const updateOrderStatusSchema = z.object({
  orderStatus: z.enum([
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "out_for_delivery",
    "delivered",
    "cancelled",
    "refunded",
  ]),
  trackingNumber: z.string().trim().optional(),
  note: z.string().trim().optional(),
});
