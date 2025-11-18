import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Types
export interface Post {
	id: number;
	userid: number;
	title: string;
	content: string;
	dateposted: string;
	username?: string;
}

export interface Comment {
	id: number;
	userid: number;
	postid: number;
	content: string;
	dateposted: string;
	username?: string;
}

export interface Checkin {
	id: number;
	userid: number;
	stress: number;
	energy: number;
	description: string;
	date: string;
	username?: string;
}

interface PostWithComments {
	post: Post;
	comments: Comment[];
}

// Base URL can be overridden by Vite env `VITE_API_BASE_URL`
const baseUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/forum`;

export const forumApi = createApi({
	reducerPath: 'forumApi',
	baseQuery: fetchBaseQuery({ baseUrl }),
	tagTypes: ['Posts', 'Post', 'Comments', 'Checkins'],
	endpoints: (builder) => ({
		// Posts
		getPosts: builder.query<Post[], void>({
			query: () => '/posts',
			providesTags: ['Posts'],
		}),
		getPost: builder.query<PostWithComments, number>({
			query: (id: number) => `/posts/${id}`,
			providesTags: (_result, _error, id) => [
				{ type: 'Post' as const, id },
				{ type: 'Comments' as const, id },
			],
		}),
		addPost: builder.mutation<Post, { userId: number; title: string; content: string }>({
			query: (body) => ({ url: '/posts', method: 'POST', body }),
			invalidatesTags: ['Posts'],
		}),

		// Comments
		addComment: builder.mutation<Comment, { postId: number; userId: number; content: string }>({
			query: ({ postId, ...rest }) => ({
				url: `/posts/${postId}/comments`,
				method: 'POST',
				body: rest,
			}),
			invalidatesTags: (_result, _error, { postId }) => [
				{ type: 'Post' as const, id: postId },
				{ type: 'Comments' as const, id: postId },
			],
		}),
		getComments: builder.query<Comment[], { postId: number; offset?: number; limit?: number }>({
		query: ({ postId, offset = 0, limit = 20 }) =>
			`/posts/${postId}/comments?offset=${offset}&limit=${limit}`,
		}),

		// Checkins
		getCheckins: builder.query<Checkin[], void>({
			query: () => '/checkins',
			providesTags: ['Checkins'],
		}),
		addCheckin: builder.mutation<
			Checkin,
			{ userId: number; stress: number; energy: number; description: string }
		>({
			query: (body) => ({ url: '/checkins', method: 'POST', body }),
			invalidatesTags: ['Checkins'],
		}),
	}),
});

// Hooks
export const {
	useGetPostsQuery,
	useGetPostQuery,
	useAddPostMutation,
	useAddCommentMutation,
	useGetCommentsQuery,
	useGetCheckinsQuery,
	useAddCheckinMutation,
} = forumApi;
