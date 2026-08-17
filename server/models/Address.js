import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, enum: ["shipping", "billing"], default: "shipping" },
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    line1: { type: String, required: true, trim: true },
    line2: { type: String, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, trim: true },
    postalCode: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true, default: "United States" },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Only one default address per user/type — enforced in the controller
// (findOneAndUpdate races are acceptable here since this is a low-frequency,
// single-user-initiated action, not a contended resource).
addressSchema.index({ user: 1, type: 1 });

const Address = mongoose.model("Address", addressSchema);

export default Address;
