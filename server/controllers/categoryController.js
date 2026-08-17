import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ok, created } from "../utils/apiResponse.js";
import Category from "../models/Category.js";

function buildTree(categories, parentId = null) {
  return categories
    .filter((cat) => String(cat.parent ?? null) === String(parentId))
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((cat) => ({
      ...cat.toObject(),
      children: buildTree(categories, cat._id),
    }));
}

export const listCategories = asyncHandler(async (req, res) => {
  const flat = req.query.flat === "true";
  const categories = await Category.find({ isActive: true }).sort({ sortOrder: 1 });

  if (flat) return ok(res, { categories });
  ok(res, { categories: buildTree(categories) });
});

export const getCategoryBySlug = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug, isActive: true });
  if (!category) throw ApiError.notFound("Category not found");
  ok(res, { category });
});

export const createCategory = asyncHandler(async (req, res) => {
  const category = await Category.create(req.body);
  created(res, { category }, "Category created");
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!category) throw ApiError.notFound("Category not found");
  ok(res, { category }, "Category updated");
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const hasChildren = await Category.exists({ parent: req.params.id });
  if (hasChildren) {
    throw ApiError.conflict("Remove or reassign subcategories before deleting this category");
  }
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) throw ApiError.notFound("Category not found");
  ok(res, {}, "Category deleted");
});

export const reorderCategories = asyncHandler(async (req, res) => {
  const { order } = req.body; // [{ id, sortOrder }]
  await Promise.all(
    order.map(({ id, sortOrder }) => Category.findByIdAndUpdate(id, { sortOrder }))
  );
  ok(res, {}, "Categories reordered");
});
