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
    if (data?.data?.user) {
      dispatch(setCredentials(data.data.user));
    } else if (error) {
      dispatch(clearCredentials());
    }
  }, [data, error, isLoading, dispatch]);
}
