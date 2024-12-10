import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  token: sessionStorage.getItem("accessToken") || null,
  profile: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setToken(state, action) {
      state.token = action.payload;
      sessionStorage.setItem("accessToken", action.payload);
    },
    setProfile(state, action) {
      state.profile = action.payload;
    },
    logout(state) {
      state.token = null;
      state.profile = null;
      sessionStorage.removeItem("accessToken");
      sessionStorage.clear();
    },
  },
});

export const { setToken, setProfile, logout } = authSlice.actions;

export default authSlice.reducer;
