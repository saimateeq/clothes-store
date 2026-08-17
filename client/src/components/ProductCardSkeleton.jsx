export default function ProductCardSkeleton() {
  return (
    <div className="flex flex-col gap-4 animate-pulse">
      <div className="aspect-[3/4] bg-line" />
      <div className="flex flex-col gap-2">
        <div className="h-4 w-3/4 bg-line" />
        <div className="h-3 w-1/4 bg-line" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8, columns = "grid-cols-2 lg:grid-cols-4" }) {
  return (
    <div className={`grid ${columns} gap-x-5 gap-y-10 sm:gap-x-6`}>
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
