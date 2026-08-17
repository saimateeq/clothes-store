import asyncHandler from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ok } from "../utils/apiResponse.js";
import {
  getOrCreateCart,
  hydrateCart,
  pruneInvalidItems,
  addOrIncrementItem,
  mergeGuestItems,
  assertVariantAvailable,
} from "../services/cartService.js";

async function respondWithCart(res, cart, message = "Success") {
  let { lines, subtotal, requiresPrune } = await hydrateCart(cart);
  if (requiresPrune) {
    cart = await pruneInvalidItems(cart);
    ({ lines, subtotal } = await hydrateCart(cart));
  }
  ok(res, { items: lines, subtotal, count: lines.reduce((n, l) => n + l.quantity, 0) }, message);
}

export const getCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  await respondWithCart(res, cart);
});

export const addItem = asyncHandler(async (req, res) => {
  const { productId, size, color, quantity } = req.body;

  const cart = await getOrCreateCart(req.user._id);
  await addOrIncrementItem(cart, { productId, size, color, quantity });
  await respondWithCart(res, cart, "Added to bag");
});

export const updateItem = asyncHandler(async (req, res) => {
  const { productId, size, color } = req.params;
  const { quantity } = req.body;

  const cart = await getOrCreateCart(req.user._id);
  const item = cart.items.find(
    (i) => String(i.product) === productId && i.size === size && i.color === color
  );
  if (!item) throw ApiError.notFound("Cart item not found");

  await assertVariantAvailable(productId, size, color, quantity);
  item.quantity = quantity;
  await cart.save();
  await respondWithCart(res, cart, "Cart updated");
});

export const removeItem = asyncHandler(async (req, res) => {
  const { productId, size, color } = req.params;
  const cart = await getOrCreateCart(req.user._id);
  cart.items = cart.items.filter(
    (i) => !(String(i.product) === productId && i.size === size && i.color === color)
  );
  await cart.save();
  await respondWithCart(res, cart, "Removed from bag");
});

export const clearCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  cart.items = [];
  await cart.save();
  await respondWithCart(res, cart, "Bag cleared");
});

export const mergeCart = asyncHandler(async (req, res) => {
  const { items = [] } = req.body;
  const cart = await getOrCreateCart(req.user._id);
  await mergeGuestItems(cart, items);
  await respondWithCart(res, cart, "Cart merged");
});
