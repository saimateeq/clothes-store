import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { Heart } from "lucide-react";
import { selectIsAuthenticated } from "../features/auth/authSlice";
import { useGetWishlistQuery } from "../features/wishlist/wishlistApi";
import { useListProductsQuery } from "../features/products/productsApi";
import { normalizeProducts } from "../features/products/productAdapter";
import { useWishlist } from "../context/WishlistContext";
import ProductGrid from "../components/ProductGrid";
import { ProductGridSkeleton } from "../components/ProductCardSkeleton";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

export default function Wishlist() {
  useDocumentTitle("Wishlist");
  const { ids } = useWishlist();
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // Authenticated: the wishlist endpoint already returns hydrated product
  // docs. Guest: fetch the saved _ids from the shared products endpoint.
  const { data: serverWishlist, isLoading: isServerLoading } = useGetWishlistQuery(undefined, {
    skip: !isAuthenticated,
  });
  const { data: guestProducts, isLoading: isGuestLoading } = useListProductsQuery(
    { ids: ids.join(","), limit: ids.length || 1 },
    { skip: isAuthenticated || ids.length === 0 }
  );

  const isLoading = isAuthenticated ? isServerLoading : isGuestLoading;
  const saved = isAuthenticated
    ? normalizeProducts(serverWishlist?.data?.products)
    : normalizeProducts(guestProducts?.data?.products);

  return (
    <div className="mx-auto max-w-[1600px] px-5 py-12 sm:px-8 lg:py-16">
      <div className="mb-12 flex flex-col gap-2">
        <span className="label text-accent">Saved</span>
        <h1 className="font-heading text-5xl sm:text-6xl">Wishlist</h1>
      </div>

      {ids.length === 0 ? (
        <div className="flex flex-col items-center gap-5 py-24 text-center">
          <Heart size={32} strokeWidth={1} className="text-muted" />
          <h2 className="font-heading text-3xl">Your Wishlist Is Empty</h2>
          <p className="max-w-xs text-sm text-muted">Discover pieces you'll love.</p>
          <Link
            to="/shop"
            className="label mt-2 border border-ink px-8 py-4 transition-colors hover:bg-ink hover:text-bg"
          >
            Explore Collection
          </Link>
        </div>
      ) : isLoading ? (
        <ProductGridSkeleton columns="grid-cols-2 lg:grid-cols-4" count={ids.length} />
      ) : (
        <ProductGrid products={saved} columns="grid-cols-2 lg:grid-cols-4" />
      )}
    </div>
  );
}
