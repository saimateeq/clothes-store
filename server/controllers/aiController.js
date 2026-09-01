import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ok } from "../utils/apiResponse.js";
import {
  generateFashionAdvice,
  chatWithAssistant,
  generateOutfit,
  analyzeAndSearchImage,
  recommendSize,
} from "../services/aiService.js";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export const stylist = asyncHandler(async (req, res) => {
  const result = await generateFashionAdvice(req.body);
  ok(res, result);
});

export const chat = asyncHandler(async (req, res) => {
  const result = await chatWithAssistant(req.body);
  ok(res, result);
});

export const outfit = asyncHandler(async (req, res) => {
  const result = await generateOutfit(req.body);
  ok(res, result);
});

export const size = asyncHandler(async (req, res) => {
  const result = await recommendSize(req.body);
  ok(res, result);
});

export const visualSearch = asyncHandler(async (req, res) => {
  if (!req.file) throw ApiError.badRequest("No image was provided");
  if (req.file.size > MAX_IMAGE_BYTES) throw ApiError.badRequest("Image is too large (max 5MB)");
  if (!req.file.mimetype?.startsWith("image/")) throw ApiError.badRequest("Only image files are allowed");

  const result = await analyzeAndSearchImage({
    base64: req.file.buffer.toString("base64"),
    mimeType: req.file.mimetype,
  });
  ok(res, result);
});
