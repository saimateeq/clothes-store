import { apiSlice } from "../../services/apiSlice";

export const couponsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    validateCoupon: builder.mutation({
      query: (body) => ({ url: "/coupons/validate", method: "POST", body }),
    }),
    listCoupons: builder.query({
      query: () => "/coupons",
      providesTags: ["Coupon"],
    }),
    createCoupon: builder.mutation({
      query: (body) => ({ url: "/coupons", method: "POST", body }),
      invalidatesTags: ["Coupon"],
    }),
    updateCoupon: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/coupons/${id}`, method: "PATCH", body }),
      invalidatesTags: ["Coupon"],
    }),
    deleteCoupon: builder.mutation({
      query: (id) => ({ url: `/coupons/${id}`, method: "DELETE" }),
      invalidatesTags: ["Coupon"],
    }),
  }),
});

export const {
  useValidateCouponMutation,
  useListCouponsQuery,
  useCreateCouponMutation,
  useUpdateCouponMutation,
  useDeleteCouponMutation,
} = couponsApi;
