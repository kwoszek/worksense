import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AuthUser } from '@/services/usersApi';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
}

const initialToken = typeof window !== 'undefined' ? localStorage.getItem('ws_access_token') || '' : '';

const initialState: AuthState = {
  user: null,
  token: initialToken || null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: AuthUser; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    clearAuth: (state) => {
      state.user = null;
      state.token = null;
    },
  },
});

export const { setCredentials, clearAuth } = authSlice.actions;
export default authSlice.reducer;

export const selectAuthUser = (state: any) => state.auth.user as AuthUser | null;
export const selectAuthToken = (state: any) => state.auth.token as string | null;
