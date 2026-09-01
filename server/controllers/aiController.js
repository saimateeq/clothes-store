import asyncHandler from "../utils/asyncHandler.js";
import { ok } from "../utils/apiResponse.js";
import { generateFashionAdvice, chatWithAssistant } from "../services/aiService.js";

export const stylist = asyncHandler(async (req, res) => {
  const result = await generateFashionAdvice(req.body);
  ok(res, result);
});

export const chat = asyncHandler(async (req, res) => {
  const result = await chatWithAssistant(req.body);
  ok(res, result);
});
