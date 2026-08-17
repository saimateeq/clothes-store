import { useParams, Link } from "react-router-dom";
import { useGetCustomerByIdQuery } from "../../features/admin/adminApi";

export default function CustomerDetail() {
  const { id } = useParams();
  const { data, isLoading } = useGetCustomerByIdQuery(id);
  const customer = data?.data?.customer;
  const orders = data?.data?.orders ?? [];

  if (isLoading || !customer) return <div className="h-64 animate-pulse bg-line" />;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <span className="label text-accent">Customer</span>
        <h1 className="font-heading text-4xl">{customer.name}</h1>
        <p className="text-sm text-muted">{customer.email}</p>
      </div>

      <div className="border border-line p-6">
        <h2 className="label mb-4 text-muted">Orders</h2>
        {orders.length === 0 ? (
          <p className="text-sm text-muted">No orders yet.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-line">
            {orders.map((o) => (
              <li key={o._id}>
                <Link to={`/admin/orders/${o._id}`} className="flex items-center justify-between py-3 text-sm">
                  <span>#{o._id.slice(-8).toUpperCase()}</span>
                  <span className="label capitalize text-muted">{o.orderStatus.replace(/_/g, " ")}</span>
                  <span>${o.total.toFixed(2)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
