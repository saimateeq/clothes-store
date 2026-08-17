import mongoose from "mongoose";

const collectionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    description: { type: String, trim: true },
    tagline: { type: String, trim: true },
    image: {
      url: { type: String },
      publicId: { type: String },
    },
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

collectionSchema.index({ isActive: 1, isFeatured: 1 });

const Collection = mongoose.model("Collection", collectionSchema);

export default Collection;
