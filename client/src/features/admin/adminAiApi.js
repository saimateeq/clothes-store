import { apiSlice } from "../../services/apiSlice";

export const adminAiApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    generateProductDescription: builder.mutation({
      query: (body) => ({ url: "/admin/ai/product-description", method: "POST", body }),
    }),
    generateMarketingContent: builder.mutation({
      query: (body) => ({ url: "/admin/ai/marketing", method: "POST", body }),
    }),
    getSalesInsights: builder.query({
      query: (range) => ({ url: "/admin/ai/insights", params: { range } }),
    }),
  }),
});

export const {
  useGenerateProductDescriptionMutation,
  useGenerateMarketingContentMutation,
  useGetSalesInsightsQuery,
} = adminAiApi;
