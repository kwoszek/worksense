import {User} from "@heroui/user";
import { getStreakColor } from '@/utils/streak';
import {Button} from "@heroui/button";
import {Comment as CommentType, useLikeCommentMutation, useUnlikeCommentMutation} from "../services/forumApi";
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectAuthUser } from '@/features/auth/authSlice';


function Comment(data: CommentType){
    const user = useSelector(selectAuthUser);
    const [likes, setLikes] = useState<number>(data.likes || 0);
    const [liked, setLiked] = useState<boolean>(!!data.liked);
    const [likeComment, { isLoading: liking }] = useLikeCommentMutation();
    const [unlikeComment, { isLoading: unliking }] = useUnlikeCommentMutation();

    async function toggleLike(){
        if (!user) return;
        try {
            if (!liked) {
                const r = await likeComment({ commentId: data.id, postId: data.postid }).unwrap();
                setLikes(r.likes); setLiked(true);
            } else {
                const r = await unlikeComment({ commentId: data.id, postId: data.postid }).unwrap();
                setLikes(r.likes); setLiked(false);
            }
        } catch {}
    }

    return(
        <div className="m-5 mb-0">
                        <div>
                            <User avatarProps={{ src: data?.avatar ? `data:image/png;base64,${data.avatar}` : undefined, name: data.username, style: { boxSizing: 'content-box', padding: 2, borderRadius: 9999, border: `3px solid ${getStreakColor(data.streak ?? 0)}` } }} name={data.username}/>
                        </div>
            <p className="">{data.content}</p>
            <div className="flex items-center justify-end gap-2 mt-2">
                <Button
                    variant="ghost"
                    isIconOnly
                    className="rounded-full"
                    aria-label={liked ? 'Unlike comment' : 'Like comment'}
                    isDisabled={liking || unliking || !user}
                    onPress={toggleLike}
                >
                    {liked ? (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5 text-danger-500">
                            <path d="M11.645 20.91l-.007-.003-.022-.012a15.267 15.267 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.5 3c1.754 0 3.402.81 4.5 2.09C13.598 3.81 15.246 3 17 3c2.786 0 5.25 2.322 5.25 5.25 0 3.924-2.438 7.11-4.739 9.256a25.176 25.176 0 01-4.244 3.17 15.3 15.3 0 01-.383.219l-.022.012-.007.003a.752.752 0 01-.704 0z" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="size-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0 3.728-2.548 6.864-5.373 9.093a25.189 25.189 0 01-3.626 2.544.75.75 0 01-.802 0 25.19 25.19 0 01-3.626-2.544C5.548 15.114 3 11.978 3 8.25 3 5.322 5.214 3 7.875 3 9.36 3 10.735 3.727 11.625 4.841A6.244 6.244 0 0116.125 3C18.786 3 21 5.322 21 8.25z" />
                        </svg>
                    )}
                </Button>
                <span className="text-xs opacity-70 select-none">{likes}</span>
            </div>
        </div>
    );
}

export default Comment;