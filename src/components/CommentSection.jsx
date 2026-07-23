import { useState } from "react";
import { getComments, createComment, updateComment, deleteComment } from "../api/comment";
import { formatNow } from "../utils/format";
import { useAuth } from "../contexts/AuthContext";
import { useConfirm } from "../contexts/ConfirmContext";
import CommentForm from "./CommentForm";
import CommentItem from "./CommentItem";

export default function CommentSection({
  postId,
  initialComments,
  onCommentCountChange,
}) {
  const { user } = useAuth();
  const { confirm } = useConfirm();

  const [comments, setComments] = useState(initialComments?.items ?? []);
  const [commentCursor, setCommentCursor] = useState(
    initialComments?.next_cursor ?? null,
  );
  const [editingComment, setEditingComment] = useState(null);

  async function handleSubmit(content) {
    if (editingComment) {
      const res = await updateComment(postId, editingComment.id, content).catch(
        () => ({ ok: false }),
      );
      if (!res.ok) return;

      setComments((prev) =>
        prev.map((c) =>
          c.id === editingComment.id ? { ...c, content } : c,
        ),
      );
      setEditingComment(null);
    } else {
      const res = await createComment(postId, content).catch(() => ({
        ok: false,
      }));
      if (!res.ok) return;

      const newComment = {
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
      setComments((prev) => [...prev, newComment]);
      onCommentCountChange(1);
    }
  }

  async function handleDelete(commentId) {
    const ok = await confirm({
      title: "댓글을 삭제하시겠습니까?",
      message: "삭제한 내용은 복구할 수 없습니다.",
    });
    if (!ok) return;

    const res = await deleteComment(postId, commentId).catch(() => ({
      ok: false,
    }));
    if (!res.ok) return;

    const target = comments.find((c) => c.id === commentId);
    const hasReplies = target?.replies?.items?.length > 0;

    if (hasReplies) {
      setComments((prev) =>
        prev.map((c) =>
          c.id === commentId ? { ...c, is_deleted: true } : c,
        ),
      );
    } else {
      setComments((prev) => prev.filter((c) => c.id !== commentId));
    }
    onCommentCountChange(-1);
  }

  async function handleLoadMore() {
    if (commentCursor == null) return;

    const res = await getComments(postId, commentCursor).catch(() => ({
      ok: false,
    }));
    if (!res.ok) return;

    const { items, next_cursor } = res.body.data.comments;
    const seen = new Set(comments.map((c) => c.id));
    const newItems = items.filter((c) => !seen.has(c.id));

    setComments((prev) => [...prev, ...newItems]);
    setCommentCursor(next_cursor ?? null);
  }

  return (
    <div>
      <hr className="my-6 border-line" />

      <section>
        <h3 className="text-heading text-ink">댓글</h3>

        <CommentForm
          editingComment={editingComment}
          onSubmit={handleSubmit}
          onCancelEdit={() => setEditingComment(null)}
        />
      </section>

      <ul className="mt-4 flex flex-col">
        {comments.map((c) => (
          <CommentItem
            key={c.id}
            comment={c}
            postId={postId}
            onEdit={setEditingComment}
            onDelete={handleDelete}
            onCommentCountChange={onCommentCountChange}
          />
        ))}
      </ul>

      {commentCursor != null && (
        <div className="mt-2 flex justify-center">
          <button
            type="button"
            onClick={handleLoadMore}
            className="mx-auto cursor-pointer rounded-xl border border-line px-4 py-2 text-label text-ink-muted transition hover:bg-sunken"
          >
            댓글 더보기
          </button>
        </div>
      )}
    </div>
  );
}
