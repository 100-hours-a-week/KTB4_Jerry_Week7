import { Link } from "react-router-dom";
import { getPosts } from "../api/post";
import { useToast } from "../contexts/ToastContext";
import { ERROR } from "../constants/messages";
import PostCard from "../components/PostCard";
import useCursorPagination from "../hooks/useCursorPagination";
import useInfiniteScroll from "../hooks/useInfiniteScroll";

export default function PostListPage() {
  const { showToast } = useToast();

  const {
    items: posts,
    hasMore,
    isLoading,
    error,
    loadMore,
  } = useCursorPagination({
    fetchPage: async (cursor) => {
      const { ok, body } = await getPosts(cursor);
      if (!ok) {
        showToast(ERROR.post.cannot_load_posts, "error");
        throw new Error(ERROR.post.cannot_load_posts);
      }
      return body.data.posts;
    },
  });

  const sentinelRef = useInfiniteScroll({
    onLoadMore: loadMore,
    hasMore,
    isLoading,
    error,
  });

  return (
    <main className="mx-auto w-full max-w-170 pb-8">
      <p className="py-8 text-center text-[1.375rem] font-medium leading-snug text-ink">
        게시판을 두드려봐요,{" "}
        <span className="font-bold text-coral-strong">톡톡</span>
      </p>

      <div className="flex items-center justify-between">
        <h2 className="text-heading text-ink">전체 글</h2>
        <Link
          to="/posts/new"
          className="rounded-xl bg-coral px-5 py-2.5 text-label font-bold text-white transition hover:brightness-95"
        >
          글쓰기
        </Link>
      </div>

      <ul className="mt-4 flex flex-col gap-4">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </ul>
      {error && hasMore && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={loadMore}
            className="cursor-pointer rounded-xl border border-line px-4 py-2 text-label text-ink-muted transition hover:bg-sunken"
          >
            재시도
          </button>
        </div>
      )}
      <div ref={sentinelRef} className="h-10" />
    </main>
  );
}
