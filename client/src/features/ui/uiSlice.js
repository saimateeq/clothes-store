import { createSlice } from "@reduxjs/toolkit";

// Cross-component UI state only — things triggered from many unrelated
// components (a product card opening the cart drawer, the navbar opening
// search). Purely local UI (accordion open, dropdown open) stays as
// component state and does not belong here.
const initialState = {
  cartDrawerOpen: false,
  searchOverlayOpen: false,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    openCartDrawer(state) {
      state.cartDrawerOpen = true;
    },
    closeCartDrawer(state) {
      state.cartDrawerOpen = false;
    },
    openSearchOverlay(state) {
      state.searchOverlayOpen = true;
    },
    closeSearchOverlay(state) {
      state.searchOverlayOpen = false;
    },
  },
});

export const { openCartDrawer, closeCartDrawer, openSearchOverlay, closeSearchOverlay } =
  uiSlice.actions;
export default uiSlice.reducer;
