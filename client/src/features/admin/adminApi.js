import { apiSlice } from "../../services/apiSlice";

export const adminApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDashboard: builder.query({
      query: (range) => ({ url: "/admin/dashboard", params: { range } }),
      providesTags: ["AdminStats"],
    }),
    listAllOrdersAdmin: builder.query({
      query: (params) => ({ url: "/admin/orders", params }),
      providesTags: [{ type: "Order", id: "LIST" }],
    }),
    listCustomers: builder.query({
      query: () => "/admin/customers",
      providesTags: ["User"],
    }),
    getCustomerById: builder.query({
      query: (id) => `/admin/customers/${id}`,
      providesTags: (result, error, id) => [{ type: "User", id }],
    }),
    setCustomerActive: builder.mutation({
      query: ({ id, isActive }) => ({ url: `/admin/customers/${id}/active`, method: "PATCH", body: { isActive } }),
      invalidatesTags: ["User"],
    }),
    bulkUpdateProducts: builder.mutation({
      query: (body) => ({ url: "/admin/products/bulk", method: "POST", body }),
      invalidatesTags: [{ type: "Product", id: "LIST" }],
    }),
    duplicateProduct: builder.mutation({
      query: (id) => ({ url: `/admin/products/${id}/duplicate`, method: "POST" }),
      invalidatesTags: [{ type: "Product", id: "LIST" }],
    }),
    listNewsletterSubscribers: builder.query({
      query: () => "/newsletter",
      providesTags: ["Newsletter"],
    }),
  }),
});

export const {
  useGetDashboardQuery,
  useListAllOrdersAdminQuery,
  useListCustomersQuery,
  useGetCustomerByIdQuery,
  useSetCustomerActiveMutation,
  useBulkUpdateProductsMutation,
  useDuplicateProductMutation,
  useListNewsletterSubscribersQuery,
} = adminApi;
