import { apiSlice } from "../../services/apiSlice";

export const ordersApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createOrder: builder.mutation({
      query: (body) => ({ url: "/orders", method: "POST", body }),
      invalidatesTags: ["Order", "Cart"],
    }),
    createCodOrder: builder.mutation({
      query: (body) => ({ url: "/orders/cod", method: "POST", body }),
      invalidatesTags: ["Order", "Cart"],
    }),
    listMyOrders: builder.query({
      query: () => "/orders",
      providesTags: (result) =>
        result?.data?.orders
          ? [...result.data.orders.map((o) => ({ type: "Order", id: o._id })), { type: "Order", id: "LIST" }]
          : [{ type: "Order", id: "LIST" }],
    }),
    getOrderById: builder.query({
      query: (id) => `/orders/${id}`,
      providesTags: (result, error, id) => [{ type: "Order", id }],
    }),
    updateOrderStatus: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/orders/${id}/status`, method: "PATCH", body }),
      invalidatesTags: (result, error, { id }) => [{ type: "Order", id }, { type: "Order", id: "LIST" }, "AdminStats"],
    }),
  }),
});

export const {
  useCreateOrderMutation,
  useCreateCodOrderMutation,
  useListMyOrdersQuery,
  useGetOrderByIdQuery,
  useUpdateOrderStatusMutation,
} = ordersApi;
