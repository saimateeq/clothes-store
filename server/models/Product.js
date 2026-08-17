import mongoose from "mongoose";

const variantSchema = new mongoose.Schema(
  {
    color: { type: String, required: true, trim: true },
    size: { type: String, required: true, trim: true },
    sku: { type: String, required: true, trim: true },
    inventory: { type: Number, required: true, default: 0, min: 0 },
  },
  { _id: false }
);

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String },
    isPrimary: { type: Boolean, default: false },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 140 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    description: { type: String, required: true },
    shortDescription: { type: String, trim: true, maxlength: 200 },
    sku: { type: String, required: true, unique: true, trim: true, uppercase: true, index: true },

    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true, index: true },
    subcategory: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null },
    brand: { type: String, default: "VELORA", trim: true },

    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0 },
    costPrice: { type: Number, min: 0, select: false },

    images: {
      type: [imageSchema],
      validate: {
        validator: (arr) => arr.length > 0,
        message: "At least one product image is required",
      },
    },
    colors: [{ name: { type: String, required: true }, hex: { type: String, required: true } }],
    sizes: [{ type: String, required: true }],
    variants: {
      type: [variantSchema],
      validate: {
        validator: (arr) => arr.length > 0,
        message: "At least one inventory variant is required",
      },
    },

    tags: [{ type: String, trim: true, lowercase: true, index: true }],
    material: { type: String, trim: true },
    careInstructions: { type: String, trim: true },

    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0, min: 0 },

    isFeatured: { type: Boolean, default: false },
    // Named isNewArrival, not isNew — `isNew` is a reserved Mongoose document
    // property (tracks insert-vs-update state) and shadowing it with a
    // schema path breaks save()'s internal change detection.
    isNewArrival: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true, index: true },

    lowStockThreshold: { type: Number, default: 5 },
  },
  { timestamps: true }
);

productSchema.index({ name: "text", tags: "text", description: "text" });
productSchema.index({ isActive: 1, isFeatured: 1 });
productSchema.index({ isActive: 1, isNewArrival: 1 });
productSchema.index({ isActive: 1, isBestSeller: 1 });

productSchema.virtual("totalInventory").get(function getTotalInventory() {
  return this.variants?.reduce((sum, v) => sum + v.inventory, 0) ?? 0;
});

productSchema.virtual("isOnSale").get(function getIsOnSale() {
  return Boolean(this.compareAtPrice && this.compareAtPrice > this.price);
});

productSchema.set("toJSON", { virtuals: true });
productSchema.set("toObject", { virtuals: true });

productSchema.pre("validate", function ensureSlug(next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }
  next();
});

const Product = mongoose.model("Product", productSchema);

export default Product;
