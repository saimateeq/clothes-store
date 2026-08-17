import { Link } from "react-router-dom";
import { PackageSearch } from "lucide-react";
import { useListMyOrdersQuery } from "../features/orders/ordersApi";

const STATUS_LABELS = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

export default function OrdersList() {
  const { data, isLoading } = useListMyOrdersQuery();
  const orders = data?.data?.orders ?? [];

  if (isLoading) {
    return <div className="h-40 animate-pulse bg-line" />;
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 border border-line py-24 text-center">
        <PackageSearch size={28} strokeWidth={1} className="text-muted" />
        <h2 className="font-heading text-2xl">Your Orders Will Appear Here</h2>
        <p className="max-w-xs text-sm text-muted">
          Once you place an order, you'll be able to track it from this page.
        </p>
        <Link
          to="/shop"
          className="label mt-2 border border-ink px-6 py-3 transition-colors hover:bg-ink hover:text-bg"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <ul className="flex flex-col divide-y divide-line border-y border-line">
      {orders.map((order) => (
        <li key={order._id}>
          <Link
            to={`/orders/${order._id}`}
            className="flex items-center justify-between gap-4 py-5 text-sm"
          >
            <div className="flex flex-col gap-1">
              <span className="font-medium">#{order._id.slice(-8).toUpperCase()}</span>
              <span className="text-muted">{new Date(order.createdAt).toLocaleDateString()}</span>
            </div>
            <span className="label text-muted">{STATUS_LABELS[order.orderStatus]}</span>
            <span className="font-medium">${order.total.toFixed(2)}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
