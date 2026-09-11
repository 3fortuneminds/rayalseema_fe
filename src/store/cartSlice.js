import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  restaurantId: null,
  restaurantName: null,
  restaurantSlug: null,
  items: [], // { foodId, variantId, name, variantName, price, quantity }
};

function lineKey(item) {
  return `${item.foodId}:${item.variantId ?? ""}`;
}

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addItem: (state, action) => {
      const item = action.payload;

      if (state.restaurantId && state.restaurantId !== item.restaurantId) {
        state.items = [];
      }
      state.restaurantId = item.restaurantId;
      state.restaurantName = item.restaurantName;
      state.restaurantSlug = item.restaurantSlug;

      const existing = state.items.find((i) => lineKey(i) === lineKey(item));
      if (existing) {
        existing.quantity += item.quantity ?? 1;
      } else {
        state.items.push({
          foodId: item.foodId,
          variantId: item.variantId ?? null,
          name: item.name,
          variantName: item.variantName ?? "",
          price: item.price,
          quantity: item.quantity ?? 1,
        });
      }
    },
    updateQuantity: (state, action) => {
      const { foodId, variantId, quantity } = action.payload;
      if (quantity <= 0) {
        state.items = state.items.filter((i) => lineKey(i) !== lineKey({ foodId, variantId }));
      } else {
        const existing = state.items.find((i) => lineKey(i) === lineKey({ foodId, variantId }));
        if (existing) existing.quantity = quantity;
      }
      if (state.items.length === 0) {
        state.restaurantId = null;
        state.restaurantName = null;
        state.restaurantSlug = null;
      }
    },
    removeItem: (state, action) => {
      const { foodId, variantId } = action.payload;
      state.items = state.items.filter((i) => lineKey(i) !== lineKey({ foodId, variantId }));
      if (state.items.length === 0) {
        state.restaurantId = null;
        state.restaurantName = null;
        state.restaurantSlug = null;
      }
    },
    clearCart: (state) => {
      state.items = [];
      state.restaurantId = null;
      state.restaurantName = null;
      state.restaurantSlug = null;
    },
  },
});

export const { addItem, updateQuantity, removeItem, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
