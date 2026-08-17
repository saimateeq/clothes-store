import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../features/auth/authSlice";
import { useListAddressesQuery } from "../../features/auth/authApi";
import { useListMyOrdersQuery } from "../../features/orders/ordersApi";
import { useWishlist } from "../../context/WishlistContext";

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

export default function Overview() {
  const user = useSelector(selectCurrentUser);
  const { data } = useListAddressesQuery();
  const addressCount = data?.data?.addresses?.length ?? 0;
  const { count: wishlistCount } = useWishlist();
  const { data: ordersData } = useListMyOrdersQuery();
  const orders = ordersData?.data?.orders ?? [];
  const recentOrders = orders.slice(0, 3);

  const stats = [
    { label: "Total Orders", value: String(orders.length) },
    { label: "Wishlist Items", value: String(wishlistCount) },
    { label: "Saved Addresses", value: String(addressCount) },
  ];

  return (
    <div className="flex flex-col gap-10">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="border border-line p-6">
            <span className="font-heading text-4xl">{stat.value}</span>
            <p className="label mt-2 text-muted">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="border border-line p-6">
        <h2 className="label mb-4 text-muted">Account Information</h2>
        <dl className="flex flex-col gap-3 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">Name</dt>
            <dd>{user?.name}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Email</dt>
            <dd>{user?.email}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Member Since</dt>
            <dd>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}</dd>
          </div>
        </dl>
      </div>

      <div className="border border-line p-6">
        <h2 className="label mb-4 text-muted">Recent Orders</h2>
        {recentOrders.length === 0 ? (
          <p className="text-sm text-muted">
            Your orders will appear here.{" "}
            <Link to="/shop" className="link-underline text-ink">
              Start shopping →
            </Link>
          </p>
        ) : (
          <ul className="flex flex-col divide-y divide-line">
            {recentOrders.map((order) => (
              <li key={order._id}>
                <Link
                  to={`/orders/${order._id}`}
                  className="flex items-center justify-between gap-4 py-4 text-sm first:pt-0 last:pb-0"
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
        )}
      </div>
    </div>
  );
}
