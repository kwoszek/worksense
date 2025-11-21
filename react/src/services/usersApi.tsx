import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { setCredentials, clearAuth } from '@/features/auth/authSlice';

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  avatar?: string | null;
  streak?: number;
  advancements?: UserAdvancement[]; // computed backend advancements (badge levels)
}
export interface UserAdvancement {
  key: string;
  name: string;
  description?: string;
  level: number;
}
export interface LoginRequest {
  identifier: string; // email or username
  password: string;
}
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}
export interface AuthResponse {
  user: AuthUser;
  accessToken: string;
}

const apiBase = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/users`;

// Access token storage
const tokenKey = 'ws_access_token';
export const getAccessToken = () => localStorage.getItem(tokenKey) || '';
export const setAccessToken = (t: string) => localStorage.setItem(tokenKey, t);
export const clearAccessToken = () => localStorage.removeItem(tokenKey);

// Base query with auth and cookie support
const baseQuery = fetchBaseQuery({
  baseUrl: apiBase,
  credentials: 'include', // send refresh cookie
  prepareHeaders: (headers) => {
    const token = getAccessToken();
    if (token) headers.set('authorization', `Bearer ${token}`);
    return headers;
  },
});

// Auto-refresh on 401
const baseQueryWithReauth: typeof baseQuery = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);
  if ((result as any).error?.status === 401) {
    const refresh = await baseQuery({ url: '/refresh', method: 'POST' }, api, extraOptions);
    if (refresh.data && (refresh.data as any).accessToken) {
      setAccessToken((refresh.data as any).accessToken);
      result = await baseQuery(args, api, extraOptions);
    } else {
      clearAccessToken();
    }
  }
  return result;
};

export const usersApi = createApi({
  reducerPath: 'usersApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Me'],
  endpoints: (builder) => ({
    register: builder.mutation<AuthResponse, RegisterRequest>({
      query: (body) => ({ url: '/register', method: 'POST', body }),
      invalidatesTags: ['Me'],
      async onQueryStarted(_arg, { queryFulfilled, dispatch }) {
        try {
          const { data } = await queryFulfilled;
          setAccessToken(data.accessToken);
          dispatch(setCredentials({ user: data.user, token: data.accessToken }));
        } catch {}
      },
    }),
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (body) => ({ url: '/login', method: 'POST', body }),
      invalidatesTags: ['Me'],
      async onQueryStarted(_arg, { queryFulfilled, dispatch }) {
        try {
          const { data } = await queryFulfilled;
          setAccessToken(data.accessToken);
          dispatch(setCredentials({ user: data.user, token: data.accessToken }));
        } catch {}
      },
    }),
    logout: builder.mutation<void, void>({
      query: () => ({ url: '/logout', method: 'POST' }),
      invalidatesTags: ['Me'],
      async onQueryStarted(_arg, { queryFulfilled, dispatch }) {
        try { await queryFulfilled; } catch {}
        clearAccessToken();
        dispatch(clearAuth());
      },
    }),
    me: builder.query<AuthUser, void>({
      query: () => ({ url: '/me' }),
      providesTags: ['Me'],
      async onQueryStarted(_arg, { queryFulfilled, dispatch }) {
        try {
          const { data } = await queryFulfilled;
          const token = getAccessToken();
          if (data && token) {
            dispatch(setCredentials({ user: data, token }));
          }
        } catch {}
      },
    }),
    myBadges: builder.query<UserAdvancement[], void>({
      query: () => ({ url: '/me/badges' }),
      providesTags: ['Me'],
    }),
    updateProfile: builder.mutation<{ user: AuthUser; accessToken?: string }, { username?: string; email?: string; avatarBase64?: string }>({
      query: (body) => ({ url: '/me', method: 'PUT', body }),
      invalidatesTags: ['Me'],
      async onQueryStarted(_arg, { queryFulfilled, dispatch }) {
        try {
          const { data } = await queryFulfilled;
          const token = data.accessToken || getAccessToken();
            if (data?.accessToken) setAccessToken(data.accessToken);
          if (data?.user && token) {
            dispatch(setCredentials({ user: data.user, token }));
          }
        } catch {}
      },
    }),
    changePassword: builder.mutation<{ ok: boolean }, { oldPassword: string; newPassword: string }>({
      query: (body) => ({ url: '/change-password', method: 'POST', body }),
    }),
    refresh: builder.mutation<AuthResponse, void>({
      query: () => ({ url: '/refresh', method: 'POST' }),
      async onQueryStarted(_arg, { queryFulfilled, dispatch }) {
        try {
          const { data } = await queryFulfilled;
          if (data.accessToken) {
            setAccessToken(data.accessToken);
            dispatch(setCredentials({ user: data.user, token: data.accessToken }));
          }
        } catch {}
      },
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useLogoutMutation,
  useMeQuery,
  useMyBadgesQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useRefreshMutation,
} = usersApi;