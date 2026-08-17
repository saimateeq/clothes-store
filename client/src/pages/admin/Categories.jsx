import { useState } from "react";
import { useForm } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import {
  useListCategoriesQuery,
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
} from "../../features/categories/categoriesApi";

function flatten(tree, depth = 0) {
  return tree.flatMap((cat) => [{ ...cat, depth }, ...flatten(cat.children ?? [], depth + 1)]);
}

export default function Categories() {
  const [showForm, setShowForm] = useState(false);
  const { data, isLoading } = useListCategoriesQuery({ flat: false });
  const flatCategories = flatten(data?.data?.categories ?? []);

  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = async (values) => {
    const res = await createCategory({ ...values, parent: values.parent || null }).unwrap().catch(() => null);
    if (res) {
      reset();
      setShowForm(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="label text-accent">Catalog</span>
          <h1 className="font-heading text-4xl">Categories</h1>
        </div>
        <button type="button" onClick={() => setShowForm((v) => !v)} className="label flex items-center gap-2 bg-ink px-6 py-3 text-bg hover:opacity-85">
          <Plus size={14} /> New Category
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 border border-line p-6 sm:grid-cols-3">
          <label className="flex flex-col gap-2">
            <span className="label text-muted">Name</span>
            <input {...register("name", { required: true })} className="border border-line bg-transparent px-4 py-2.5 text-sm outline-none focus:border-ink" />
          </label>
          <label className="flex flex-col gap-2">
            <span className="label text-muted">Parent</span>
            <select {...register("parent")} className="border border-line bg-transparent px-4 py-2.5 text-sm outline-none focus:border-ink">
              <option value="">None (top-level)</option>
              {flatCategories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-2">
            <span className="label text-muted">Sort Order</span>
            <input type="number" {...register("sortOrder")} className="border border-line bg-transparent px-4 py-2.5 text-sm outline-none focus:border-ink" />
          </label>
          <button type="submit" disabled={isCreating} className="label col-span-full w-fit bg-ink px-6 py-3 text-bg hover:opacity-85 disabled:opacity-50">
            Save Category
          </button>
        </form>
      )}

      <div className="border border-line">
        {isLoading ? (
          <div className="p-6 text-sm text-muted">Loading…</div>
        ) : (
          <ul className="divide-y divide-line">
            {flatCategories.map((cat) => (
              <li key={cat._id} className="flex items-center justify-between p-4 text-sm">
                <span style={{ paddingLeft: `${cat.depth * 20}px` }}>{cat.name}</span>
                <button
                  type="button"
                  onClick={() => confirm(`Delete "${cat.name}"?`) && deleteCategory(cat._id)}
                  className="text-muted hover:text-accent"
                >
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
