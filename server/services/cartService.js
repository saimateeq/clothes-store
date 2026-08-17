import { ApiError } from "../utils/ApiError.js";
import Product from "../models/Product.js";
import Cart from "../models/Cart.js";

// Atomic upsert: two concurrent requests for a brand-new user's cart (e.g.
// React StrictMode double-invoking an effect, or a genuine double-click)
// must not race a separate findOne+create into a duplicate-key error on
// the unique `user` index.
export async function getOrCreateCart(userId) {
  return Cart.findOneAndUpdate(
    { user: userId },
    { $setOnInsert: { user: userId, items: [] } },
    { upsert: true, new: true }
  );
}

export async function assertVariantAvailable(productId, size, color, quantity) {
  const product = await Product.findOne({ _id: productId, isActive: true });
  if (!product) throw ApiError.notFound("Product not found");

  const variant = product.variants.find((v) => v.size === size && v.color === color);
  if (!variant) throw ApiError.badRequest(`${color} / ${size} is not available for this product`);
  if (variant.inventory < quantity) {
    throw ApiError.badRequest(`Only ${variant.inventory} left in stock for ${color} / ${size}`);
  }
  return product;
}

// Hydrates cart items with live product data (price, image, availability)
// and computes the subtotal server-side — the cart must never trust a
// client-supplied price or total.
export async function hydrateCart(cart) {
  const populated = await cart.populate({
    path: "items.product",
    select: "name slug images price compareAtPrice variants isActive",
  });

  const lines = [];
  let subtotal = 0;
  let requiresPrune = false;

  for (const item of populated.items) {
    const product = item.product;
    if (!product || !product.isActive) {
      requiresPrune = true;
      continue;
    }
    const variant = product.variants.find((v) => v.size === item.size && v.color === item.color);
    const inventory = variant?.inventory ?? 0;
    const lineTotal = product.price * item.quantity;
    subtotal += lineTotal;

    lines.push({
      key: `${product._id}__${item.size}__${item.color}`,
      productId: product._id,
      id: product.slug,
      name: product.name,
      image: product.images?.[0]?.url,
      price: product.price,
      size: item.size,
      color: item.color,
      quantity: item.quantity,
      inventory,
      lineTotal,
    });
  }

  return { lines, subtotal, requiresPrune };
}

export async function pruneInvalidItems(cart) {
  const validItemIds = new Set();
  for (const item of cart.items) {
    const product = await Product.findOne({ _id: item.product, isActive: true }).select("_id");
    if (product) validItemIds.add(`${item.product}__${item.size}__${item.color}`);
  }
  cart.items = cart.items.filter((item) =>
    validItemIds.has(`${item.product}__${item.size}__${item.color}`)
  );
  await cart.save();
  return cart;
}

export async function addOrIncrementItem(cart, { productId, size, color, quantity }) {
  await assertVariantAvailable(productId, size, color, quantity);

  const existing = cart.items.find(
    (item) => String(item.product) === String(productId) && item.size === size && item.color === color
  );
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.items.push({ product: productId, size, color, quantity });
  }
  await cart.save();
  return cart;
}

export async function mergeGuestItems(cart, guestItems = []) {
  for (const item of guestItems) {
    if (!item?.productId || !item?.size || !item?.color) continue;

    // Guest-cart quantities come from client localStorage, never trust them
    // as-is — clamp to a sane positive integer before checking/storing.
    const quantity = Math.min(20, Math.max(1, Math.floor(Number(item.quantity))));
    if (!Number.isFinite(quantity)) continue;

    try {
      await assertVariantAvailable(item.productId, item.size, item.color, quantity);
    } catch {
      continue; // skip guest lines that are no longer valid (deleted/out of stock)
    }
    const existing = cart.items.find(
      (line) =>
        String(line.product) === String(item.productId) &&
        line.size === item.size &&
        line.color === item.color
    );
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.items.push({ product: item.productId, size: item.size, color: item.color, quantity });
    }
  }
  await cart.save();
  return cart;
}
