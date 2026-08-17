import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { useGetOrderByIdQuery } from "../features/orders/ordersApi";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

export default function OrderSuccess() {
  useDocumentTitle("Order Confirmed");
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("order");
  const { data, isLoading } = useGetOrderByIdQuery(orderId, { skip: !orderId });
  const order = data?.data?.order;

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center gap-6 px-5 py-24 text-center sm:py-32">
      <CheckCircle2 size={40} strokeWidth={1} className="text-accent" />
      <span className="label text-accent">Order Confirmed</span>
      <h1 className="font-heading text-4xl sm:text-5xl">Thank You</h1>
      <p className="max-w-sm text-sm leading-relaxed text-muted">
        Your order has been placed and a confirmation has been sent to your email. We'll notify you
        as it ships.
      </p>

      {!isLoading && order && (
        <div className="mt-4 w-full max-w-sm border border-line p-6 text-left text-sm">
          <div className="flex justify-between border-b border-line pb-3">
            <span className="text-muted">Order Number</span>
            <span className="font-medium">{order._id.slice(-8).toUpperCase()}</span>
          </div>
          <div className="flex justify-between pt-3">
            <span className="text-muted">Total</span>
            <span className="font-medium">${order.total.toFixed(2)}</span>
          </div>
        </div>
      )}

      <div className="mt-4 flex gap-4">
        <Link
          to="/account/orders"
          className="label border border-ink px-8 py-4 transition-colors hover:bg-ink hover:text-bg"
        >
          View Orders
        </Link>
        <Link to="/shop" className="label border border-line px-8 py-4 text-muted hover:text-ink">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
