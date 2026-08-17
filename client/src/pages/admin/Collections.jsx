import { useState } from "react";
import { useForm } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import {
  useListCollectionsQuery,
  useCreateCollectionMutation,
  useDeleteCollectionMutation,
} from "../../features/collections/collectionsApi";

export default function Collections() {
  const [showForm, setShowForm] = useState(false);
  const { data, isLoading } = useListCollectionsQuery();
  const collections = data?.data?.collections ?? [];

  const [createCollection, { isLoading: isCreating }] = useCreateCollectionMutation();
  const [deleteCollection] = useDeleteCollectionMutation();

  const {
    register,
    handleSubmit,
    reset,
  } = useForm();

  const onSubmit = async (values) => {
    const res = await createCollection(values).unwrap().catch(() => null);
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
          <h1 className="font-heading text-4xl">Collections</h1>
        </div>
        <button type="button" onClick={() => setShowForm((v) => !v)} className="label flex items-center gap-2 bg-ink px-6 py-3 text-bg hover:opacity-85">
          <Plus size={14} /> New Collection
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4 border border-line p-6 sm:grid-cols-2">
          <label className="flex flex-col gap-2">
            <span className="label text-muted">Name</span>
            <input {...register("name", { required: true })} className="border border-line bg-transparent px-4 py-2.5 text-sm outline-none focus:border-ink" />
          </label>
          <label className="flex flex-col gap-2">
            <span className="label text-muted">Tagline</span>
            <input {...register("tagline")} className="border border-line bg-transparent px-4 py-2.5 text-sm outline-none focus:border-ink" />
          </label>
          <label className="flex flex-col gap-2 sm:col-span-2">
            <span className="label text-muted">Description</span>
            <textarea {...register("description")} rows={2} className="border border-line bg-transparent px-4 py-2.5 text-sm outline-none focus:border-ink" />
          </label>
          <label className="flex flex-col gap-2 sm:col-span-2">
            <span className="label text-muted">Image URL</span>
            <input {...register("image.url")} className="border border-line bg-transparent px-4 py-2.5 text-sm outline-none focus:border-ink" />
          </label>
          <label className="flex items-center gap-3 text-sm">
            <input type="checkbox" {...register("isFeatured")} className="accent-ink" />
            Featured
          </label>
          <button type="submit" disabled={isCreating} className="label col-span-full w-fit bg-ink px-6 py-3 text-bg hover:opacity-85 disabled:opacity-50">
            Save Collection
          </button>
        </form>
      )}

      <div className="border border-line">
        {isLoading ? (
          <div className="p-6 text-sm text-muted">Loading…</div>
        ) : collections.length === 0 ? (
          <div className="p-6 text-sm text-muted">No collections yet.</div>
        ) : (
          <ul className="divide-y divide-line">
            {collections.map((c) => (
              <li key={c._id} className="flex items-center justify-between p-4 text-sm">
                <div>
                  <span className="font-medium">{c.name}</span>
                  {c.isFeatured && <span className="label ml-2 text-accent">Featured</span>}
                </div>
                <button type="button" onClick={() => confirm(`Delete "${c.name}"?`) && deleteCollection(c._id)} className="text-muted hover:text-accent">
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
