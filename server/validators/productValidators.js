import { z } from "zod";

const imageSchema = z.object({
  url: z.string().url(),
  publicId: z.string().optional(),
  isPrimary: z.boolean().optional(),
});

const variantSchema = z.object({
  color: z.string().min(1),
  size: z.string().min(1),
  sku: z.string().min(1),
  inventory: z.number().int().min(0),
});

const colorSchema = z.object({
  name: z.string().min(1),
  hex: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Must be a hex color like #171717"),
});

export const productSchema = z.object({
  name: z.string().trim().min(2).max(140),
  slug: z.string().trim().toLowerCase().optional(),
  description: z.string().trim().min(10),
  shortDescription: z.string().trim().max(200).optional(),
  sku: z.string().trim().min(2),
  category: z.string().min(1, "Category is required"),
  subcategory: z.string().optional().nullable(),
  brand: z.string().trim().optional(),
  price: z.number().min(0),
  compareAtPrice: z.number().min(0).optional(),
  costPrice: z.number().min(0).optional(),
  images: z.array(imageSchema).min(1, "At least one image is required"),
  colors: z.array(colorSchema).default([]),
  sizes: z.array(z.string()).default([]),
  variants: z.array(variantSchema).min(1, "At least one inventory variant is required"),
  tags: z.array(z.string()).default([]),
  material: z.string().trim().optional(),
  careInstructions: z.string().trim().optional(),
  isFeatured: z.boolean().optional(),
  isNewArrival: z.boolean().optional(),
  isBestSeller: z.boolean().optional(),
  isActive: z.boolean().optional(),
  lowStockThreshold: z.number().int().min(0).optional(),
});

export const updateProductSchema = productSchema.partial();

export const categorySchema = z.object({
  name: z.string().trim().min(1),
  slug: z.string().trim().toLowerCase().optional(),
  description: z.string().trim().optional(),
  image: imageSchema.optional(),
  parent: z.string().optional().nullable(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export const updateCategorySchema = categorySchema.partial();

export const collectionSchema = z.object({
  name: z.string().trim().min(1),
  slug: z.string().trim().toLowerCase().optional(),
  description: z.string().trim().optional(),
  tagline: z.string().trim().optional(),
  image: imageSchema.optional(),
  products: z.array(z.string()).default([]),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export const updateCollectionSchema = collectionSchema.partial();
