import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    description: { type: String, trim: true },
    image: {
      url: { type: String },
      publicId: { type: String },
    },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null, index: true },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

categorySchema.index({ isActive: 1, sortOrder: 1 });

const Category = mongoose.model("Category", categorySchema);

export default Category;
