import { Router } from "express";
import * as authController from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";
import { authRateLimit } from "../middleware/authRateLimit.js";
import {
  registerSchema,
  verifyOtpSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updatePasswordSchema,
} from "../validators/authValidators.js";

const router = Router();

router.post("/register", authRateLimit, validate(registerSchema), authController.register);

router.post(
  "/register/request-otp",
  authRateLimit,
  validate(registerSchema),
  authController.requestRegistrationOtp
);
router.post(
  "/register/verify-otp",
  authRateLimit,
  validate(verifyOtpSchema),
  authController.verifyRegistrationOtp
);
router.post("/login", authRateLimit, validate(loginSchema), authController.login);
router.post("/logout", authController.logout);
router.get("/me", protect, authController.getMe);
router.post("/forgot-password", authRateLimit, validate(forgotPasswordSchema), authController.forgotPassword);
router.post("/reset-password", authRateLimit, validate(resetPasswordSchema), authController.resetPassword);
router.patch("/update-password", protect, validate(updatePasswordSchema), authController.updatePassword);

export default router;
