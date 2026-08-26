import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useGetMeQuery } from "../features/auth/authApi";
import { setCredentials, clearCredentials } from "../features/auth/authSlice";

// Resolves whether a session cookie from a previous visit is still valid,
// once, on app load — populating authSlice before routes render.
export function useAuthBootstrap() {
  const dispatch = useDispatch();
  const { data, error, isLoading } = useGetMeQuery();

  useEffect(() => {
    if (isLoading) return;
    // Check error first — RTK Query keeps the previous successful `data`
    // around during a refetch (e.g. the automatic re-fetch triggered by
    // logout's invalidatesTags), so a failed refetch can report BOTH a
    // fresh 401 error AND still-truthy stale `data` at the same time.
    // Checking `data` first would re-authenticate the user with that
    // stale cache right after they logged out.
    if (error) {
      dispatch(clearCredentials());
    } else if (data?.data?.user) {
      dispatch(setCredentials(data.data.user));
    }
  }, [data, error, isLoading, dispatch]);
}
