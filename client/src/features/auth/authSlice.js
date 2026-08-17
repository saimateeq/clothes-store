import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null, // { id, name, email, role }
  isAuthenticated: false,
  isInitializing: true, // true until the initial "who am I" check resolves
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials(state, action) {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.isInitializing = false;
    },
    clearCredentials(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.isInitializing = false;
    },
    finishInitializing(state) {
      state.isInitializing = false;
    },
  },
});

export const { setCredentials, clearCredentials, finishInitializing } = authSlice.actions;
export default authSlice.reducer;

export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectIsAdmin = (state) =>
  state.auth.user?.role === "admin" || state.auth.user?.role === "manager";
