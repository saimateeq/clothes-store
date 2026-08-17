// Valid forward transitions for an order's fulfillment lifecycle. Terminal
// states (delivered/cancelled/refunded) have no forward transitions.
// cancelled/refunded are reachable from any non-terminal state.
const FORWARD_FLOW = ["pending", "confirmed", "processing", "shipped", "out_for_delivery", "delivered"];
const TERMINAL = ["delivered", "cancelled", "refunded"];

export function assertValidTransition(current, next) {
  if (current === next) return true;
  if (TERMINAL.includes(current)) return false;
  if (next === "cancelled" || next === "refunded") return true;

  const currentIndex = FORWARD_FLOW.indexOf(current);
  const nextIndex = FORWARD_FLOW.indexOf(next);
  return currentIndex !== -1 && nextIndex !== -1 && nextIndex === currentIndex + 1;
}
