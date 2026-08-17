import crypto from "crypto";
import bcrypt from "bcryptjs";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ok, created } from "../utils/apiResponse.js";
import { sendAuthCookie, clearAuthCookie } from "../utils/generateToken.js";
import User from "../models/User.js";
import PendingRegistration from "../models/PendingRegistration.js";
import { isEmailConfigured } from "../config/email.js";
import { sendWelcomeEmail, sendPasswordResetEmail, sendOtpEmail } from "../services/emailService.js";
import { generateOtp, hashOtp, OTP_EXPIRY_MS, PENDING_TTL_MS, MAX_OTP_ATTEMPTS } from "../services/otpService.js";

// Registration is two-step: request-otp creates/refreshes a pending
// registration and emails a code; verify-otp checks it and only THEN
// creates the real User. A User existing at all is proof its email was
// confirmed — there's no separate isEmailVerified flag to keep in sync.
export const requestRegistrationOtp = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!isEmailConfigured) {
    throw new ApiError(503, "Email is not configured yet. Set SMTP_HOST/SMTP_USER/SMTP_PASSWORD in server/.env.");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) throw ApiError.conflict("An account with this email already exists");

  const hashedPassword = await bcrypt.hash(password, 12);
  const otp = generateOtp();
  const now = Date.now();

  await PendingRegistration.findOneAndUpdate(
    { email },
    {
      name,
      email,
      password: hashedPassword,
      otpHash: hashOtp(otp),
      otpExpires: new Date(now + OTP_EXPIRY_MS),
      expiresAt: new Date(now + PENDING_TTL_MS),
      attempts: 0,
    },
    { upsert: true, setDefaultsOnInsert: true }
  );

  await sendOtpEmail({ name, email }, otp);

  created(res, { email }, "Verification code sent");
});

export const verifyRegistrationOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  const pending = await PendingRegistration.findOne({ email }).select("+password +otpHash");
  if (!pending) {
    throw ApiError.badRequest("No pending registration for this email. Please start again.");
  }

  if (pending.attempts >= MAX_OTP_ATTEMPTS) {
    await pending.deleteOne();
    throw ApiError.badRequest("Too many incorrect attempts. Please register again.");
  }

  if (pending.otpExpires.getTime() < Date.now()) {
    await pending.deleteOne();
    throw ApiError.badRequest("This code has expired. Please register again.");
  }

  if (hashOtp(otp) !== pending.otpHash) {
    pending.attempts += 1;
    await pending.save();
    const remaining = MAX_OTP_ATTEMPTS - pending.attempts;
    throw ApiError.badRequest(`Incorrect code. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`);
  }

  // insertMany bypasses the User model's pre-save password-hashing hook —
  // required here since `pending.password` is already a bcrypt hash and
  // running it through that hook again would double-hash it.
  const [user] = await User.insertMany([
    { name: pending.name, email: pending.email, password: pending.password, role: "customer" },
  ]);
  await pending.deleteOne();

  sendAuthCookie(res, user._id);
  sendWelcomeEmail(user).catch((err) => console.error("sendWelcomeEmail failed:", err.message));

  created(res, { user: user.toSafeJSON() }, "Account created");
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    throw ApiError.unauthorized("Invalid email or password");
  }
  if (!user.isActive) throw ApiError.forbidden("This account has been disabled");

  sendAuthCookie(res, user._id);
  ok(res, { user: user.toSafeJSON() }, "Logged in");
});

export const logout = asyncHandler(async (req, res) => {
  clearAuthCookie(res);
  ok(res, {}, "Logged out");
});

export const getMe = asyncHandler(async (req, res) => {
  ok(res, { user: req.user.toSafeJSON() });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  // Always respond the same way whether or not the account exists, so the
  // endpoint can't be used to enumerate registered emails.
  if (user) {
    const rawToken = crypto.randomBytes(32).toString("hex");
    user.passwordResetToken = crypto.createHash("sha256").update(rawToken).digest("hex");
    user.passwordResetExpires = Date.now() + 30 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${rawToken}`;
    sendPasswordResetEmail(user, resetUrl).catch((err) =>
      console.error("sendPasswordResetEmail failed:", err.message)
    );
  }

  ok(res, {}, "If an account exists for that email, a reset link has been sent");
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  const hashed = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashed,
    passwordResetExpires: { $gt: Date.now() },
  }).select("+password +passwordResetToken +passwordResetExpires");

  if (!user) throw ApiError.badRequest("This reset link is invalid or has expired");

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  sendAuthCookie(res, user._id);
  ok(res, { user: user.toSafeJSON() }, "Password reset");
});

export const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select("+password");

  if (!(await user.comparePassword(currentPassword))) {
    throw ApiError.badRequest("Current password is incorrect");
  }
  user.password = newPassword;
  await user.save();

  ok(res, {}, "Password updated");
});
