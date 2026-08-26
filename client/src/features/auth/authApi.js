import { apiSlice } from "../../services/apiSlice";

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMe: builder.query({
      query: () => "/auth/me",
      providesTags: ["User"],
    }),
    register: builder.mutation({
      query: (body) => ({ url: "/auth/register", method: "POST", body }),
      invalidatesTags: ["User"],
    }),
    requestRegistrationOtp: builder.mutation({
      query: (body) => ({ url: "/auth/register/request-otp", method: "POST", body }),
    }),
    verifyRegistrationOtp: builder.mutation({
      query: (body) => ({ url: "/auth/register/verify-otp", method: "POST", body }),
      invalidatesTags: ["User"],
    }),
    login: builder.mutation({
      query: (body) => ({ url: "/auth/login", method: "POST", body }),
      invalidatesTags: ["User"],
    }),
    logout: builder.mutation({
      query: () => ({ url: "/auth/logout", method: "POST" }),
      invalidatesTags: ["User"],
    }),
    forgotPassword: builder.mutation({
      query: (body) => ({ url: "/auth/forgot-password", method: "POST", body }),
    }),
    resetPassword: builder.mutation({
      query: (body) => ({ url: "/auth/reset-password", method: "POST", body }),
      invalidatesTags: ["User"],
    }),
    updatePassword: builder.mutation({
      query: (body) => ({ url: "/auth/update-password", method: "PATCH", body }),
    }),
    updateProfile: builder.mutation({
      query: (body) => ({ url: "/users/profile", method: "PATCH", body }),
      invalidatesTags: ["User"],
    }),
    listAddresses: builder.query({
      query: () => "/users/addresses",
      providesTags: ["User"],
    }),
    createAddress: builder.mutation({
      query: (body) => ({ url: "/users/addresses", method: "POST", body }),
      invalidatesTags: ["User"],
    }),
    updateAddress: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/users/addresses/${id}`, method: "PATCH", body }),
      invalidatesTags: ["User"],
    }),
    deleteAddress: builder.mutation({
      query: (id) => ({ url: `/users/addresses/${id}`, method: "DELETE" }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useGetMeQuery,
  useRegisterMutation,
  useRequestRegistrationOtpMutation,
  useVerifyRegistrationOtpMutation,
  useLoginMutation,
  useLogoutMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useUpdatePasswordMutation,
  useUpdateProfileMutation,
  useListAddressesQuery,
  useCreateAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
} = authApi;
