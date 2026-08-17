import ProductCard from "./ProductCard";

export default function ProductGrid({ products, columns = "grid-cols-2 lg:grid-cols-4" }) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-24 text-center">
        <p className="font-heading text-2xl">No products found</p>
        <p className="text-sm text-muted">Try adjusting your filters.</p>
      </div>
    );
  }

  return (
    <div className={`grid ${columns} gap-x-5 gap-y-10 sm:gap-x-6`}>
      {products.map((product, i) => (
        <ProductCard key={product.id} product={product} index={i} />
      ))}
    </div>
  );
}
