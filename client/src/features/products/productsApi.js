import { apiSlice } from "../../services/apiSlice";

export const productsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    listProducts: builder.query({
      query: (params) => ({ url: "/products", params }),
      providesTags: (result) =>
        result?.data?.products
          ? [
              ...result.data.products.map((p) => ({ type: "Product", id: p._id })),
              { type: "Product", id: "LIST" },
            ]
          : [{ type: "Product", id: "LIST" }],
    }),
    searchProducts: builder.query({
      query: (q) => ({ url: "/products/search", params: { q } }),
    }),
    getProductFacets: builder.query({
      query: () => "/products/facets",
    }),
    getRecommendedProducts: builder.query({
      query: (params) => ({ url: "/products/recommended", params }),
    }),
    getProductBySlug: builder.query({
      query: (slug) => `/products/${slug}`,
      providesTags: (result, error, slug) => [{ type: "Product", id: slug }],
    }),
    getProductById: builder.query({
      query: (id) => `/products/id/${id}`,
      providesTags: (result, error, id) => [{ type: "Product", id }],
    }),
    listProductsAdmin: builder.query({
      query: (params) => ({ url: "/products/admin/all", params }),
      providesTags: [{ type: "Product", id: "LIST" }],
    }),
    createProduct: builder.mutation({
      query: (body) => ({ url: "/products", method: "POST", body }),
      invalidatesTags: [{ type: "Product", id: "LIST" }],
    }),
    updateProduct: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/products/${id}`, method: "PATCH", body }),
      invalidatesTags: (result, error, { id }) => [{ type: "Product", id }, { type: "Product", id: "LIST" }],
    }),
    setProductActive: builder.mutation({
      query: ({ id, isActive }) => ({ url: `/products/${id}/active`, method: "PATCH", body: { isActive } }),
      invalidatesTags: [{ type: "Product", id: "LIST" }],
    }),
    deleteProduct: builder.mutation({
      query: (id) => ({ url: `/products/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "Product", id: "LIST" }],
    }),
  }),
});

export const {
  useListProductsQuery,
  useSearchProductsQuery,
  useGetProductFacetsQuery,
  useGetRecommendedProductsQuery,
  useGetProductBySlugQuery,
  useGetProductByIdQuery,
  useListProductsAdminQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useSetProductActiveMutation,
  useDeleteProductMutation,
} = productsApi;
