import { Link } from "react-router-dom";
import { useListCustomersQuery, useSetCustomerActiveMutation } from "../../features/admin/adminApi";
import MobileDataCard from "../../components/admin/MobileDataCard";

function StatusToggle({ isActive, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`label shrink-0 px-2 py-1 text-[10px] ${isActive ? "bg-ink text-bg" : "border border-line text-muted"}`}
    >
      {isActive ? "Active" : "Disabled"}
    </button>
  );
}

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

      {isLoading ? (
        <div className="border border-line p-6 text-center text-sm text-muted">Loading…</div>
      ) : (
        <>
          {/* Desktop / tablet: full comparison table */}
          <div className="hidden overflow-x-auto border border-line md:block">
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
                {customers.map((c) => (
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
                      <StatusToggle isActive={c.isActive} onToggle={() => setActive({ id: c._id, isActive: !c.isActive })} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: stacked cards instead of horizontal scroll */}
          <div className="flex flex-col gap-3 md:hidden">
            {customers.map((c) => (
              <MobileDataCard
                key={c._id}
                title={c.name}
                titleTo={`/admin/customers/${c._id}`}
                status={<StatusToggle isActive={c.isActive} onToggle={() => setActive({ id: c._id, isActive: !c.isActive })} />}
                fields={[
                  { label: "Email", value: c.email },
                  { label: "Orders", value: c.totalOrders },
                  { label: "Total Spent", value: `$${c.totalSpent.toFixed(2)}` },
                  { label: "Last Order", value: c.lastOrderAt ? new Date(c.lastOrderAt).toLocaleDateString() : "—" },
                  { label: "Joined", value: new Date(c.createdAt).toLocaleDateString() },
                ]}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
