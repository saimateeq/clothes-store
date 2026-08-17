import { Download } from "lucide-react";
import { useListNewsletterSubscribersQuery } from "../../features/admin/adminApi";

function downloadCsv(subscribers) {
  const rows = [["Email", "Status", "Subscribed On"], ...subscribers.map((s) => [s.email, s.status, new Date(s.createdAt).toISOString()])];
  const csv = rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "velora-newsletter-subscribers.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function Newsletter() {
  const { data, isLoading } = useListNewsletterSubscribersQuery();
  const subscribers = data?.data?.subscribers ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="label text-accent">Marketing</span>
          <h1 className="font-heading text-4xl">Newsletter</h1>
        </div>
        <button
          type="button"
          onClick={() => downloadCsv(subscribers)}
          disabled={subscribers.length === 0}
          className="label flex items-center gap-2 border border-ink px-6 py-3 hover:bg-ink hover:text-bg disabled:opacity-40"
        >
          <Download size={14} /> Export CSV
        </button>
      </div>

      <div className="overflow-x-auto border border-line">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line bg-line/30 text-left text-muted">
              <th className="p-3 font-normal">Email</th>
              <th className="p-3 font-normal">Status</th>
              <th className="p-3 font-normal">Subscribed</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={3} className="p-6 text-center text-muted">Loading…</td>
              </tr>
            ) : subscribers.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-6 text-center text-muted">No subscribers yet.</td>
              </tr>
            ) : (
              subscribers.map((s) => (
                <tr key={s._id} className="border-b border-line last:border-0">
                  <td className="p-3">{s.email}</td>
                  <td className="p-3 capitalize text-muted">{s.status}</td>
                  <td className="p-3 text-muted">{new Date(s.createdAt).toLocaleDateString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
