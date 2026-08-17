import { apiSlice } from "../../services/apiSlice";

export const wishlistApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getWishlist: builder.query({
      query: () => "/wishlist",
      providesTags: ["Wishlist"],
    }),
    addWishlistProduct: builder.mutation({
      query: (productId) => ({ url: "/wishlist/items", method: "POST", body: { productId } }),
      invalidatesTags: ["Wishlist"],
    }),
    removeWishlistProduct: builder.mutation({
      query: (productId) => ({ url: `/wishlist/items/${productId}`, method: "DELETE" }),
      invalidatesTags: ["Wishlist"],
    }),
    mergeWishlist: builder.mutation({
      query: (productIds) => ({ url: "/wishlist/merge", method: "POST", body: { productIds } }),
      invalidatesTags: ["Wishlist"],
    }),
  }),
});

export const {
  useGetWishlistQuery,
  useAddWishlistProductMutation,
  useRemoveWishlistProductMutation,
  useMergeWishlistMutation,
} = wishlistApi;
