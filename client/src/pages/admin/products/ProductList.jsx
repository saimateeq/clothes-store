import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Copy, Pencil, Trash2, Search } from "lucide-react";
import {
  useListProductsAdminQuery,
  useSetProductActiveMutation,
  useDeleteProductMutation,
} from "../../../features/products/productsApi";
import { useBulkUpdateProductsMutation, useDuplicateProductMutation } from "../../../features/admin/adminApi";
import MobileDataCard from "../../../components/admin/MobileDataCard";

export default function ProductList() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState([]);

  const { data, isLoading } = useListProductsAdminQuery({ q: search || undefined, page, limit: 20 });
  const products = data?.data?.products ?? [];
  const pages = data?.data?.pages ?? 1;

  const [setActive] = useSetProductActiveMutation();
  const [deleteProduct] = useDeleteProductMutation();
  const [bulkUpdate] = useBulkUpdateProductsMutation();
  const [duplicateProduct] = useDuplicateProductMutation();

  const toggleSelect = (id) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  const toggleSelectAll = () =>
    setSelected(selected.length === products.length ? [] : products.map((p) => p._id));

  const handleBulk = async (action) => {
    if (selected.length === 0) return;
    if (action === "delete" && !confirm(`Delete ${selected.length} product(s)? This cannot be undone.`)) return;
    await bulkUpdate({ ids: selected, action });
    setSelected([]);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <span className="label text-accent">Catalog</span>
          <h1 className="font-heading text-4xl">Products</h1>
        </div>
        <Link to="/admin/products/new" className="label flex w-fit items-center gap-2 bg-ink px-6 py-3 text-bg hover:opacity-85">
          <Plus size={14} /> New Product
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex flex-1 items-center gap-2 border border-line px-3 py-2">
          <Search size={14} className="text-muted" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search products…"
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>
        {selected.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted">{selected.length} selected</span>
            <button type="button" onClick={() => handleBulk("activate")} className="label border border-line px-3 py-2 text-xs hover:border-ink">
              Activate
            </button>
            <button type="button" onClick={() => handleBulk("deactivate")} className="label border border-line px-3 py-2 text-xs hover:border-ink">
              Deactivate
            </button>
            <button type="button" onClick={() => handleBulk("delete")} className="label border border-line px-3 py-2 text-xs text-accent hover:border-accent">
              Delete
            </button>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="border border-line p-6 text-center text-sm text-muted">Loading…</div>
      ) : products.length === 0 ? (
        <div className="border border-line p-6 text-center text-sm text-muted">No products found.</div>
      ) : (
        <>
          {/* Desktop / tablet: full comparison table */}
          <div className="hidden overflow-x-auto border border-line md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line bg-line/30 text-left text-muted">
                  <th className="w-10 p-3">
                    <input type="checkbox" checked={selected.length === products.length && products.length > 0} onChange={toggleSelectAll} className="accent-ink" />
                  </th>
                  <th className="p-3 font-normal">Product</th>
                  <th className="p-3 font-normal">SKU</th>
                  <th className="p-3 font-normal">Category</th>
                  <th className="p-3 font-normal">Price</th>
                  <th className="p-3 font-normal">Stock</th>
                  <th className="p-3 font-normal">Status</th>
                  <th className="p-3 font-normal">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const stock = p.variants?.reduce((sum, v) => sum + v.inventory, 0) ?? 0;
                  return (
                    <tr key={p._id} className="border-b border-line last:border-0">
                      <td className="p-3">
                        <input type="checkbox" checked={selected.includes(p._id)} onChange={() => toggleSelect(p._id)} className="accent-ink" />
                      </td>
                      <td className="flex items-center gap-3 p-3">
                        <img src={p.images?.[0]?.url} alt="" className="h-12 w-10 object-cover" />
                        <span className="font-medium">{p.name}</span>
                      </td>
                      <td className="p-3 text-muted">{p.sku}</td>
                      <td className="p-3 text-muted">{p.category?.name}</td>
                      <td className="p-3">${p.price}</td>
                      <td className={`p-3 ${stock <= (p.lowStockThreshold ?? 5) ? "text-accent" : ""}`}>{stock}</td>
                      <td className="p-3">
                        <button
                          type="button"
                          onClick={() => setActive({ id: p._id, isActive: !p.isActive })}
                          className={`label px-2 py-1 text-[10px] ${p.isActive ? "bg-ink text-bg" : "border border-line text-muted"}`}
                        >
                          {p.isActive ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-3 text-muted">
                          <Link to={`/admin/products/${p._id}/edit`} aria-label="Edit" className="hover:text-ink">
                            <Pencil size={14} />
                          </Link>
                          <button type="button" onClick={() => duplicateProduct(p._id)} aria-label="Duplicate" className="hover:text-ink">
                            <Copy size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => confirm(`Delete "${p.name}"? This cannot be undone.`) && deleteProduct(p._id)}
                            aria-label="Delete"
                            className="hover:text-accent"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile: stacked cards instead of horizontal scroll */}
          <div className="flex flex-col gap-3 md:hidden">
            {products.map((p) => {
              const stock = p.variants?.reduce((sum, v) => sum + v.inventory, 0) ?? 0;
              return (
                <MobileDataCard
                  key={p._id}
                  title={
                    <div className="flex min-w-0 items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selected.includes(p._id)}
                        onChange={() => toggleSelect(p._id)}
                        className="shrink-0 accent-ink"
                        aria-label={`Select ${p.name}`}
                      />
                      <img src={p.images?.[0]?.url} alt="" className="h-12 w-10 shrink-0 object-cover" />
                      <Link to={`/admin/products/${p._id}/edit`} className="link-underline truncate font-medium">
                        {p.name}
                      </Link>
                    </div>
                  }
                  status={
                    <button
                      type="button"
                      onClick={() => setActive({ id: p._id, isActive: !p.isActive })}
                      className={`label shrink-0 px-2 py-1 text-[10px] ${p.isActive ? "bg-ink text-bg" : "border border-line text-muted"}`}
                    >
                      {p.isActive ? "Active" : "Inactive"}
                    </button>
                  }
                  fields={[
                    { label: "SKU", value: p.sku },
                    { label: "Category", value: p.category?.name },
                    { label: "Price", value: `$${p.price}` },
                    {
                      label: "Stock",
                      value: <span className={stock <= (p.lowStockThreshold ?? 5) ? "text-accent" : ""}>{stock}</span>,
                    },
                  ]}
                  actions={
                    <>
                      <Link to={`/admin/products/${p._id}/edit`} aria-label="Edit" className="flex items-center gap-2 text-xs text-muted hover:text-ink">
                        <Pencil size={14} /> Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => duplicateProduct(p._id)}
                        aria-label="Duplicate"
                        className="flex items-center gap-2 text-xs text-muted hover:text-ink"
                      >
                        <Copy size={14} /> Duplicate
                      </button>
                      <button
                        type="button"
                        onClick={() => confirm(`Delete "${p.name}"? This cannot be undone.`) && deleteProduct(p._id)}
                        aria-label="Delete"
                        className="flex items-center gap-2 text-xs text-muted hover:text-accent"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </>
                  }
                />
              );
            })}
          </div>
        </>
      )}

      {pages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="label text-xs disabled:opacity-30">
            Previous
          </button>
          <span className="text-xs text-muted">
            Page {page} of {pages}
          </span>
          <button type="button" onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page >= pages} className="label text-xs disabled:opacity-30">
            Next
          </button>
        </div>
      )}
    </div>
  );
}
