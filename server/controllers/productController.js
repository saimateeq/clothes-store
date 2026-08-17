import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ok, created } from "../utils/apiResponse.js";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import { buildProductQuery } from "../services/productQueryService.js";

const NO_MATCH_ID = "000000000000000000000000";

// The shop UI filters by category *slug* (readable URLs like /shop/women),
// but the stored field is a Category ObjectId — resolve slug -> id here so
// buildProductQuery only ever deals with ids. An unknown slug resolves to
// an id that can't exist, so the query correctly returns zero results
// instead of silently ignoring the filter.
async function resolveCategorySlugs(query) {
  const resolved = { ...query };
  // req.query values are attacker-controlled and can be arrays/objects
  // (e.g. ?category[$ne]=x) even after mongo-sanitize strips operator keys —
  // only ever treat them as category slugs when they're plain strings.
  if (typeof query.category === "string" && query.category) {
    const cat = await Category.findOne({ slug: query.category }).select("_id");
    resolved.category = cat ? cat._id.toString() : NO_MATCH_ID;
  } else {
    delete resolved.category;
  }
  if (typeof query.subcategory === "string" && query.subcategory) {
    const sub = await Category.findOne({ slug: query.subcategory }).select("_id");
    resolved.subcategory = sub ? sub._id.toString() : NO_MATCH_ID;
  } else {
    delete resolved.subcategory;
  }
  return resolved;
}

async function paginatedProducts(rawQuery, options) {
  const query = await resolveCategorySlugs(rawQuery);
  const { filter, sort, page, limit, skip } = buildProductQuery(query, options);

  const [products, total] = await Promise.all([
    Product.find(filter)
      .select(query.q ? { score: { $meta: "textScore" } } : {})
      .sort(query.q ? { score: { $meta: "textScore" } } : sort)
      .skip(skip)
      .limit(limit)
      .populate("category", "name slug")
      .populate("subcategory", "name slug"),
    Product.countDocuments(filter),
  ]);

  return { products, page, pages: Math.ceil(total / limit) || 1, total, limit };
}

export const listProducts = asyncHandler(async (req, res) => {
  const result = await paginatedProducts(req.query);
  ok(res, result);
});

// GET /api/products/admin/all — staff-only listing that includes inactive
// products (the public listProducts always filters isActive:true).
export const listProductsAdmin = asyncHandler(async (req, res) => {
  const result = await paginatedProducts(req.query, { defaultActiveOnly: false });
  ok(res, result);
});

// GET /api/products/search?q= — lightweight typeahead: smaller page size,
// no full pagination metadata needed by the search overlay.
export const searchProducts = asyncHandler(async (req, res) => {
  if (!req.query.q || req.query.q.trim().length < 1) {
    return ok(res, { products: [] });
  }
  const result = await paginatedProducts({ ...req.query, limit: req.query.limit || 8 });
  ok(res, { products: result.products });
});

export const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug, isActive: true })
    .populate("category", "name slug")
    .populate("subcategory", "name slug");

  if (!product) throw ApiError.notFound("Product not found");

  const related = await Product.find({
    category: product.category._id,
    _id: { $ne: product._id },
    isActive: true,
  })
    .limit(4)
    .select("name slug price compareAtPrice images colors sizes rating reviewCount isNewArrival isBestSeller");

  ok(res, { product, related });
});

// GET /api/products/facets — distinct sizes/colors across the active
// catalog, for the shop filter sidebar. Computed in the database rather
// than derived from a single paginated page of results, so filter options
// stay correct regardless of what's currently on screen.
export const getProductFacets = asyncHandler(async (req, res) => {
  const [sizes, colors] = await Promise.all([
    Product.distinct("sizes", { isActive: true }),
    Product.aggregate([
      { $match: { isActive: true } },
      { $unwind: "$colors" },
      { $group: { _id: "$colors.name", hex: { $first: "$colors.hex" } } },
      { $project: { _id: 0, name: "$_id", hex: 1 } },
      { $sort: { name: 1 } },
    ]),
  ]);
  ok(res, { sizes, colors });
});

// GET /api/products/id/:id — admin-only lookup by Mongo _id, unlike the
// public getProductBySlug this intentionally does NOT filter isActive, so
// staff can open a deactivated product in the edit form.
export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate("category", "name slug")
    .populate("subcategory", "name slug");
  if (!product) throw ApiError.notFound("Product not found");
  ok(res, { product });
});

export const createProduct = asyncHandler(async (req, res) => {
  const existingSku = await Product.findOne({ sku: req.body.sku.toUpperCase() });
  if (existingSku) throw ApiError.conflict("A product with this SKU already exists");

  const product = await Product.create(req.body);
  created(res, { product }, "Product created");
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!product) throw ApiError.notFound("Product not found");
  ok(res, { product }, "Product updated");
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) throw ApiError.notFound("Product not found");
  ok(res, {}, "Product deleted");
});

export const setProductActive = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { isActive: req.body.isActive },
    { new: true }
  );
  if (!product) throw ApiError.notFound("Product not found");
  ok(res, { product }, product.isActive ? "Product activated" : "Product deactivated");
});
