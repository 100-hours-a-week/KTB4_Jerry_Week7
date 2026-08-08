import { useState } from "react";

export default function MessageComposer({ onSend, disabled }) {
  const [text, setText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    const sent = onSend(trimmed);
    if (sent) setText("");
  };

  return (
    <form onSubmit={handleSubmit} className="shrink-0 bg-white px-4 pt-1 pb-3">
      <div className="flex items-center gap-2.5 rounded-xl border border-line bg-field py-2 pr-2 pl-4.5">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="메시지를 입력하세요"
          className="min-w-0 flex-1 bg-transparent text-body text-ink placeholder:text-placeholder focus:outline-none"
        />
        <button
          type="submit"
          disabled={disabled || !text.trim()}
          className="cursor-pointer shrink-0 rounded-field bg-coral px-5 py-2.5 text-button text-white transition hover:brightness-95 disabled:opacity-50"
        >
          전송
        </button>
      </div>
    </form>
  );
}
