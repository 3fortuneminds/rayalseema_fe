import { createSlice } from "@reduxjs/toolkit";

import { tokenStorage } from "../services/tokenStorage";

const initialState = {
  user: tokenStorage.getUser(),
  isAuthenticated: Boolean(tokenStorage.getAccess()),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { access, refresh, user } = action.payload;
      tokenStorage.setSession({ access, refresh, user });
      state.user = user;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      tokenStorage.clear();
      state.user = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
