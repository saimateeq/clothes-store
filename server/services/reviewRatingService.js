import Review from "../models/Review.js";
import Product from "../models/Product.js";

// Recomputed from approved reviews via aggregation rather than incrementally
// maintained — cheap at this scale and immune to drift from edits/deletes.
export async function recalculateProductRating(productId) {
  const [stats] = await Review.aggregate([
    { $match: { product: productId, status: "approved" } },
    { $group: { _id: "$product", avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);

  await Product.findByIdAndUpdate(productId, {
    rating: stats ? Math.round(stats.avgRating * 10) / 10 : 0,
    reviewCount: stats ? stats.count : 0,
  });
}
