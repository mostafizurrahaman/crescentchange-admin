import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  accessToken: typeof window !== 'undefined' ? localStorage.getItem("accessToken") || null : null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    SetAccessToken: (state, action) => {
      state.accessToken = action.payload;
    },

    logout: (state) => {
      state.accessToken = null;
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userRole");
    },
  },
});

export const { SetAccessToken, logout } = authSlice.actions;
export default authSlice.reducer; 