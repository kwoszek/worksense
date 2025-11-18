import { Post, useGetCommentsQuery, useAddCommentMutation } from "../services/forumApi";
import { Avatar } from "@heroui/avatar";
import { Divider } from "@heroui/divider";
import { Button } from "@heroui/button";
import { useState } from "react";
import { useSelector } from "react-redux";
import { selectAuthUser } from "@/features/auth/authSlice";
export default function ForumPost(post: Post) {
    const {data: comments, isLoading: isLoadingComments, refetch} = useGetCommentsQuery({ postId: post.id });
    const user = useSelector(selectAuthUser);
    const [addComment, { isLoading: addingComment, error: addError }] = useAddCommentMutation();
    const [showReply, setShowReply] = useState(false);
    const [commentText, setCommentText] = useState("");

    async function handleAddComment(e: React.FormEvent<HTMLFormElement>) {
      e.preventDefault();
      if (!user) return;
      const content = commentText.trim();
      if (!content) return;
      try {
        await addComment({ postId: post.id, userId: user.id, content }).unwrap();
        refetch();
        setCommentText("");
        setShowReply(false);
      } catch {}
    }
  return (
    <div>
        <div className="flex items-center gap-2 mb-1">
        <Avatar name={post.username || ""} size="sm" />
        <span className="text-sm opacity-80">{post.username}</span>
    </div>
    <h3>{post.title}</h3>
      <p>{post.content}</p>
      <div className="flex justify-end">
        <Button
          isIconOnly
          radius="full"
          size="sm"
          variant="flat"
          color="primary"
          aria-label="Reply"
          onPress={() => setShowReply(true)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="w-4 h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7.5 8.25h9m-9 3h9m-9 3h6.75M21 12c0 4.418-4.03 8-9 8a9.77 9.77 0 0 1-4.121-.879L3 20.25l1.129-3.879A7.936 7.936 0 0 1 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8Z"
            />
          </svg>
        </Button>
      </div>
      {!isLoadingComments ? (
        <>
        <h2 className="m-2">{comments?.length} comments</h2>
        <div className="m-4">
            {comments?.map((comment) => (
            <div key={comment.id} className="ml-4 pb-2">
                <div className="flex items-center gap-2 mb-1">
                    <Avatar name={comment.username || ""} size="sm" />
                    <span className="text-sm opacity-80">{comment.username}</span>
                </div>
                <p>{comment.content}</p>
            </div>
        ))}
        <div className="mt-4">
          {!showReply ? (
            <></>
          ) : (
            <form className="flex flex-col gap-2" onSubmit={handleAddComment}>
              <textarea
                className="min-h-24 rounded-medium border border-default-200 bg-transparent p-2 outline-none"
                placeholder={user ? "Write your comment..." : "You must be logged in to comment"}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                disabled={!user || addingComment}
              />
              {addError && (
                <p className="text-sm text-danger-600">Failed to add comment.</p>
              )}
              <div className="flex gap-2 justify-end">
                <Button variant="flat" onPress={() => { setShowReply(false); setCommentText(""); }}>
                  Cancel
                </Button>
                <Button color="primary" type="submit" isDisabled={!user || addingComment} isLoading={addingComment}>
                  Post
                </Button>
              </div>
            </form>
          )}
        </div>
        </div>
        </>
      ) : (
        <></>
        )}
        <Divider />
    </div>
  );
}