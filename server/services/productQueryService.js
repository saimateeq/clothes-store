const SORT_MAP = {
  featured: { isFeatured: -1, createdAt: -1 },
  newest: { createdAt: -1 },
  "price-asc": { price: 1 },
  "price-desc": { price: -1 },
  "best-selling": { isBestSeller: -1, reviewCount: -1 },
  "highest-rated": { rating: -1, reviewCount: -1 },
};

// Builds the { filter, sort, page, limit } tuple the product list/search
// endpoints share, so query-string parsing lives in exactly one place.
export function buildProductQuery(query, { defaultActiveOnly = true } = {}) {
  const filter = {};
  if (defaultActiveOnly) filter.isActive = true;

  if (query.category) filter.category = query.category;
  if (query.subcategory) filter.subcategory = query.subcategory;

  if (query.slugs) {
    const slugs = String(query.slugs).split(",").filter(Boolean);
    if (slugs.length) filter.slug = { $in: slugs };
  }

  if (query.ids) {
    const ids = String(query.ids).split(",").filter(Boolean);
    if (ids.length) filter._id = { $in: ids };
  }
  // `isNew` stays the external query-param name for a clean URL contract
  // (?isNew=true); the underlying schema field is isNewArrival — see
  // models/Product.js for why isNew itself can't be used there.
  if (query.isNew === "true") filter.isNewArrival = true;
  if (query.isBestSeller === "true") filter.isBestSeller = true;
  if (query.isFeatured === "true") filter.isFeatured = true;

  if (query.minPrice || query.maxPrice) {
    filter.price = {};
    if (query.minPrice) filter.price.$gte = Number(query.minPrice);
    if (query.maxPrice) filter.price.$lte = Number(query.maxPrice);
  }

  if (query.sizes) {
    const sizes = String(query.sizes).split(",").filter(Boolean);
    if (sizes.length) filter.sizes = { $in: sizes };
  }

  if (query.colors) {
    const colors = String(query.colors).split(",").filter(Boolean);
    if (colors.length) filter["colors.name"] = { $in: colors };
  }

  if (query.inStock === "true") {
    filter["variants.inventory"] = { $gt: 0 };
  }

  if (query.q && typeof query.q === "string") {
    filter.$text = { $search: query.q };
  }

  const sort = SORT_MAP[query.sort] || SORT_MAP.featured;
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(60, Math.max(1, Number(query.limit) || 20));

  return { filter, sort, page, limit, skip: (page - 1) * limit };
}

export default buildProductQuery;
