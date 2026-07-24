import { useState } from "react";
import { getComments, createComment, updateComment, deleteComment } from "../api/comment";
import { formatNow } from "../utils/format";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { useConfirm } from "../contexts/ConfirmContext";
import { ERROR } from "../constants/messages";
import useCursorPagination from "../hooks/useCursorPagination";
import CommentForm from "./CommentForm";
import CommentItem from "./CommentItem";

export default function CommentSection({
  postId,
  initialComments,
  onCommentCountChange,
}) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { confirm } = useConfirm();

  const {
    items: comments,
    setItems: setComments,
    hasMore,
    loadMore,
  } = useCursorPagination({
    fetchPage: async (cursor) => {
      const { ok, body } = await getComments(postId, cursor);
      if (!ok) {
        showToast(ERROR.comment.cannot_load_comments, "error");
        return { items: [], next_cursor: null };
      }
      return body.data.comments;
    },
    initialItems: initialComments?.items ?? [],
    initialCursor: initialComments?.next_cursor ?? null,
  });

  const [editingComment, setEditingComment] = useState(null);

  async function handleSubmit(content) {
    if (editingComment) {
      const res = await updateComment(postId, editingComment.id, content).catch(
        () => ({ ok: false }),
      );
      if (!res.ok) {
        showToast(ERROR.comment.fail_edit, "error");
        return;
      }

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
      if (!res.ok) {
        showToast(ERROR.comment.fail_register, "error");
        return;
      }

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
    if (!res.ok) {
      showToast(ERROR.comment.fail_delete, "error");
      return;
    }

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

      {hasMore && (
        <div className="mt-2 flex justify-center">
          <button
            type="button"
            onClick={loadMore}
            className="mx-auto cursor-pointer rounded-xl border border-line px-4 py-2 text-label text-ink-muted transition hover:bg-sunken"
          >
            댓글 더보기
          </button>
        </div>
      )}
    </div>
  );
}
