import asyncHandler from "../utils/asyncHandler.js";
import { ok } from "../utils/apiResponse.js";
import { generateProductDescription, generateMarketingContent, generateSalesInsights } from "../services/aiService.js";

export const productDescription = asyncHandler(async (req, res) => {
  const result = await generateProductDescription(req.body);
  ok(res, result);
});

export const marketing = asyncHandler(async (req, res) => {
  const result = await generateMarketingContent(req.body);
  ok(res, result);
});

export const insights = asyncHandler(async (req, res) => {
  const result = await generateSalesInsights({ range: req.query.range });
  ok(res, result);
});
