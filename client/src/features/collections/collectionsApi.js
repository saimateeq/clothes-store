import { apiSlice } from "../../services/apiSlice";

export const collectionsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    listCollections: builder.query({
      query: (params) => ({ url: "/collections", params }),
      providesTags: ["Collection"],
    }),
    getCollectionBySlug: builder.query({
      query: (slug) => `/collections/${slug}`,
      providesTags: (result, error, slug) => [{ type: "Collection", id: slug }],
    }),
    createCollection: builder.mutation({
      query: (body) => ({ url: "/collections", method: "POST", body }),
      invalidatesTags: ["Collection"],
    }),
    updateCollection: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/collections/${id}`, method: "PATCH", body }),
      invalidatesTags: ["Collection"],
    }),
    deleteCollection: builder.mutation({
      query: (id) => ({ url: `/collections/${id}`, method: "DELETE" }),
      invalidatesTags: ["Collection"],
    }),
  }),
});

export const {
  useListCollectionsQuery,
  useGetCollectionBySlugQuery,
  useCreateCollectionMutation,
  useUpdateCollectionMutation,
  useDeleteCollectionMutation,
} = collectionsApi;
