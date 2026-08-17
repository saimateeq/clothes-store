import asyncHandler from "../utils/asyncHandler.js";
import { ok } from "../utils/apiResponse.js";
import Wishlist from "../models/Wishlist.js";
import Product from "../models/Product.js";

// Atomic upsert — see cartService.getOrCreateCart for why find-then-create
// isn't safe here (concurrent requests for a brand-new user's wishlist can
// otherwise race into a duplicate-key error on the unique `user` index).
async function getOrCreateWishlist(userId) {
  return Wishlist.findOneAndUpdate(
    { user: userId },
    { $setOnInsert: { user: userId, products: [] } },
    { upsert: true, new: true }
  );
}

export const getWishlist = asyncHandler(async (req, res) => {
  const wishlist = await getOrCreateWishlist(req.user._id);
  const products = await Product.find({ _id: { $in: wishlist.products }, isActive: true }).select(
    "name slug images price compareAtPrice colors sizes rating reviewCount isNewArrival isBestSeller"
  );
  ok(res, { productIds: wishlist.products.map(String), products });
});

export const addProduct = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const wishlist = await getOrCreateWishlist(req.user._id);
  if (!wishlist.products.some((id) => String(id) === productId)) {
    wishlist.products.push(productId);
    await wishlist.save();
  }
  ok(res, { productIds: wishlist.products.map(String) }, "Added to wishlist");
});

export const removeProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const wishlist = await getOrCreateWishlist(req.user._id);
  wishlist.products = wishlist.products.filter((id) => String(id) !== productId);
  await wishlist.save();
  ok(res, { productIds: wishlist.products.map(String) }, "Removed from wishlist");
});

export const mergeWishlist = asyncHandler(async (req, res) => {
  const { productIds = [] } = req.body;
  const wishlist = await getOrCreateWishlist(req.user._id);
  const existing = new Set(wishlist.products.map(String));
  productIds.forEach((id) => existing.add(id));
  wishlist.products = Array.from(existing);
  await wishlist.save();
  ok(res, { productIds: wishlist.products.map(String) }, "Wishlist merged");
});
