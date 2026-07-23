import { useState, useRef } from "react";
import { likePost, unlikePost } from "../api/post";
import { formatCount } from "../utils/format";

export default function LikeButton({ postId, initialLiked, initialCount }) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const pendingRef = useRef(false);

  async function handleClick() {
    if (pendingRef.current) return;
    pendingRef.current = true;

    const nextLiked = !liked;
    setLiked(nextLiked);
    setCount((c) => c + (nextLiked ? 1 : -1));

    const res = await (nextLiked
      ? likePost(postId)
      : unlikePost(postId)
    ).catch(() => ({ ok: false }));

    if (!res.ok) {
      setLiked(!nextLiked);
      setCount((c) => c + (nextLiked ? -1 : 1));
    }

    pendingRef.current = false;
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`flex cursor-pointer items-center gap-2 rounded-2xl px-4 py-2 font-bold transition ${
        liked ? "bg-sage text-white" : "bg-sunken text-ink-muted"
      }`}
    >
      <span>♥</span>
      <span>좋아요 {formatCount(count)}</span>
    </button>
  );
}
