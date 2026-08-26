import { useParams } from "react-router-dom";
import { Check } from "lucide-react";
import { useGetOrderByIdQuery } from "../features/orders/ordersApi";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

const TRACKING_STEPS = [
  { key: "confirmed", label: "Order Placed" },
  { key: "processing", label: "Processing" },
  { key: "shipped", label: "Shipped" },
  { key: "out_for_delivery", label: "Out for Delivery" },
  { key: "delivered", label: "Delivered" },
];

function TrackingTimeline({ status }) {
  if (status === "cancelled" || status === "refunded") {
    return (
      <div className="border border-line p-6 text-sm">
        This order was <span className="font-medium capitalize">{status}</span>.
      </div>
    );
  }

  const currentIndex = TRACKING_STEPS.findIndex((s) => s.key === status);

  return (
    <div className="flex flex-col gap-0 sm:flex-row sm:items-start">
      {TRACKING_STEPS.map((step, i) => {
        const reached = i <= Math.max(currentIndex, 0);
        return (
          <div key={step.key} className="flex flex-1 items-center sm:flex-col sm:items-center">
            <div className="flex items-center sm:flex-col">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs ${
                  reached ? "border-ink bg-ink text-bg" : "border-line text-muted"
                }`}
              >
                {reached ? <Check size={13} /> : i + 1}
              </div>
              {i < TRACKING_STEPS.length - 1 && (
                <div
                  className={`mx-2 h-px w-8 sm:my-2 sm:h-8 sm:w-px ${
                    i < currentIndex ? "bg-ink" : "bg-line"
                  }`}
                />
              )}
            </div>
            <span className={`label mt-0 sm:mt-2 sm:text-center ${reached ? "text-ink" : "text-muted"}`}>
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function OrderDetails() {
  const { id } = useParams();
  const { data, isLoading } = useGetOrderByIdQuery(id);
  const order = data?.data?.order;

  useDocumentTitle(order ? `Order #${order._id.slice(-8).toUpperCase()}` : "Order Details");

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1000px] px-5 py-16">
        <div className="h-64 animate-pulse bg-line" />
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="mx-auto max-w-[1000px] px-5 py-12 sm:px-8 lg:py-16">
      <div className="mb-10 flex flex-col gap-2">
        <span className="label text-accent">Order #{order._id.slice(-8).toUpperCase()}</span>
        <h1 className="font-heading text-4xl sm:text-5xl">Order Details</h1>
        <p className="text-sm text-muted">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
      </div>

      <div className="mb-12 overflow-x-auto border border-line p-6 sm:p-8">
        <TrackingTimeline status={order.orderStatus} />
        {order.trackingNumber && (
          <p className="mt-6 text-sm text-muted">
            Tracking number: <span className="text-ink">{order.trackingNumber}</span>
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_320px]">
        <div>
          <h2 className="label mb-4 text-muted">Items</h2>
          <ul className="flex flex-col divide-y divide-line border-y border-line">
            {order.items.map((item, i) => (
              <li key={i} className="flex gap-4 py-5">
                <img src={item.image} alt="" className="h-24 w-20 object-cover" />
                <div className="flex flex-1 flex-col justify-center gap-1 text-sm">
                  <span className="font-heading text-lg">{item.name}</span>
                  <span className="text-muted">
                    {item.color} / {item.size} × {item.quantity}
                  </span>
                </div>
                <span className="text-sm">${(item.price * item.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-8">
          <div>
            <h2 className="label mb-3 text-muted">Shipping Address</h2>
            <p className="text-sm leading-relaxed">
              {order.shippingAddress.fullName}
              <br />
              {order.shippingAddress.line1}
              {order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ""}
              <br />
              {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
              {order.shippingAddress.postalCode}
              <br />
              {order.shippingAddress.country}
            </p>
          </div>

          <div>
            <h2 className="label mb-3 text-muted">Payment Summary</h2>
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
                <dd>{order.shipping === 0 ? "Free" : `$${order.shipping.toFixed(2)}`}</dd>
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
        </div>
      </div>
    </div>
  );
}
