import { apiSlice } from "../../services/apiSlice";

export const reviewsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    listProductReviews: builder.query({
      query: (productId) => ({ url: "/reviews", params: { product: productId } }),
      providesTags: (result, error, productId) => [{ type: "Review", id: productId }],
    }),
    createReview: builder.mutation({
      query: (body) => ({ url: "/reviews", method: "POST", body }),
      invalidatesTags: (result, error, body) => [{ type: "Review", id: body.product }],
    }),
    listReviewsForModeration: builder.query({
      query: (status) => ({ url: "/reviews/admin/all", params: { status } }),
      providesTags: ["Review"],
    }),
    updateReviewStatus: builder.mutation({
      query: ({ id, status }) => ({ url: `/reviews/${id}/status`, method: "PATCH", body: { status } }),
      invalidatesTags: ["Review"],
    }),
    deleteReview: builder.mutation({
      query: (id) => ({ url: `/reviews/${id}`, method: "DELETE" }),
      invalidatesTags: ["Review"],
    }),
  }),
});

export const {
  useListProductReviewsQuery,
  useCreateReviewMutation,
  useListReviewsForModerationQuery,
  useUpdateReviewStatusMutation,
  useDeleteReviewMutation,
} = reviewsApi;
