import { Link, useNavigate } from "react-router-dom";
import { deletePost } from "../api/post";
import { useConfirm } from "../contexts/ConfirmContext";

export default function PostActions({ postId }) {
  const navigate = useNavigate();
  const { confirm } = useConfirm();

  async function handleDelete() {
    const ok = await confirm({
      title: "게시글을 삭제하시겠습니까?",
      message: "삭제한 내용은 복구할 수 없습니다.",
    });
    if (!ok) return;

    const res = await deletePost(postId).catch(() => ({ ok: false }));
    if (res.ok) {
      navigate("/", { replace: true });
    }
  }

  return (
    <div className="flex gap-2">
      <Link
        to={`/posts/${postId}/edit`}
        className="cursor-pointer rounded-field border border-line px-3 py-1 text-label text-ink-muted transition hover:bg-sunken"
      >
        수정
      </Link>
      <button
        type="button"
        onClick={handleDelete}
        className="cursor-pointer rounded-field border border-line px-3 py-1 text-label text-ink-muted transition hover:bg-sunken"
      >
        삭제
      </button>
    </div>
  );
}
