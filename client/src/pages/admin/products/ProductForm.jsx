import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { Plus, Trash2 } from "lucide-react";
import { useListCategoriesQuery } from "../../../features/categories/categoriesApi";
import {
  useGetProductByIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
} from "../../../features/products/productsApi";
import ImageUploader from "../../../components/admin/ImageUploader";
import AiDescriptionPanel from "../../../components/admin/AiDescriptionPanel";
import TextField from "../../../components/form/TextField";

function flattenCategories(tree, depth = 0) {
  return tree.flatMap((cat) => [{ ...cat, depth }, ...flattenCategories(cat.children ?? [], depth + 1)]);
}

function buildVariants(colors, sizes, existing = []) {
  const find = (color, size) => existing.find((v) => v.color === color && v.size === size);
  const list = [];
  colors.forEach((color) => {
    sizes.forEach((size) => {
      const prior = find(color.name, size);
      list.push({
        color: color.name,
        size,
        sku: prior?.sku ?? "",
        inventory: prior?.inventory ?? 0,
      });
    });
  });
  return list;
}

export default function ProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const { data: categoriesData } = useListCategoriesQuery({ flat: false });
  const flatCategories = flattenCategories(categoriesData?.data?.categories ?? []);

  const { data: productData, isLoading: isLoadingProduct } = useGetProductByIdQuery(id, { skip: !isEdit });
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();

  const [images, setImages] = useState([]);
  const [colors, setColors] = useState([{ name: "", hex: "#171717" }]);
  const [sizes, setSizes] = useState(["S", "M", "L"]);
  const [sizesInput, setSizesInput] = useState("S, M, L");
  const [variants, setVariants] = useState([]);
  const [tags, setTags] = useState("");
  const [error, setError] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    const product = productData?.data?.product;
    if (!product) return;
    reset({
      name: product.name,
      sku: product.sku,
      category: product.category?._id,
      subcategory: product.subcategory?._id ?? "",
      brand: product.brand,
      description: product.description,
      shortDescription: product.shortDescription,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      costPrice: product.costPrice,
      material: product.material,
      careInstructions: product.careInstructions,
      seoTitle: product.seoTitle,
      seoMetaDescription: product.seoMetaDescription,
      lowStockThreshold: product.lowStockThreshold,
      isFeatured: product.isFeatured,
      isNewArrival: product.isNewArrival,
      isBestSeller: product.isBestSeller,
      isActive: product.isActive,
    });
    setImages(product.images ?? []);
    setColors(product.colors?.length ? product.colors : [{ name: "", hex: "#171717" }]);
    setSizes(product.sizes ?? []);
    setSizesInput((product.sizes ?? []).join(", "));
    setVariants(product.variants ?? []);
    setTags((product.tags ?? []).join(", "));
  }, [productData, reset]);

  useEffect(() => {
    setVariants((prev) => buildVariants(colors.filter((c) => c.name), sizes, prev));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colors, sizes]);

  const applySizesInput = (value) => {
    setSizesInput(value);
    setSizes(
      value
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    );
  };

  const onSubmit = async (values) => {
    setError(null);
    if (images.length === 0) return setError("Add at least one product image");
    if (variants.length === 0) return setError("Add at least one color and size");
    if (variants.some((v) => !v.sku)) return setError("Every variant needs a SKU");

    const payload = {
      ...values,
      price: Number(values.price),
      compareAtPrice: values.compareAtPrice ? Number(values.compareAtPrice) : undefined,
      costPrice: values.costPrice ? Number(values.costPrice) : undefined,
      lowStockThreshold: values.lowStockThreshold ? Number(values.lowStockThreshold) : undefined,
      subcategory: values.subcategory || null,
      images,
      colors: colors.filter((c) => c.name),
      sizes,
      variants: variants.map((v) => ({ ...v, inventory: Number(v.inventory) || 0 })),
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
    };

    const action = isEdit ? updateProduct({ id, ...payload }) : createProduct(payload);
    const res = await action.unwrap().catch((err) => {
      setError(err.data?.message || "Could not save product");
      return null;
    });
    if (res) navigate("/admin/products");
  };

  // Feeds the AI generator whatever's already filled in above — never
  // sent anywhere until the admin explicitly clicks Generate.
  const getAiInputs = () => {
    const values = getValues();
    const categoryName = flatCategories.find((c) => c._id === values.category)?.name;
    return {
      name: values.name,
      category: categoryName,
      material: values.material,
      color: colors.find((c) => c.name)?.name,
      price: values.price ? Number(values.price) : undefined,
    };
  };

  // Applies one generated field at a time, only on an explicit "Apply"
  // click from the admin — this never runs on its own, and never touches
  // anything beyond the single field clicked.
  const applyAiField = (fields) => {
    Object.entries(fields).forEach(([key, value]) => {
      if (key === "tags") {
        setTags(value);
      } else {
        setValue(key, value, { shouldDirty: true });
      }
    });
  };

  if (isEdit && isLoadingProduct) return <div className="h-96 animate-pulse bg-line" />;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <span className="label text-accent">Products</span>
        <h1 className="font-heading text-4xl">{isEdit ? "Edit Product" : "New Product"}</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-10">
        <section className="flex flex-col gap-4 border border-line p-6">
          <h2 className="label text-muted">Basic Information</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField label="Product Name" registration={register("name", { required: "Required" })} error={errors.name} />
            <TextField label="SKU" registration={register("sku", { required: "Required" })} error={errors.sku} />
            <label className="flex flex-col gap-2">
              <span className="label text-muted">Category</span>
              <select {...register("category", { required: "Required" })} className="border border-line bg-transparent px-4 py-3 text-sm outline-none focus:border-ink">
                <option value="">Select category</option>
                {flatCategories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {"— ".repeat(cat.depth)}
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.category && <span className="text-xs text-accent">{errors.category.message}</span>}
            </label>
            <label className="flex flex-col gap-2">
              <span className="label text-muted">Subcategory</span>
              <select {...register("subcategory")} className="border border-line bg-transparent px-4 py-3 text-sm outline-none focus:border-ink">
                <option value="">None</option>
                {flatCategories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </label>
            <TextField label="Brand" registration={register("brand")} />
          </div>
          <label className="flex flex-col gap-2">
            <span className="label text-muted">Short Description</span>
            <input {...register("shortDescription")} className="border border-line bg-transparent px-4 py-3 text-sm outline-none focus:border-ink" />
          </label>
          <label className="flex flex-col gap-2">
            <span className="label text-muted">Description</span>
            <textarea
              {...register("description", { required: "Required" })}
              rows={4}
              className="border border-line bg-transparent px-4 py-3 text-sm outline-none focus:border-ink"
            />
            {errors.description && <span className="text-xs text-accent">{errors.description.message}</span>}
          </label>
        </section>

        <AiDescriptionPanel getInputs={getAiInputs} onApply={applyAiField} />

        <section className="flex flex-col gap-4 border border-line p-6">
          <h2 className="label text-muted">Pricing</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <TextField label="Price" type="number" step="0.01" registration={register("price", { required: "Required" })} error={errors.price} />
            <TextField label="Compare At Price" type="number" step="0.01" registration={register("compareAtPrice")} />
            <TextField label="Cost Price" type="number" step="0.01" registration={register("costPrice")} />
          </div>
        </section>

        <section className="flex flex-col gap-4 border border-line p-6">
          <h2 className="label text-muted">Images</h2>
          <ImageUploader images={images} onChange={setImages} />
        </section>

        <section className="flex flex-col gap-4 border border-line p-6">
          <h2 className="label text-muted">Colors</h2>
          {colors.map((color, i) => (
            <div key={i} className="flex items-center gap-3">
              <input
                type="color"
                value={color.hex}
                onChange={(e) => setColors(colors.map((c, ci) => (ci === i ? { ...c, hex: e.target.value } : c)))}
                className="h-10 w-10 shrink-0 border border-line"
              />
              <input
                value={color.name}
                onChange={(e) => setColors(colors.map((c, ci) => (ci === i ? { ...c, name: e.target.value } : c)))}
                placeholder="Color name"
                className="w-full border border-line bg-transparent px-4 py-2.5 text-sm outline-none focus:border-ink"
              />
              <button type="button" onClick={() => setColors(colors.filter((_, ci) => ci !== i))} className="text-muted hover:text-ink">
                <Trash2 size={15} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setColors([...colors, { name: "", hex: "#171717" }])}
            className="label flex w-fit items-center gap-2 text-ink"
          >
            <Plus size={14} /> Add Color
          </button>
        </section>

        <section className="flex flex-col gap-4 border border-line p-6">
          <h2 className="label text-muted">Sizes</h2>
          <input
            value={sizesInput}
            onChange={(e) => applySizesInput(e.target.value)}
            placeholder="S, M, L, XL"
            className="border border-line bg-transparent px-4 py-3 text-sm outline-none focus:border-ink"
          />
          <p className="text-xs text-muted">Comma-separated. Determines the inventory grid below.</p>
        </section>

        {variants.length > 0 && (
          <section className="flex flex-col gap-4 border border-line p-6">
            <h2 className="label text-muted">Inventory by Variant</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line text-left text-muted">
                    <th className="py-2 pr-4 font-normal">Color</th>
                    <th className="py-2 pr-4 font-normal">Size</th>
                    <th className="py-2 pr-4 font-normal">SKU</th>
                    <th className="py-2 font-normal">Inventory</th>
                  </tr>
                </thead>
                <tbody>
                  {variants.map((v, i) => (
                    <tr key={`${v.color}-${v.size}`} className="border-b border-line">
                      <td className="py-2 pr-4">{v.color}</td>
                      <td className="py-2 pr-4">{v.size}</td>
                      <td className="py-2 pr-4">
                        <input
                          value={v.sku}
                          onChange={(e) =>
                            setVariants(variants.map((row, ri) => (ri === i ? { ...row, sku: e.target.value } : row)))
                          }
                          placeholder="SKU"
                          className="w-32 border border-line bg-transparent px-2 py-1.5 text-sm outline-none focus:border-ink"
                        />
                      </td>
                      <td className="py-2">
                        <input
                          type="number"
                          min="0"
                          value={v.inventory}
                          onChange={(e) =>
                            setVariants(variants.map((row, ri) => (ri === i ? { ...row, inventory: e.target.value } : row)))
                          }
                          className="w-20 border border-line bg-transparent px-2 py-1.5 text-sm outline-none focus:border-ink"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <section className="flex flex-col gap-4 border border-line p-6">
          <h2 className="label text-muted">Product Details</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField label="Material" registration={register("material")} />
            <TextField label="Low Stock Threshold" type="number" registration={register("lowStockThreshold")} />
          </div>
          <label className="flex flex-col gap-2">
            <span className="label text-muted">Care Instructions</span>
            <textarea {...register("careInstructions")} rows={2} className="border border-line bg-transparent px-4 py-3 text-sm outline-none focus:border-ink" />
          </label>
          <label className="flex flex-col gap-2">
            <span className="label text-muted">Tags</span>
            <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="linen, summer, new" className="border border-line bg-transparent px-4 py-3 text-sm outline-none focus:border-ink" />
          </label>
        </section>

        <section className="flex flex-col gap-4 border border-line p-6">
          <h2 className="label text-muted">SEO</h2>
          <TextField label="SEO Title" registration={register("seoTitle")} />
          <label className="flex flex-col gap-2">
            <span className="label text-muted">SEO Meta Description</span>
            <textarea {...register("seoMetaDescription")} rows={2} className="border border-line bg-transparent px-4 py-3 text-sm outline-none focus:border-ink" />
          </label>
        </section>

        <section className="flex flex-col gap-3 border border-line p-6">
          <h2 className="label text-muted">Visibility</h2>
          {[
            { key: "isActive", label: "Active" },
            { key: "isFeatured", label: "Featured" },
            { key: "isNewArrival", label: "New Arrival" },
            { key: "isBestSeller", label: "Best Seller" },
          ].map((flag) => (
            <label key={flag.key} className="flex items-center gap-3 text-sm">
              <input type="checkbox" {...register(flag.key)} defaultChecked={flag.key === "isActive"} className="accent-ink" />
              {flag.label}
            </label>
          ))}
        </section>

        {error && <p className="text-sm text-accent">{error}</p>}

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isCreating || isUpdating}
            className="label bg-ink px-8 py-4 text-bg transition-opacity hover:opacity-85 disabled:opacity-50"
          >
            {isEdit ? "Save Changes" : "Create Product"}
          </button>
          <button type="button" onClick={() => navigate("/admin/products")} className="label text-muted hover:text-ink">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
