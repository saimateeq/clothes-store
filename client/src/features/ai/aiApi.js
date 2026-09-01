import { apiSlice } from "../../services/apiSlice";

// AI Stylist, Shopping Assistant, and most of these are one-shot/turn-based
// requests — plain mutations, same as authApi's login/register. Outfit is
// the exception: it's a "query" (GET-shaped, keyed by productId) so RTK
// Query caches it — revisiting the same product page in one session
// doesn't re-trigger an OpenAI call.
export const aiApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getStylistRecommendations: builder.mutation({
      query: (body) => ({ url: "/ai/stylist", method: "POST", body }),
    }),
    sendChatMessage: builder.mutation({
      query: (body) => ({ url: "/ai/chat", method: "POST", body }),
    }),
    getOutfitRecommendations: builder.query({
      query: (productId) => ({ url: "/ai/outfit", method: "POST", body: { productId } }),
    }),
    getSizeRecommendation: builder.mutation({
      query: (body) => ({ url: "/ai/size", method: "POST", body }),
    }),
    visualSearch: builder.mutation({
      query: (formData) => ({ url: "/ai/visual-search", method: "POST", body: formData }),
    }),
  }),
});

export const {
  useGetStylistRecommendationsMutation,
  useSendChatMessageMutation,
  useGetOutfitRecommendationsQuery,
  useGetSizeRecommendationMutation,
  useVisualSearchMutation,
} = aiApi;
