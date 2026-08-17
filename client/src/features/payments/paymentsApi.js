import { apiSlice } from "../../services/apiSlice";

export const paymentsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createPaymentIntent: builder.mutation({
      query: ({ shippingMethod, couponCode }) => ({
        url: "/payments/create-intent",
        method: "POST",
        body: { shippingMethod, couponCode },
      }),
    }),
  }),
});

export const { useCreatePaymentIntentMutation } = paymentsApi;
