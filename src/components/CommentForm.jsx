import { useState, useEffect, useRef } from "react";

export default function CommentForm({ editingComment, onSubmit, onCancelEdit }) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef(null);

  const isEditing = editingComment !== null;

  useEffect(() => {
    if (editingComment) {
      setContent(editingComment.content);
      inputRef.current?.focus();
    } else {
      setContent("");
    }
  }, [editingComment]);

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed || isSubmitting) return;

    setIsSubmitting(true);
    await onSubmit(trimmed);
    setContent("");
    setIsSubmitting(false);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      e.currentTarget.form.requestSubmit();
    }
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className="mt-4 rounded-card border border-line bg-surface p-3"
    >
      <textarea
        ref={inputRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={3}
        placeholder="댓글을 남겨주세요!"
        className="w-full resize-none bg-transparent p-2 text-body text-ink placeholder:text-placeholder focus:outline-none"
      />
      <div className="flex justify-end gap-2 border-t border-line pt-3">
        {isEditing && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="cursor-pointer rounded-xl border border-line px-5 py-2 text-label text-ink-muted transition hover:bg-sunken"
          >
            취소
          </button>
        )}
        <button
          type="submit"
          disabled={content.trim() === "" || isSubmitting}
          className="cursor-pointer rounded-xl bg-coral px-5 py-2 text-label font-bold text-white transition hover:brightness-95 disabled:opacity-50"
        >
          {isEditing ? "댓글 수정" : "댓글 등록"}
        </button>
      </div>
    </form>
  );
}
