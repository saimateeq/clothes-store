import { apiSlice } from "../../services/apiSlice";

// AI Stylist and Shopping Assistant are one-shot/turn-based requests, not
// cached resources — plain mutations, same as authApi's login/register.
export const aiApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getStylistRecommendations: builder.mutation({
      query: (body) => ({ url: "/ai/stylist", method: "POST", body }),
    }),
    sendChatMessage: builder.mutation({
      query: (body) => ({ url: "/ai/chat", method: "POST", body }),
    }),
  }),
});

export const { useGetStylistRecommendationsMutation, useSendChatMessageMutation } = aiApi;
