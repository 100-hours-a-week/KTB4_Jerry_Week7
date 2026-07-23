import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPost } from "../api/post";
import { useAuth } from "../contexts/AuthContext";
import { resolveImageUrl } from "../utils/image";
import { formatCount } from "../utils/format";
import PostImageCarousel from "../components/PostImageCarousel";
import PostBody from "../components/PostBody";
import LikeButton from "../components/LikeButton";
import PostActions from "../components/PostActions";
import CommentSection from "../components/CommentSection";

export default function PostDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentCount, setCommentCount] = useState(0);

  useEffect(() => {
    let alive = true;

    if (!id) {
      navigate("/", { replace: true });
      return;
    }

    getPost(id)
      .then((res) => {
        if (!alive) return;
        if (!res.ok) {
          navigate("/", { replace: true });
          return;
        }
        setPost(res.body.data);
        setCommentCount(res.body.data.comment_count);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [id, navigate]);

  if (loading || !post) return null;

  const isOwner = user && post.writer.id === user.id;

  if (post.is_blinded) {
    return (
      <main className="mx-auto max-w-150 py-8">
        <article>
          <h2 className="text-heading text-ink">
            블라인드 처리된 게시글입니다.
          </h2>
        </article>
      </main>
    );
  }

  const avatar = resolveImageUrl(post.writer.profile_image_url);

  return (
    <main className="mx-auto max-w-150 py-8">
      <article>
        <h2 className="text-heading text-ink">{post.title}</h2>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={avatar}
              alt=""
              className="h-7 w-7 rounded-full bg-avatar object-cover"
            />
            <span className="text-label font-medium text-ink-muted">
              {post.writer.nickname}
            </span>
            <time
              dateTime={post.created_at}
              className="text-caption text-placeholder"
            >
              {post.created_at}
            </time>
          </div>

          {isOwner && <PostActions postId={post.id} />}
        </div>

        <hr className="my-5 border-line" />

        <PostImageCarousel images={post.post_images ?? []} />

        <PostBody content={post.content} />

        <div className="flex items-center gap-4 border-t border-line pt-4 text-label">
          <LikeButton
            postId={post.id}
            initialLiked={post.is_liked ?? false}
            initialCount={post.like_count}
          />
          <span className="text-ink-subtle">
            댓글 {formatCount(commentCount)}
          </span>
          <span className="text-ink-subtle">
            조회수 {formatCount(post.view_count)}
          </span>
        </div>
      </article>

      <CommentSection
        postId={post.id}
        initialComments={post.comments}
        onCommentCountChange={(delta) => setCommentCount((c) => c + delta)}
      />
    </main>
  );
}
