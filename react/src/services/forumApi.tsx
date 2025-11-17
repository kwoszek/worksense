import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Types
export interface User {
	id: number;
	username: string;
	email: string;
}

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
	tagTypes: ['Users', 'Posts', 'Post', 'Comments', 'Checkins'],
	endpoints: (builder) => ({
		// Users
		getUsers: builder.query<User[], void>({
			query: () => '/users',
			providesTags: ['Users'],
		}),
		addUser: builder.mutation<User, { username: string; password: string; email: string }>({
			query: (body: { username: string; password: string; email: string }) => ({ url: '/users', method: 'POST', body }),
			invalidatesTags: ['Users'],
		}),

		// Posts
		getPosts: builder.query<Post[], void>({
			query: () => '/posts',
			providesTags: ['Posts'],
		}),
		getPost: builder.query<PostWithComments, number>({
			query: (id: number) => `/posts/${id}`,
			providesTags: (_result: PostWithComments | undefined, _error: unknown, id: number) => [
				{ type: 'Post', id },
				{ type: 'Comments', id },
			],
		}),
		addPost: builder.mutation<Post, { userId: number; title: string; content: string }>({
			query: (body: { userId: number; title: string; content: string }) => ({ url: '/posts', method: 'POST', body }),
			invalidatesTags: ['Posts'],
		}),

		// Comments
		addComment: builder.mutation<Comment, { postId: number; userId: number; content: string }>({
			query: ({ postId, ...rest }: { postId: number; userId: number; content: string }) => ({ url: `/posts/${postId}/comments`, method: 'POST', body: rest }),
			invalidatesTags: (_result: Comment | undefined, _error: unknown, { postId }: { postId: number }) => [
				{ type: 'Post', id: postId },
				{ type: 'Comments', id: postId },
			],
		}),

		// Checkins
		getCheckins: builder.query<Checkin[], void>({
			query: () => '/checkins',
			providesTags: ['Checkins'],
		}),
		addCheckin: builder.mutation<Checkin, { userId: number; stress: number; energy: number; description: string }>({
			query: (body: { userId: number; stress: number; energy: number; description: string }) => ({ url: '/checkins', method: 'POST', body }),
			invalidatesTags: ['Checkins'],
		}),
	}),
});

// Hooks
export const {
	useGetUsersQuery,
	useAddUserMutation,
	useGetPostsQuery,
	useGetPostQuery,
	useAddPostMutation,
	useAddCommentMutation,
	useGetCheckinsQuery,
	useAddCheckinMutation,
} = forumApi;
