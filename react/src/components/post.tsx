import {User} from "@heroui/user";
import { getStreakColor } from '@/utils/streak';
import {Button} from "@heroui/button";
import {Form} from "@heroui/form";
import {Textarea} from "@heroui/input";
import Comment from "@/components/comment";
import FeaturedBadgesRow from '@/components/FeaturedBadgesRow';
import { Post as Posttype, Comment as CommentType } from "../services/forumApi"
import { useGetCommentsQuery, useLazyGetCommentsQuery, useAddCommentMutation, useLikePostMutation, useUnlikePostMutation } from "@/services/forumApi";
import { useSelector } from 'react-redux';
import { selectAuthUser } from '@/features/auth/authSlice';
import { useState, useEffect, Fragment } from "react";
import { Divider } from "@heroui/divider";
import { splitContentWithBreaks } from '@/lib/utils';
import "./post.css";

function Post(data: Posttype) {
    // Chunked comments: initial fetch (offset 0 limit 2); subsequent chunks offset=loaded length limit=10
    const [loadedComments, setLoadedComments] = useState<CommentType[]>([]);
    const [totalComments, setTotalComments] = useState<number>(0);
    const [lastChunkCount, setLastChunkCount] = useState<number>(0);
    const { data: initialResp } = useGetCommentsQuery({ postId: data.id, offset: 0, limit: 2 });
    const initialComments: CommentType[] = initialResp?.comments || [];
    const [triggerMoreComments, { data: pageResp, isFetching: isFetchingMore }] = useLazyGetCommentsQuery();
    const user = useSelector(selectAuthUser);
    const [addComment, { isLoading: addingComment, error: addError }] = useAddCommentMutation();
    const [showReply, setShowReply] = useState(false);
    const [commentText, setCommentText] = useState("");
    const [likes, setLikes] = useState<number>(data.likes || 0);
    const [liked, setLiked] = useState<boolean>(!!data.liked);
    const [likePost, { isLoading: liking }] = useLikePostMutation();
    const [unlikePost, { isLoading: unliking }] = useUnlikePostMutation();

    async function handleAddComment(e: React.FormEvent<HTMLFormElement>) {
      e.preventDefault();
      if (!user) return;
      const content = commentText.trim();
      if (!content) return;
      try {
                const newComment = await addComment({ postId: data.id, userId: user.id, content }).unwrap();
                // Enrich with user display data (backend may not return username/avatar immediately)
                const enrichedComment: CommentType = {
                    ...newComment,
                    username: user.username,
                    avatar: user.avatar || undefined,
                    likes: newComment.likes || 0,
                    liked: false,
                    featuredBadges: user.featuredBadges || [],
                };
                // Append new comment locally without refetch jitter
                setLoadedComments(prev => [...prev, enrichedComment]);
        setTotalComments(t => t + 1);
        setLastChunkCount(c => (c === 0 ? 1 : c));
        setCommentText("");
        setShowReply(false);
      } catch {}
    }

    const postId = data.id;

    // Reset on post change
    useEffect(() => {
        setLoadedComments([]);
        setTotalComments(0);
        setLastChunkCount(0);
    }, [postId]);

    // Populate initial load
    useEffect(() => {
        if (loadedComments.length === 0 && initialComments.length) {
            setLoadedComments(initialComments);
            setTotalComments(initialResp?.total || initialComments.length);
            setLastChunkCount(initialComments.length);
        }
    }, [initialComments, initialResp, loadedComments.length]);

    // Append new chunk results
    useEffect(() => {
        if (pageResp) {
            const pageComments = pageResp.comments;
            const existingIds = new Set(loadedComments.map(c => c.id));
            const newUnique = pageComments.filter(c => !existingIds.has(c.id));
            if (newUnique.length) setLoadedComments(prev => [...prev, ...newUnique]);
            setTotalComments(pageResp.total);
            setLastChunkCount(pageComments.length);
        }
    }, [pageResp, loadedComments]);

    function handleLoadMoreComments() {
        const offset = loadedComments.length;
        triggerMoreComments({ postId: data.id, offset, limit: 10 });
    }

    const isLoadingComments = (loadedComments.length === 0 && !initialComments.length) || isFetchingMore;
    const contentSegments = splitContentWithBreaks(data.content);
    return(
        <div className="m-5 mt-3">
            <Divider className="mb-6"/>
                         <div>
                             <User avatarProps={{ src: data?.avatar ? `data:image/png;base64,${data.avatar}` : undefined, name: data.username, style: { boxSizing: 'content-box', padding: 2, borderRadius: 9999, border: `3px solid ${getStreakColor(data.streak ?? 0)}` } }} name={data.username}/>
                             <FeaturedBadgesRow badges={data.featuredBadges} className="mt-1 mb-1" />
                         </div>
             
            <h2 className="text-2xl mb-1 mt-1 font-bold">{data.title}</h2>
            <p className="whitespace-pre-wrap">
                {contentSegments.length === 0 ? data.content : contentSegments.map((segment: string, idx: number) => (
                    <Fragment key={idx}>
                        {segment}
                        {idx < contentSegments.length - 1 && <br />}
                    </Fragment>
                ))}
            </p>
            <div className="flex justify-end mt-2">
            <div className="flex items-center justify-end gap-2">
                <Button
                    variant="ghost"
                    isIconOnly
                    className="rounded-full"
                    aria-label={liked ? 'Unlike post' : 'Like post'}
                    isDisabled={liking || unliking || !user}
                    onPress={async () => {
                        if (!user) return;
                        try {
                            if (!liked) {
                                const r = await likePost({ postId: data.id }).unwrap();
                                setLikes(r.likes);
                                setLiked(true);
                            } else {
                                const r = await unlikePost({ postId: data.id }).unwrap();
                                setLikes(r.likes);
                                setLiked(false);
                            }
                        } catch {}
                    }}
                >
                    {liked ? (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6 text-danger-500">
                          <path d="M11.645 20.91l-.007-.003-.022-.012a15.267 15.267 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.5 3c1.754 0 3.402.81 4.5 2.09C13.598 3.81 15.246 3 17 3c2.786 0 5.25 2.322 5.25 5.25 0 3.924-2.438 7.11-4.739 9.256a25.176 25.176 0 01-4.244 3.17 15.3 15.3 0 01-.383.219l-.022.012-.007.003a.752.752 0 01-.704 0z" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0 3.728-2.548 6.864-5.373 9.093a25.189 25.189 0 01-3.626 2.544.75.75 0 01-.802 0 25.19 25.19 0 01-3.626-2.544C5.548 15.114 3 11.978 3 8.25 3 5.322 5.214 3 7.875 3 9.36 3 10.735 3.727 11.625 4.841A6.244 6.244 0 0116.125 3C18.786 3 21 5.322 21 8.25z" />
                        </svg>
                    )}
                </Button>
                <span className="text-sm opacity-70 select-none">{likes}</span>
            </div>
                <Button className="ml-3 rounded-full" isIconOnly variant="ghost" onPress={() => setShowReply(s => !s)}>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
                    </svg>
                </Button>
            </div>
            <div className="mx-5">
                                {!isLoadingComments && loadedComments && (
                                    <>
                                        <h2>{commentsLabel(totalComments)}</h2>
                                        {loadedComments.map((comment) => (
                                            <Comment key={comment.id} {...comment} />
                                        ))}
                                        {/* Show Load More if we haven't loaded all yet */}
                                        {loadedComments.length < totalComments && lastChunkCount > 0 && (
                                            <div className="flex justify-center mt-3">
                                                <Button
                                                    variant="flat"
                                                    size="sm"
                                                    onPress={handleLoadMoreComments}
                                                    isDisabled={isLoadingComments}
                                                >
                                                    Załaduj więcej komentarzy
                                                </Button>
                                            </div>
                                        )}
                                    </>
                                )}
                {showReply && (
                <Form className="flex flex-col gap-2" onSubmit={handleAddComment}>
                    <Textarea
                    className="mt-3"
                    placeholder={user ? "Napisz komentarz..." : "Musisz być zalogowany, aby dodać komentarz"}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    disabled={!user || addingComment}
                    />
                    {addError && (
                    <p className="text-sm text-danger-600">Nie udało się załadować komentarzy.</p>
                    )}
                    <div className="flex gap-2 justify-end">
                    <Button variant="flat" onPress={() => { setShowReply(false); setCommentText(""); }}>
                        Anuluj
                    </Button>
                    <Button color="primary" type="submit" isDisabled={!user || addingComment} isLoading={addingComment}>
                        Opublikuj
                    </Button>
                    </div>
                </Form>
                )}                
            </div>
        </div>
        
    )
}

export default Post;

function commentsLabel(n: number) {
    if (!n) return '0 komentarzy';
    if (n === 1) return '1 komentarz';
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14)) return `${n} komentarze`;
    return `${n} komentarzy`;
}