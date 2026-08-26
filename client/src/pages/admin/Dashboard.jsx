import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";
import { TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { useGetDashboardQuery } from "../../features/admin/adminApi";

const RANGES = [
  { value: "7d", label: "7 Days" },
  { value: "30d", label: "30 Days" },
  { value: "90d", label: "90 Days" },
  { value: "1y", label: "1 Year" },
];

function StatCard({ label, value, change }) {
  const positive = change >= 0;
  return (
    <div className="border border-line p-5">
      <span className="label text-muted">{label}</span>
      <div className="mt-2 flex items-end justify-between flex-wrap gap-2">
        <span className="font-heading text-3xl">{value}</span>
        {change !== undefined && (
          <span className={`flex items-center gap-1 text-xs ${positive ? "text-accent" : "text-muted"}`}>
            {positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(change)}%
          </span>
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [range, setRange] = useState("30d");
  const { data, isLoading } = useGetDashboardQuery(range);
  const d = data?.data;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <span className="label text-accent">Overview</span>
          <h1 className="font-heading text-4xl">Dashboard</h1>
        </div>
        <div className="flex gap-1 border border-line p-1">
          {RANGES.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => setRange(r.value)}
              className={`label px-3 py-1.5 text-xs transition-colors ${
                range === r.value ? "bg-ink text-bg" : "text-muted hover:text-ink"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="h-96 animate-pulse bg-line" />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            <StatCard label="Revenue" value={`$${d.overview.revenue.toFixed(2)}`} change={d.overview.revenueChange} />
            <StatCard label="Orders" value={d.overview.orders} change={d.overview.ordersChange} />
            <StatCard label="Avg Order Value" value={`$${d.overview.averageOrderValue.toFixed(2)}`} />
            <StatCard label="New Customers" value={d.overview.newCustomers} />
            <StatCard label="Products Sold" value={d.overview.productsSold} />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="border border-line p-5 lg:col-span-2">
              <h2 className="label mb-6 text-muted">Revenue Over Time</h2>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={d.revenueOverTime}>
                  <defs>
                    <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#B89B72" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#B89B72" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#E3DFD6" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#6F6A61" }} axisLine={{ stroke: "#E3DFD6" }} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#6F6A61" }} axisLine={false} tickLine={false} width={40} />
                  <Tooltip
                    contentStyle={{ border: "1px solid #E3DFD6", borderRadius: 0, fontSize: 12 }}
                    formatter={(value) => [`$${value.toFixed(2)}`, "Revenue"]}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#171717" strokeWidth={1.5} fill="url(#revenueFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="border border-line p-5">
              <h2 className="label mb-6 text-muted">Sales by Category</h2>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={d.salesByCategory} layout="vertical" margin={{ left: 10 }}>
                  <CartesianGrid stroke="#E3DFD6" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "#6F6A61" }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="category" type="category" tick={{ fontSize: 11, fill: "#171717" }} axisLine={false} tickLine={false} width={80} />
                  <Tooltip
                    contentStyle={{ border: "1px solid #E3DFD6", borderRadius: 0, fontSize: 12 }}
                    formatter={(value) => [`$${value.toFixed(2)}`, "Revenue"]}
                  />
                  <Bar dataKey="revenue" fill="#B89B72" barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="border border-line p-5 lg:col-span-2">
              <h2 className="label mb-4 text-muted">Recent Orders</h2>
              {d.recentOrders.length === 0 ? (
                <p className="text-sm text-muted">No orders yet.</p>
              ) : (
                <ul className="flex flex-col divide-y divide-line">
                  {d.recentOrders.map((order) => (
                    <li key={order._id}>
                      <Link to={`/admin/orders/${order._id}`} className="flex items-center justify-between py-3 text-sm">
                        <span>{order.user?.name}</span>
                        <span className="label text-muted">{order.orderStatus}</span>
                        <span>${order.total.toFixed(2)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="border border-line p-5">
              <h2 className="label mb-4 flex items-center gap-2 text-muted">
                <AlertTriangle size={13} /> Low Stock
              </h2>
              {d.lowStock.length === 0 ? (
                <p className="text-sm text-muted">Everything is well stocked.</p>
              ) : (
                <ul className="flex flex-col divide-y divide-line">
                  {d.lowStock.map((p) => (
                    <li key={p._id} className="flex items-center justify-between py-3 text-sm">
                      <Link to={`/admin/products/${p._id}/edit`} className="link-underline">
                        {p.name}
                      </Link>
                      <span className="text-accent">{p.totalInventory} left</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="border border-line p-5">
            <h2 className="label mb-4 text-muted">Top Products</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {d.topProducts.map((p) => (
                <div key={p._id} className="flex flex-col gap-2">
                  <img src={p.image} alt="" className="aspect-[3/4] w-full object-cover" />
                  <span className="text-sm font-medium">{p.name}</span>
                  <span className="text-xs text-muted">
                    {p.unitsSold} sold · ${p.revenue.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
