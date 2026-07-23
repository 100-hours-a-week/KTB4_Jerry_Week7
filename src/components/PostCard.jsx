import { Link } from "react-router-dom";
import { formatCount, truncateTitle } from "../utils/format";
import { resolveImageUrl } from "../utils/image";

export default function PostCard({ post }) {
  const title = post.is_blinded
    ? "블라인드 처리된 게시글입니다."
    : truncateTitle(post.title);

  const avatar = resolveImageUrl(post.writer.profile_image_url);

  return (
    <li>
      <Link
        to={`/posts/${post.id}`}
        className="block rounded-card border border-line bg-surface p-5 shadow-sm transition hover:shadow-md"
      >
        <h2
          className={`text-card ${post.is_blinded ? "text-ink-subtle" : "text-ink"}`}
        >
          {title}
        </h2>
        <div className="mt-4 flex items-center justify-between text-caption">
          <div className="flex items-center gap-3 text-ink-subtle">
            <span>♡ {formatCount(post.like_count)}</span>
            <span>댓글 {formatCount(post.comment_count)}</span>
            <span>조회수 {formatCount(post.view_count)}</span>
          </div>
          <div className="flex items-center gap-2">
            <img
              src={avatar}
              alt=""
              className="h-5 w-5 rounded-full bg-avatar object-cover"
            />
            <span className="font-medium text-ink-muted">
              {post.writer.nickname}
            </span>
            <time dateTime={post.created_at} className="text-placeholder">
              {post.created_at}
            </time>
          </div>
        </div>
      </Link>
    </li>
  );
}
