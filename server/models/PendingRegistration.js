import mongoose from "mongoose";

// Holds a registration attempt while its email is unverified. The real
// User document is only ever created after OTP verification succeeds — so
// a User existing at all is proof its email was confirmed, no separate
// isEmailVerified flag needed on the User model itself.
//
// `password` here is already bcrypt-hashed (same cost factor as User's
// pre-save hook) at request-otp time, never plaintext. `otpHash` is a
// sha256 hash of the 6-digit code, same pattern as the password-reset
// token elsewhere in this codebase — the raw OTP is never persisted.
const pendingRegistrationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    otpHash: { type: String, required: true, select: false },
    otpExpires: { type: Date, required: true },
    attempts: { type: Number, default: 0 },
    // Sliding TTL — refreshed on every (re)send so an abandoned attempt
    // cleans itself up, but a user who requests a fresh code doesn't lose
    // their spot mid-verification.
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

pendingRegistrationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const PendingRegistration = mongoose.model("PendingRegistration", pendingRegistrationSchema);

export default PendingRegistration;
