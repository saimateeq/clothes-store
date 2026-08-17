import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ok, created } from "../utils/apiResponse.js";
import Collection from "../models/Collection.js";

export const listCollections = asyncHandler(async (req, res) => {
  const filter = { isActive: true };
  if (req.query.featured === "true") filter.isFeatured = true;

  const collections = await Collection.find(filter).sort({ createdAt: -1 });
  ok(res, { collections });
});

export const getCollectionBySlug = asyncHandler(async (req, res) => {
  const collection = await Collection.findOne({ slug: req.params.slug, isActive: true }).populate(
    "products",
    "name slug price compareAtPrice images colors"
  );
  if (!collection) throw ApiError.notFound("Collection not found");
  ok(res, { collection });
});

export const createCollection = asyncHandler(async (req, res) => {
  const collection = await Collection.create(req.body);
  created(res, { collection }, "Collection created");
});

export const updateCollection = asyncHandler(async (req, res) => {
  const collection = await Collection.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!collection) throw ApiError.notFound("Collection not found");
  ok(res, { collection }, "Collection updated");
});

export const deleteCollection = asyncHandler(async (req, res) => {
  const collection = await Collection.findByIdAndDelete(req.params.id);
  if (!collection) throw ApiError.notFound("Collection not found");
  ok(res, {}, "Collection deleted");
});
