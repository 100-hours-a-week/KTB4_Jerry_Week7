import { useState } from "react";

export default function ReplyComposer({ onSubmit, onCancel }) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmed = content.trim();
    if (!trimmed || isSubmitting) return;

    setIsSubmitting(true);
    await onSubmit(trimmed);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2 pl-8">
      <div className="rounded-card border border-line bg-surface p-2">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={2}
          placeholder="답글을 남겨주세요!"
          className="w-full resize-none bg-transparent p-2 text-body text-ink placeholder:text-placeholder focus:outline-none"
          autoFocus
        />
        <div className="flex justify-end gap-2 border-t border-line pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="cursor-pointer px-2 text-caption text-ink-subtle"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={content.trim() === "" || isSubmitting}
            className="cursor-pointer rounded-full bg-coral px-4 py-1.5 text-caption font-bold text-white disabled:opacity-50"
          >
            등록
          </button>
        </div>
      </div>
    </form>
  );
}
