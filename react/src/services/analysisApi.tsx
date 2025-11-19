import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface Analysis {
  id: number;
  checkinId: number;
  moodScore: number;
  message: string;
  progressSummary?: string;
  createdAt: string;
  date?: string;
  stress?: number;
  energy?: number;
}

// Base URL can be overridden by Vite env `VITE_API_BASE_URL`
// Assuming analysis endpoints are served under /api/analysis; adjust if still under /api/forum
const baseUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/analysis`;

const baseQuery = fetchBaseQuery({
  baseUrl,
  prepareHeaders: (headers) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('ws_access_token') : null;
    if (token) headers.set('authorization', `Bearer ${token}`);
    return headers;
  },
});

export const analysisApi = createApi({
  reducerPath: 'analysisApi',
  baseQuery,
  tagTypes: ['Analysis'],
  endpoints: (builder) => ({
    getLatestAnalysis: builder.query<Analysis | null, void>({
      query: () => ({ url: '/latest', method: 'GET' }),
      providesTags: ['Analysis'],
    }),
    getAnalyses: builder.query<Analysis[], void>({
      query: () => ({ url: '/', method: 'GET' }),
      providesTags: ['Analysis'],
    }),
  }),
});

export const {
  useGetLatestAnalysisQuery,
  useGetAnalysesQuery,
} = analysisApi;
