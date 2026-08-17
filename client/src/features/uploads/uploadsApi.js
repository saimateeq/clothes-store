import { apiSlice } from "../../services/apiSlice";

export const uploadsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    uploadImages: builder.mutation({
      // fetchBaseQuery passes FormData straight through as the fetch body
      // and lets the browser set the multipart Content-Type/boundary itself.
      query: (files) => {
        const formData = new FormData();
        files.forEach((file) => formData.append("images", file));
        return { url: "/uploads", method: "POST", body: formData };
      },
    }),
  }),
});

export const { useUploadImagesMutation } = uploadsApi;
