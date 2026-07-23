import { useState } from "react";
import { getReplies, createComment } from "../api/comment";
import { formatNow } from "../utils/format";
import { resolveImageUrl } from "../utils/image";
import { useAuth } from "../contexts/AuthContext";
import ReplyItem from "./ReplyItem";
import ReplyComposer from "./ReplyComposer";

export default function CommentItem({
  comment,
  postId,
  onEdit,
  onDelete,
  onCommentCountChange,
}) {
  const { user } = useAuth();
  const isMine = user && comment.writer?.id === user.id;

  const [replies, setReplies] = useState(comment.replies?.items ?? []);
  const [replyCursor, setReplyCursor] = useState(
    comment.replies?.next_cursor ?? null,
  );
  const [showComposer, setShowComposer] = useState(false);

  if (comment.is_deleted) {
    return (
      <li className="border-b border-line py-4">
        <p className="p-2 text-body text-ink-subtle line-through">
          삭제된 댓글입니다.
        </p>
        <ul className="mt-2 flex flex-col gap-1.5 pl-8">
          {replies.map((r) => (
            <ReplyItem key={r.id} reply={r} />
          ))}
        </ul>
        {replyCursor != null && (
          <button
            type="button"
            onClick={handleLoadMoreReplies}
            className="mt-1 cursor-pointer pl-8 text-caption font-medium text-coral-strong"
          >
            답글 더 보기
          </button>
        )}
      </li>
    );
  }

  const avatar = resolveImageUrl(comment.writer.profile_image_url);

  async function handleLoadMoreReplies() {
    const res = await getReplies(postId, comment.id, replyCursor).catch(() => ({
      ok: false,
    }));
    if (!res.ok) return;

    const { items, next_cursor } = res.body.data.comments;
    const seen = new Set(replies.map((r) => r.id));
    const newItems = items.filter((r) => !seen.has(r.id));

    setReplies((prev) => [...prev, ...newItems]);
    setReplyCursor(next_cursor ?? null);
  }

  async function handleReplySubmit(content) {
    const res = await createComment(postId, content, comment.id).catch(() => ({
      ok: false,
    }));
    if (!res.ok) return;

    const reply = {
      id: res.body.data.id,
      content,
      created_at: res.body.data.created_at ?? formatNow(),
      writer: {
        id: user.id,
        nickname: user.nickname,
        profile_image_url: user.profile_image_url,
      },
      is_deleted: false,
    };

    setReplies((prev) => [...prev, reply]);
    onCommentCountChange(1);
    setShowComposer(false);
  }

  return (
    <li className="border-b border-line py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img
            src={avatar}
            alt=""
            className="h-6 w-6 rounded-full bg-avatar object-cover"
          />
          <span className="text-label font-bold text-ink">
            {comment.writer.nickname}
          </span>
          <time
            dateTime={comment.created_at}
            className="text-caption text-placeholder"
          >
            {comment.created_at}
          </time>
        </div>
        {isMine && (
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => onEdit(comment)}
              className="cursor-pointer text-caption text-ink-subtle transition hover:text-ink"
            >
              수정
            </button>
            <button
              type="button"
              onClick={() => onDelete(comment.id)}
              className="cursor-pointer text-caption text-ink-subtle transition hover:text-danger"
            >
              삭제
            </button>
          </div>
        )}
      </div>

      <p className="mt-1.5 pl-8 text-body text-ink">{comment.content}</p>

      <div className="mt-1.5 pl-8">
        <button
          type="button"
          onClick={() => setShowComposer(true)}
          className="cursor-pointer text-caption font-medium text-coral-strong"
        >
          답글 달기
        </button>
      </div>

      {showComposer && (
        <ReplyComposer
          onSubmit={handleReplySubmit}
          onCancel={() => setShowComposer(false)}
        />
      )}

      <ul className="mt-2 flex flex-col gap-1.5 pl-8">
        {replies.map((r) => (
          <ReplyItem key={r.id} reply={r} />
        ))}
      </ul>

      {replyCursor != null && (
        <button
          type="button"
          onClick={handleLoadMoreReplies}
          className="mt-1 cursor-pointer pl-8 text-caption font-medium text-coral-strong"
        >
          답글 더 보기
        </button>
      )}
    </li>
  );
}
