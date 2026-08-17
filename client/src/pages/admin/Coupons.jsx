import { useState } from "react";
import { useForm } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { useListCouponsQuery, useCreateCouponMutation, useUpdateCouponMutation, useDeleteCouponMutation } from "../../features/coupons/couponsApi";

export default function Coupons() {
  const [showForm, setShowForm] = useState(false);
  const { data, isLoading } = useListCouponsQuery();
  const coupons = data?.data?.coupons ?? [];

  const [createCoupon, { isLoading: isCreating, error }] = useCreateCouponMutation();
  const [updateCoupon] = useUpdateCouponMutation();
  const [deleteCoupon] = useDeleteCouponMutation();

  const {
    register,
    handleSubmit,
    reset,
  } = useForm({ defaultValues: { type: "percentage" } });

  const onSubmit = async (values) => {
    const res = await createCoupon({
      ...values,
      value: Number(values.value),
      minimumOrder: values.minimumOrder ? Number(values.minimumOrder) : undefined,
      maximumDiscount: values.maximumDiscount ? Number(values.maximumDiscount) : undefined,
      usageLimit: values.usageLimit ? Number(values.usageLimit) : undefined,
    })
      .unwrap()
      .catch(() => null);
    if (res) {
      reset();
      setShowForm(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="label text-accent">Marketing</span>
          <h1 className="font-heading text-4xl">Coupons</h1>
        </div>
        <button type="button" onClick={() => setShowForm((v) => !v)} className="label flex items-center gap-2 bg-ink px-6 py-3 text-bg hover:opacity-85">
          <Plus size={14} /> New Coupon
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 border border-line p-6 sm:grid-cols-3">
          <label className="flex flex-col gap-2">
            <span className="label text-muted">Code</span>
            <input {...register("code", { required: true })} className="border border-line bg-transparent px-4 py-2.5 text-sm outline-none focus:border-ink" />
          </label>
          <label className="flex flex-col gap-2">
            <span className="label text-muted">Type</span>
            <select {...register("type")} className="border border-line bg-bg px-4 py-2.5 text-sm outline-none">
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed Amount</option>
            </select>
          </label>
          <label className="flex flex-col gap-2">
            <span className="label text-muted">Value</span>
            <input type="number" step="0.01" {...register("value", { required: true })} className="border border-line bg-transparent px-4 py-2.5 text-sm outline-none focus:border-ink" />
          </label>
          <label className="flex flex-col gap-2">
            <span className="label text-muted">Minimum Order</span>
            <input type="number" step="0.01" {...register("minimumOrder")} className="border border-line bg-transparent px-4 py-2.5 text-sm outline-none focus:border-ink" />
          </label>
          <label className="flex flex-col gap-2">
            <span className="label text-muted">Max Discount</span>
            <input type="number" step="0.01" {...register("maximumDiscount")} className="border border-line bg-transparent px-4 py-2.5 text-sm outline-none focus:border-ink" />
          </label>
          <label className="flex flex-col gap-2">
            <span className="label text-muted">Usage Limit</span>
            <input type="number" {...register("usageLimit")} className="border border-line bg-transparent px-4 py-2.5 text-sm outline-none focus:border-ink" />
          </label>
          <label className="flex flex-col gap-2">
            <span className="label text-muted">Expiry Date</span>
            <input type="date" {...register("expiryDate", { required: true })} className="border border-line bg-transparent px-4 py-2.5 text-sm outline-none focus:border-ink" />
          </label>
          {error && <p className="col-span-full text-xs text-accent">{error.data?.message}</p>}
          <button type="submit" disabled={isCreating} className="label col-span-full w-fit bg-ink px-6 py-3 text-bg hover:opacity-85 disabled:opacity-50">
            Save Coupon
          </button>
        </form>
      )}

      <div className="overflow-x-auto border border-line">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line bg-line/30 text-left text-muted">
              <th className="p-3 font-normal">Code</th>
              <th className="p-3 font-normal">Discount</th>
              <th className="p-3 font-normal">Usage</th>
              <th className="p-3 font-normal">Expires</th>
              <th className="p-3 font-normal">Status</th>
              <th className="p-3 font-normal">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-muted">Loading…</td>
              </tr>
            ) : (
              coupons.map((c) => (
                <tr key={c._id} className="border-b border-line last:border-0">
                  <td className="p-3 font-medium">{c.code}</td>
                  <td className="p-3">{c.type === "percentage" ? `${c.value}%` : `$${c.value}`}</td>
                  <td className="p-3 text-muted">
                    {c.usedCount} / {c.usageLimit ?? "∞"}
                  </td>
                  <td className="p-3 text-muted">{new Date(c.expiryDate).toLocaleDateString()}</td>
                  <td className="p-3">
                    <button
                      type="button"
                      onClick={() => updateCoupon({ id: c._id, isActive: !c.isActive })}
                      className={`label px-2 py-1 text-[10px] ${c.isActive ? "bg-ink text-bg" : "border border-line text-muted"}`}
                    >
                      {c.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="p-3">
                    <button type="button" onClick={() => confirm(`Delete "${c.code}"?`) && deleteCoupon(c._id)} className="text-muted hover:text-accent">
                      <Trash2 size={14} />
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
