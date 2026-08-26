import { useState } from "react";
import { Link } from "react-router-dom";
import { useListAllOrdersAdminQuery } from "../../features/admin/adminApi";
import MobileDataCard from "../../components/admin/MobileDataCard";

const STATUSES = ["", "pending", "confirmed", "processing", "shipped", "out_for_delivery", "delivered", "cancelled", "refunded"];

export default function Orders() {
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const { data, isLoading } = useListAllOrdersAdminQuery({ status: status || undefined, page, limit: 20 });
  const orders = data?.data?.orders ?? [];
  const pages = data?.data?.pages ?? 1;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <span className="label text-accent">Fulfillment</span>
          <h1 className="font-heading text-4xl">Orders</h1>
        </div>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="border border-line bg-bg px-3 py-2 text-sm outline-none"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s ? s.replace(/_/g, " ") : "All statuses"}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="border border-line p-6 text-center text-sm text-muted">Loading…</div>
      ) : orders.length === 0 ? (
        <div className="border border-line p-6 text-center text-sm text-muted">No orders found.</div>
      ) : (
        <>
          {/* Desktop / tablet: full comparison table */}
          <div className="hidden overflow-x-auto border border-line md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line bg-line/30 text-left text-muted">
                  <th className="p-3 font-normal">Order</th>
                  <th className="p-3 font-normal">Customer</th>
                  <th className="p-3 font-normal">Date</th>
                  <th className="p-3 font-normal">Items</th>
                  <th className="p-3 font-normal">Total</th>
                  <th className="p-3 font-normal">Payment</th>
                  <th className="p-3 font-normal">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id} className="border-b border-line last:border-0">
                    <td className="p-3">
                      <Link to={`/admin/orders/${order._id}`} className="link-underline font-medium">
                        #{order._id.slice(-8).toUpperCase()}
                      </Link>
                    </td>
                    <td className="p-3 text-muted">{order.user?.name}</td>
                    <td className="p-3 text-muted">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="p-3 text-muted">{order.items.length}</td>
                    <td className="p-3">${order.total.toFixed(2)}</td>
                    <td className="p-3 capitalize text-muted">{order.paymentStatus}</td>
                    <td className="p-3">
                      <span className="label border border-line px-2 py-1 text-[10px] capitalize">
                        {order.orderStatus.replace(/_/g, " ")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: stacked cards instead of horizontal scroll */}
          <div className="flex flex-col gap-3 md:hidden">
            {orders.map((order) => (
              <MobileDataCard
                key={order._id}
                title={`#${order._id.slice(-8).toUpperCase()}`}
                titleTo={`/admin/orders/${order._id}`}
                status={
                  <span className="label shrink-0 border border-line px-2 py-1 text-[10px] capitalize">
                    {order.orderStatus.replace(/_/g, " ")}
                  </span>
                }
                fields={[
                  { label: "Customer", value: order.user?.name },
                  { label: "Date", value: new Date(order.createdAt).toLocaleDateString() },
                  { label: "Items", value: order.items.length },
                  { label: "Total", value: `$${order.total.toFixed(2)}` },
                  { label: "Payment", value: <span className="capitalize">{order.paymentStatus}</span> },
                ]}
              />
            ))}
          </div>
        </>
      )}

      {pages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="label text-xs disabled:opacity-30">
            Previous
          </button>
          <span className="text-xs text-muted">Page {page} of {pages}</span>
          <button type="button" onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page >= pages} className="label text-xs disabled:opacity-30">
            Next
          </button>
        </div>
      )}
    </div>
  );
}
