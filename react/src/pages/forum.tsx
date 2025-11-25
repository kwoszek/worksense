import { useState, useEffect } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Select, SelectItem } from "@heroui/select";
import { Divider } from "@heroui/divider";
import DefaultLayout from "@/layouts/default";
import { useGetPostsQuery, useAddPostMutation, useLazyGetPostsQuery } from "@/services/forumApi";
import type { Post as PostModel } from "@/services/forumApi";
import Post from "@/components/post";
import { Button } from "@heroui/button";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Input } from "@heroui/input";
import { useSelector } from 'react-redux';
import { selectAuthUser } from '@/features/auth/authSlice';

export default function ForumPage() {
  const [orderBy, setOrderBy] = useState("dateposted");
  const [direction, setDirection] = useState("DESC");
  // Chunked loading driven entirely by lazy query
  const [loadedPosts, setLoadedPosts] = useState<PostModel[]>([]);
  const [lastChunkCount, setLastChunkCount] = useState<number>(0);
  const [requestedOffset, setRequestedOffset] = useState<number>(0);
  const [triggerGetPosts, { data: pageData, isFetching: isFetchingPosts }] = useLazyGetPostsQuery();
  const [addPost, { isLoading: creating, error: createError }] = useAddPostMutation();
  const user = useSelector(selectAuthUser);
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const {data: popularPosts, isLoading: isLoadingPopularPosts} = useGetPostsQuery({ limit: 5, offset: 0, orderBy: 'likes', direction: 'DESC' });

  async function handleCreatePost(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user?.id) return; // guarded routes should prevent this, but safe check
    const t = title.trim();
    const c = content.trim();
    if (!t || !c) return;
    // Replace newline characters with <br/> so line breaks are preserved in HTML rendering
    const prepared = c.replace(/\r?\n/g, '<br/>');
    try {
      await addPost({ userId: user.id, title: t, content: prepared }).unwrap();
      setTitle("");
      setContent("");
      setIsOpen(false);
    } catch {}
  }

  // Fetch initial page or new ordering
  useEffect(() => {
    setLoadedPosts([]);
    setLastChunkCount(0);
    setRequestedOffset(0);
    triggerGetPosts({ limit: 10, offset: 0, orderBy, direction });
  }, [orderBy, direction, triggerGetPosts]);

  // Handle page data arrival (initial or subsequent chunks)
  useEffect(() => {
    if (!pageData) return;
    if (requestedOffset === 0) {
      // Replace list for initial load
      setLoadedPosts(pageData);
    } else {
      // Append unique posts for subsequent chunks
      const existingIds = new Set(loadedPosts.map(p => p.id));
      const newUnique = pageData.filter(p => !existingIds.has(p.id));
      if (newUnique.length) setLoadedPosts(prev => [...prev, ...newUnique]);
    }
    setLastChunkCount(pageData.length);
  }, [pageData, requestedOffset, loadedPosts]);

  function handleLoadMorePosts() {
    const offset = loadedPosts.length;
    setRequestedOffset(offset);
    triggerGetPosts({ limit: 10, offset, orderBy, direction });
  }

  const isLoadingMore = isFetchingPosts && requestedOffset !== 0;
  const isInitialLoading = isFetchingPosts && requestedOffset === 0 && loadedPosts.length === 0;

  return (
    <DefaultLayout>
      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8">
        <div className="w-full flex justify-between items-center py-4">
            <Select selectedKeys={[orderBy]} onChange={(e) => {setOrderBy(e.target.value)}}
              defaultSelectedKeys={["dateposted"]}
              radius="full"
              className="w-45"
              classNames={{endContent: "mb-3"}}
              label="Sortowanie"
              endContent={
                <button
                  type="button"
                  aria-label={direction === "DESC" ? "Sortuj rosnąco" : "Sortuj malejąco"}
                  onClick={(e) => {
                    e.stopPropagation();
                    setDirection(direction === "DESC" ? "ASC" : "DESC");
                  }}
                  onPointerDownCapture={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onMouseDownCapture={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  className="p-0 m-0 bg-transparent border-0 cursor-pointer"
                >
                  {direction === "DESC" ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5">
                      <path fillRule="evenodd" d="M12 3.75a.75.75 0 01.75.75v13.19l3.72-3.72a.75.75 0 111.06 1.06l-5.25 5.25a.75.75 0 01-1.06 0l-5.25-5.25a.75.75 0 111.06-1.06l3.72 3.72V4.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-5">
                      <path fillRule="evenodd" d="M12 20.25a.75.75 0 01-.75-.75V6.31l-3.72 3.72a.75.75 0 11-1.06-1.06l5.25-5.25a.75.75 0 011.06 0l5.25 5.25a.75.75 0 11-1.06 1.06l-3.72-3.72v13.19a.75.75 0 01-.75.75z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              }
              >
              <SelectItem key="dateposted">Data publikacji</SelectItem>
              <SelectItem key="likes">Polubienia</SelectItem>
            </Select>
            <div className="flex items-center gap-2">
              
              {user && <Button onPress={() => setIsOpen(true)}>Nowy post</Button>}
            </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-5 items-start">
          <Card className="flex-1 min-w-0 sm:basis-2/3 w-full">
          <CardHeader className="pb-0">
            <h2 className="opacity-80 text-2xl ml-5 mt-3">Posty</h2>
          </CardHeader>
          <CardBody>
            {isInitialLoading && loadedPosts.length === 0 ? (
              <div className="py-6 text-center text-sm opacity-60">Ładowanie postów...</div>
            ) : (
              loadedPosts.map(post => (
                <Post key={post.id} {...post} />
              ))
            )}
            {/* Load more if last chunk was full (10). Hide after shorter chunk */}
            {lastChunkCount === 10 && (
              <div className="flex justify-center mt-4">
                <Button variant="flat" onPress={handleLoadMorePosts} isDisabled={isLoadingMore}>
                  {isLoadingMore ? "Loading..." : "Load more posts"}
                </Button>
              </div>
            )}
          </CardBody>
        </Card>
        <Card className="min-w-0 sm:basis-1/3 hidden sm:block">
          <CardHeader>
            <h2 className="opacity-80 text-2xl">Popularne posty</h2>
          </CardHeader>
          <Divider />
          <CardBody>
            {!isLoadingPopularPosts ? (
              popularPosts?.map((post) => (
                <div key={post.id} className="mb-4 opacity-60">
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
      </div>
        <Modal isOpen={isOpen} placement="top-center" onOpenChange={setIsOpen}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Stwórz nowy post</ModalHeader>
              <ModalBody>
                <form className="flex flex-col gap-4" onSubmit={handleCreatePost}>
                  <Input
                    isRequired
                    label="Tytuł"
                    labelPlacement="outside"
                    name="title"
                    placeholder="Wpisz zwięzły tytuł"
                    value={title}
                    onValueChange={setTitle}
                  />
                  <div className="flex flex-col gap-2">
                    <label className="text-sm opacity-70" htmlFor="content">Treść</label>
                    <textarea
                      id="content"
                      name="content"
                      className="min-h-32 rounded-medium border border-default-200 bg-transparent p-3 outline-none"
                      placeholder="Wpisz treść posta tutaj..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                    />
                  </div>
                  {createError && (
                    <p className="text-sm text-danger-600">Nie byliśmy w stanie stworzyć posta</p>
                  )}
                  <div className="flex gap-2 justify-end">
                    <Button color="danger" variant="flat" onPress={onClose}>
                      Anuluj
                    </Button>
                    <Button color="primary" type="submit" isDisabled={creating} isLoading={creating}>
                      Opublikuj
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

