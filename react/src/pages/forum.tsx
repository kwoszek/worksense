import { useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Divider } from "@heroui/divider";
import DefaultLayout from "@/layouts/default";
import { useGetPostsQuery, useAddPostMutation } from "@/services/forumApi";
import ForumPost from "@/components/forumPost";
import { Button } from "@heroui/button";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Input } from "@heroui/input";
import { useSelector } from 'react-redux';
import { selectAuthUser } from '@/features/auth/authSlice';

export default function ForumPage() {
  const { data: posts, isLoading: isLoadingPosts } = useGetPostsQuery();
  const [addPost, { isLoading: creating, error: createError }] = useAddPostMutation();
  const user = useSelector(selectAuthUser);
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  async function handleCreatePost(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return; // guarded routes should prevent this, but safe check
    const t = title.trim();
    const c = content.trim();
    if (!t || !c) return;
    try {
      await addPost({ userId: user.id, title: t, content: c }).unwrap();
      setTitle("");
      setContent("");
      setIsOpen(false);
    } catch {}
  }

  return (
    <DefaultLayout>
      <div className="flex justify-center gap-5">
        <Card className="w-4/7">
              <div className="justify-between flex m-2">
                <Button>sort placeholder</Button>
        <Button onPress={() => setIsOpen(true)}>New Post</Button>
      </div>
          <CardBody>
            {!isLoadingPosts ? (
              posts?.map((post) => (
                <ForumPost key={post.id} {...post} />
            ))) : (
              <></>
            )}
          </CardBody>
        </Card>
        <Card className="w-3/11">
          <CardHeader>
            <h2 className="opacity-60 text-2xl">Popular posts</h2>
          </CardHeader>
          <Divider />
          <CardBody>
            {!isLoadingPosts ? (
              posts?.slice(0, 5).map((post) => (
                <div key={post.id} className="mb-4">
                  <h3>{post.title}</h3>
                  <Divider />
                </div>
              ))
            ) : (
              <></>
            )}
          </CardBody>
        </Card>
      </div>
      <Modal isOpen={isOpen} placement="top-center" onOpenChange={setIsOpen}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Create New Post</ModalHeader>
              <ModalBody>
                <form className="flex flex-col gap-4" onSubmit={handleCreatePost}>
                  <Input
                    isRequired
                    label="Title"
                    labelPlacement="outside"
                    name="title"
                    placeholder="Enter a concise title"
                    value={title}
                    onValueChange={setTitle}
                  />
                  <div className="flex flex-col gap-2">
                    <label className="text-sm opacity-70" htmlFor="content">Content</label>
                    <textarea
                      id="content"
                      name="content"
                      className="min-h-32 rounded-medium border border-default-200 bg-transparent p-3 outline-none"
                      placeholder="Write your post content..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                    />
                  </div>
                  {createError && (
                    <p className="text-sm text-danger-600">Failed to create post.</p>
                  )}
                  <div className="flex gap-2 justify-end">
                    <Button color="danger" variant="flat" onPress={onClose}>
                      Cancel
                    </Button>
                    <Button color="primary" type="submit" isDisabled={creating} isLoading={creating}>
                      Publish
                    </Button>
                  </div>
                </form>
              </ModalBody>
              <ModalFooter />
            </>
          )}
        </ModalContent>
      </Modal>
    </DefaultLayout>
  );
}

