import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Types
export interface Post {
	id: number;
	userid: number;
	title: string;
	content: string;
	dateposted: string;
	likes: number;
	liked?: boolean;
	username?: string;
	avatar?: string;
}

export interface Comment {
	id: number;
	userid: number;
	postid: number;
	content: string;
	dateposted: string;
	likes: number;
	liked?: boolean;
	username?: string;
	avatar?: string;
}

export interface CommentsResponse {
	comments: Comment[];
	total: number;
}

export interface Checkin {
	id: number;
	userid: number;
	stress: number;
	energy: number;
	description: string;
	date: string;
	moodScore?: number;
	username?: string;
}

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

interface PostWithComments {
	post: Post;
	comments: Comment[];
}

// Base URL can be overridden by Vite env `VITE_API_BASE_URL`
const baseUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/forum`;

const baseQuery = fetchBaseQuery({
	baseUrl,
	prepareHeaders: (headers) => {
		const token = typeof window !== 'undefined' ? localStorage.getItem('ws_access_token') : null;
		if (token) headers.set('authorization', `Bearer ${token}`);
		return headers;
	},
});

export const forumApi = createApi({
	reducerPath: 'forumApi',
	baseQuery,
	tagTypes: ['Posts', 'Post', 'Comments', 'Checkins', 'Me'],
	endpoints: (builder) => ({
		// Posts
		getPosts: builder.query<Post[], { limit: number; offset: number; orderBy: string; direction: string }>({
			query: ({ limit, offset, orderBy, direction }) => `/posts?limit=${limit}&offset=${offset}&orderBy=${orderBy}&direction=${direction}`,
			providesTags: ['Posts'],
		}),
		getPostByUserId: builder.query<Post[], { userId: number; limit: number; offset: number }>({
			// backend route is /posts/user/:id
			query: ({ userId, limit, offset }) => `/posts/user/${userId}?limit=${limit}&offset=${offset}`,
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
			invalidatesTags: ['Posts', 'Me'],
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
				'Me',
			],
		}),
		getComments: builder.query<CommentsResponse, { postId: number; offset?: number; limit?: number }>({
			query: ({ postId, offset = 0, limit = 20 }) =>
				`/posts/${postId}/comments?offset=${offset}&limit=${limit}`,
			providesTags: (_result, _error, { postId }) => [
				{ type: 'Comments' as const, id: postId },
			],
		}),

		// Likes - Posts
		likePost: builder.mutation<{ liked: boolean; likes: number }, { postId: number }>({
			query: ({ postId }) => ({ url: `/posts/${postId}/like`, method: 'POST' }),
			invalidatesTags: ['Posts'],
		}),
		unlikePost: builder.mutation<{ liked: boolean; likes: number }, { postId: number }>({
			query: ({ postId }) => ({ url: `/posts/${postId}/like`, method: 'DELETE' }),
			invalidatesTags: ['Posts'],
		}),
		deletePost: builder.mutation<{ ok: boolean }, { postId: number }>({
			query: ({ postId }) => ({ url: `/posts/${postId}`, method: 'DELETE' }),
			invalidatesTags: ['Posts', 'Me'],
		}),

		// Likes - Comments
		likeComment: builder.mutation<{ liked: boolean; likes: number }, { commentId: number; postId: number }>({
			query: ({ commentId }) => ({ url: `/comments/${commentId}/like`, method: 'POST' }),
			invalidatesTags: (_r,_e,{ postId }) => [ { type: 'Comments' as const, id: postId } ],
		}),
		unlikeComment: builder.mutation<{ liked: boolean; likes: number }, { commentId: number; postId: number }>({
			query: ({ commentId }) => ({ url: `/comments/${commentId}/like`, method: 'DELETE' }),
			invalidatesTags: (_r,_e,{ postId }) => [ { type: 'Comments' as const, id: postId } ],
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
	useLazyGetPostsQuery,
	useGetPostQuery,
	useAddPostMutation,
	useAddCommentMutation,
	useGetCommentsQuery,
	useLazyGetCommentsQuery,
	useGetCheckinsQuery,
	useAddCheckinMutation,
	useLikePostMutation,
	useUnlikePostMutation,
	useLikeCommentMutation,
	useUnlikeCommentMutation,
	useDeletePostMutation,
	useGetPostByUserIdQuery,
} = forumApi;
