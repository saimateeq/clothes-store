import { useState } from "react";
import { useParams } from "react-router-dom";
import { useGetOrderByIdQuery, useUpdateOrderStatusMutation } from "../../features/orders/ordersApi";

const STATUSES = ["pending", "confirmed", "processing", "shipped", "out_for_delivery", "delivered", "cancelled", "refunded"];

export default function OrderDetail() {
  const { id } = useParams();
  const { data, isLoading } = useGetOrderByIdQuery(id);
  const order = data?.data?.order;

  const [nextStatus, setNextStatus] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [note, setNote] = useState("");
  const [updateStatus, { isLoading: isUpdating, error }] = useUpdateOrderStatusMutation();

  if (isLoading || !order) return <div className="h-96 animate-pulse bg-line" />;

  const handleUpdate = async () => {
    if (!nextStatus) return;
    await updateStatus({ id, orderStatus: nextStatus, trackingNumber: trackingNumber || undefined, note: note || undefined });
    setNextStatus("");
    setNote("");
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <span className="label text-accent">Order #{order._id.slice(-8).toUpperCase()}</span>
        <h1 className="font-heading text-4xl">Order Details</h1>
        <p className="text-sm text-muted">Placed {new Date(order.createdAt).toLocaleString()}</p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-8">
          <div className="border border-line p-6">
            <h2 className="label mb-4 text-muted">Items</h2>
            <ul className="flex flex-col divide-y divide-line">
              {order.items.map((item, i) => (
                <li key={i} className="flex gap-4 py-4">
                  <img src={item.image} alt="" className="h-20 w-16 object-cover" />
                  <div className="flex flex-1 flex-col justify-center text-sm">
                    <span className="font-medium">{item.name}</span>
                    <span className="text-muted">
                      {item.color} / {item.size} × {item.quantity}
                    </span>
                  </div>
                  <span className="text-sm">${(item.price * item.quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="border border-line p-6">
              <h2 className="label mb-3 text-muted">Shipping Address</h2>
              <p className="text-sm leading-relaxed">
                {order.shippingAddress.fullName}
                <br />
                {order.shippingAddress.line1}
                {order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ""}
                <br />
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                <br />
                {order.shippingAddress.country}
                <br />
                {order.shippingAddress.phone}
              </p>
            </div>
            <div className="border border-line p-6">
              <h2 className="label mb-3 text-muted">Customer</h2>
              <p className="text-sm">{order.user?.name ?? order.user}</p>
              <p className="text-sm text-muted">{order.user?.email}</p>
            </div>
          </div>

          <div className="border border-line p-6">
            <h2 className="label mb-3 text-muted">Status Timeline</h2>
            <ul className="flex flex-col gap-2 text-sm">
              {order.statusHistory.map((entry, i) => (
                <li key={i} className="flex justify-between">
                  <span className="capitalize">{entry.status.replace(/_/g, " ")}</span>
                  <span className="text-muted">{new Date(entry.at).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="border border-line p-6">
            <h2 className="label mb-4 text-muted">Payment Summary</h2>
            <dl className="flex flex-col gap-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Payment Method</dt>
                <dd>{order.paymentMethod === "cod" ? "Cash on Delivery" : "Card"}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Subtotal</dt>
                <dd>${order.subtotal.toFixed(2)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Shipping</dt>
                <dd>${order.shipping.toFixed(2)}</dd>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between">
                  <dt className="text-muted">Discount</dt>
                  <dd>-${order.discount.toFixed(2)}</dd>
                </div>
              )}
              <div className="flex justify-between border-t border-line pt-2 font-medium">
                <dt>Total</dt>
                <dd>${order.total.toFixed(2)}</dd>
              </div>
            </dl>
          </div>

          <div className="border border-line p-6">
            <h2 className="label mb-4 text-muted">Update Status</h2>
            <div className="flex flex-col gap-3">
              <select value={nextStatus} onChange={(e) => setNextStatus(e.target.value)} className="border border-line bg-bg px-3 py-2 text-sm outline-none">
                <option value="">Select status</option>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
              <input
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Tracking number (optional)"
                className="border border-line bg-transparent px-3 py-2 text-sm outline-none focus:border-ink"
              />
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Note (optional)"
                className="border border-line bg-transparent px-3 py-2 text-sm outline-none focus:border-ink"
              />
              {error && <p className="text-xs text-accent">{error.data?.message}</p>}
              <button
                type="button"
                onClick={handleUpdate}
                disabled={!nextStatus || isUpdating}
                className="label bg-ink py-3 text-bg transition-opacity hover:opacity-85 disabled:opacity-40"
              >
                Update Order
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
