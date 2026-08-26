import { useListProductsQuery } from "../features/products/productsApi";
import { normalizeProducts } from "../features/products/productAdapter";
import SectionHeading from "./SectionHeading";
import ProductGrid from "./ProductGrid";
import { ProductGridSkeleton } from "./ProductCardSkeleton";

export default function NewArrivals() {
  const { data, isLoading } = useListProductsQuery({ isNew: true, limit: 8 });
  const newProducts = normalizeProducts(data?.data?.products);

  return (
    <section className="section-py mx-auto max-w-[1600px] px-5 sm:px-8">
      <SectionHeading
        label="Just In"
        heading="New Arrivals"
        description="Discover the latest pieces from our new collection."
        linkTo="/shop?sort=newest"
      />
      <div className="mt-12">
        {isLoading ? (
          <ProductGridSkeleton columns="grid-cols-2 md:grid-cols-3 lg:grid-cols-4" />
        ) : (
          <ProductGrid products={newProducts} columns="grid-cols-2 md:grid-cols-3 lg:grid-cols-4" />
        )}
      </div>
    </section>
  );
}
