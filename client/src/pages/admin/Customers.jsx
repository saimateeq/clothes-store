import { Link } from "react-router-dom";
import { useListCustomersQuery, useSetCustomerActiveMutation } from "../../features/admin/adminApi";

export default function Customers() {
  const { data, isLoading } = useListCustomersQuery();
  const customers = data?.data?.customers ?? [];
  const [setActive] = useSetCustomerActiveMutation();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <span className="label text-accent">People</span>
        <h1 className="font-heading text-4xl">Customers</h1>
      </div>

      <div className="overflow-x-auto border border-line">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line bg-line/30 text-left text-muted">
              <th className="p-3 font-normal">Name</th>
              <th className="p-3 font-normal">Email</th>
              <th className="p-3 font-normal">Orders</th>
              <th className="p-3 font-normal">Total Spent</th>
              <th className="p-3 font-normal">Last Order</th>
              <th className="p-3 font-normal">Joined</th>
              <th className="p-3 font-normal">Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-muted">Loading…</td>
              </tr>
            ) : (
              customers.map((c) => (
                <tr key={c._id} className="border-b border-line last:border-0">
                  <td className="p-3">
                    <Link to={`/admin/customers/${c._id}`} className="link-underline font-medium">
                      {c.name}
                    </Link>
                  </td>
                  <td className="p-3 text-muted">{c.email}</td>
                  <td className="p-3">{c.totalOrders}</td>
                  <td className="p-3">${c.totalSpent.toFixed(2)}</td>
                  <td className="p-3 text-muted">{c.lastOrderAt ? new Date(c.lastOrderAt).toLocaleDateString() : "—"}</td>
                  <td className="p-3 text-muted">{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td className="p-3">
                    <button
                      type="button"
                      onClick={() => setActive({ id: c._id, isActive: !c.isActive })}
                      className={`label px-2 py-1 text-[10px] ${c.isActive ? "bg-ink text-bg" : "border border-line text-muted"}`}
                    >
                      {c.isActive ? "Active" : "Disabled"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
