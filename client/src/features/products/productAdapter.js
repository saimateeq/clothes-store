// Maps a Product document from the API into the flat shape the product UI
// components consume (ProductCard, ProductGrid, ProductDetails, ...).
// Keeping the mapping in one place means the API's field names (slug-based
// routing, price = current effective price, compareAtPrice = pre-sale
// price) can differ from the UI's historical prop names without every
// component needing to know about it.
export function normalizeProduct(doc) {
  if (!doc) return null;
  const isSale = Boolean(doc.compareAtPrice && doc.compareAtPrice > doc.price);

  return {
    id: doc.slug,
    _id: doc._id,
    name: doc.name,
    description: doc.description,
    shortDescription: doc.shortDescription,
    category: doc.category?.slug ?? doc.category,
    categoryName: doc.category?.name,
    price: isSale ? doc.compareAtPrice : doc.price,
    salePrice: isSale ? doc.price : null,
    images: (doc.images ?? []).map((img) => img.url),
    colors: doc.colors ?? [],
    sizes: doc.sizes ?? [],
    variants: doc.variants ?? [],
    material: doc.material,
    careInstructions: doc.careInstructions,
    rating: doc.rating ?? 0,
    reviews: doc.reviewCount ?? 0,
    isNew: Boolean(doc.isNewArrival),
    isBestSeller: Boolean(doc.isBestSeller),
    isSale,
    totalInventory: doc.totalInventory,
  };
}

export const normalizeProducts = (docs) => (docs ?? []).map(normalizeProduct);
