import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ok, created } from "../utils/apiResponse.js";
import Review from "../models/Review.js";
import Order from "../models/Order.js";
import { recalculateProductRating } from "../services/reviewRatingService.js";

export const listReviewsForProduct = asyncHandler(async (req, res) => {
  const { product } = req.query;
  if (!product) throw ApiError.badRequest("product is required");

  const reviews = await Review.find({ product, status: "approved" })
    .sort({ createdAt: -1 })
    .populate("user", "name");
  ok(res, { reviews });
});

export const listMyReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ user: req.user._id }).sort({ createdAt: -1 });
  ok(res, { reviews });
});

export const createReview = asyncHandler(async (req, res) => {
  const { product, rating, title, comment } = req.body;

  const alreadyReviewed = await Review.findOne({ product, user: req.user._id });
  if (alreadyReviewed) throw ApiError.conflict("You've already reviewed this product");

  const hasPurchased = await Order.exists({
    user: req.user._id,
    "items.product": product,
    paymentStatus: "paid",
  });

  const review = await Review.create({
    product,
    user: req.user._id,
    rating,
    title,
    comment,
    isVerifiedPurchase: Boolean(hasPurchased),
  });

  created(res, { review }, "Review submitted — it will appear once approved");
});

export const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) throw ApiError.notFound("Review not found");

  const isOwner = String(review.user) === String(req.user._id);
  const isStaff = ["admin", "manager"].includes(req.user.role);
  if (!isOwner && !isStaff) throw ApiError.forbidden("You cannot delete this review");

  await review.deleteOne();
  if (review.status === "approved") await recalculateProductRating(review.product);

  ok(res, {}, "Review deleted");
});

// ── Admin moderation ────────────────────────────────────────────────────

export const listReviewsForModeration = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;

  const reviews = await Review.find(filter)
    .sort({ createdAt: -1 })
    .populate("user", "name email")
    .populate("product", "name slug");
  ok(res, { reviews });
});

export const updateReviewStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const review = await Review.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!review) throw ApiError.notFound("Review not found");

  await recalculateProductRating(review.product);
  ok(res, { review }, `Review ${status}`);
});
