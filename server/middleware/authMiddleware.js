import jwt from "jsonwebtoken";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { COOKIE_NAME } from "../utils/generateToken.js";
import User from "../models/User.js";

export const protect = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) throw ApiError.unauthorized("Please log in to continue");

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.sub);
  if (!user || !user.isActive) throw ApiError.unauthorized("Please log in to continue");

  req.user = user;
  next();
});

// Attaches req.user if a valid session cookie is present, but never rejects
// the request — for routes that behave differently for guests vs. logged-in
// users (e.g. merging a guest cart) without requiring authentication.
export const attachUserIfPresent = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) return next();

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.sub);
    if (user?.isActive) req.user = user;
  } catch {
    // invalid/expired token — treat as guest rather than failing the request
  }
  next();
});

export const authorize =
  (...roles) =>
  (req, res, next) => {
    if (!req.user) throw ApiError.unauthorized("Please log in to continue");
    if (!roles.includes(req.user.role)) {
      throw ApiError.forbidden("You do not have permission to perform this action");
    }
    next();
  };

export const adminOnly = authorize("admin");
export const staffOnly = authorize("admin", "manager");
