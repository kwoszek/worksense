import { configureStore } from '@reduxjs/toolkit';
import { forumApi } from './services/forumApi';
import { usersApi } from './services/usersApi';
import authReducer from '@/features/auth/authSlice';
import { analysisApi } from './services/analysisApi';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [forumApi.reducerPath]: forumApi.reducer,
    [usersApi.reducerPath]: usersApi.reducer,
    [analysisApi.reducerPath]: analysisApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(forumApi.middleware, usersApi.middleware, analysisApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
