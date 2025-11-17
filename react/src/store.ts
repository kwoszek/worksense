import { configureStore } from '@reduxjs/toolkit';
import { forumApi } from './services/forumApi';

export const store = configureStore({
  reducer: {
    [forumApi.reducerPath]: forumApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(forumApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
