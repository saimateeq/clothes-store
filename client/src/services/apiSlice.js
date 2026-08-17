import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { API_URL } from "../constants/config";

// Central RTK Query base API. Feature slices (authApi, productsApi, cartApi, ...)
// inject their endpoints into this instance via `apiSlice.injectEndpoints`,
// keeping each domain's requests colocated with its feature module while
// sharing one cache, one set of tag types, and one auth-aware base query.
const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  credentials: "include", // send the httpOnly JWT cookie set by the server
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);
  if (result.error?.status === 401) {
    // Session expired or not authenticated — let calling code / authSlice
    // react to this via the auth state rather than forcing a redirect here.
  }
  return result;
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "User",
    "Product",
    "Category",
    "Collection",
    "Cart",
    "Wishlist",
    "Order",
    "Review",
    "Coupon",
    "Newsletter",
    "AdminStats",
  ],
  endpoints: () => ({}),
});
