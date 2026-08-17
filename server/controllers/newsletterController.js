import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ok, created } from "../utils/apiResponse.js";
import Newsletter from "../models/Newsletter.js";

export const subscribe = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const existing = await Newsletter.findOne({ email });

  if (existing) {
    if (existing.status === "subscribed") {
      throw ApiError.conflict("This email is already subscribed");
    }
    existing.status = "subscribed";
    await existing.save();
    return ok(res, {}, "Welcome back — you're subscribed again");
  }

  await Newsletter.create({ email });
  created(res, {}, "Subscribed — thanks for joining");
});

export const listSubscribers = asyncHandler(async (req, res) => {
  const subscribers = await Newsletter.find().sort({ createdAt: -1 });
  ok(res, { subscribers });
});
