import { ApiError } from "../utils/ApiError.js";
import Product from "../models/Product.js";

// Atomically decrements each line's variant inventory, guarded by an
// inventory >= quantity condition in the same update — this is what
// actually prevents overselling under concurrent checkouts (two shoppers
// racing for the last unit), not just the pre-check in
// checkoutPricingService. If any line fails partway through, already-applied
// decrements are rolled back so a failed order never leaves stock short.
export async function decrementInventoryForLines(lines) {
  const applied = [];

  for (const line of lines) {
    const result = await Product.updateOne(
      { _id: line.productId, "variants.size": line.size, "variants.color": line.color, "variants.inventory": { $gte: line.quantity } },
      { $inc: { "variants.$.inventory": -line.quantity } }
    );

    if (result.modifiedCount !== 1) {
      await rollback(applied);
      throw ApiError.conflict(
        `${line.name} (${line.color} / ${line.size}) just sold out — please update your bag.`
      );
    }
    applied.push(line);
  }
}

async function rollback(lines) {
  for (const line of lines) {
    await Product.updateOne(
      { _id: line.productId, "variants.size": line.size, "variants.color": line.color },
      { $inc: { "variants.$.inventory": line.quantity } }
    );
  }
}
