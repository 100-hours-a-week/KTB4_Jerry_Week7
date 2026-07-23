import { resolveImageUrl } from "../utils/image";

export default function ReplyItem({ reply }) {
  const avatar = resolveImageUrl(reply.writer.profile_image_url);

  return (
    <li className="rounded-card bg-sunken px-3 py-2.5">
      <div className="flex items-center gap-2">
        <img
          src={avatar}
          alt=""
          className="h-5 w-5 rounded-full bg-avatar object-cover"
        />
        <span className="text-caption font-bold text-ink">
          {reply.writer.nickname}
        </span>
        <time dateTime={reply.created_at} className="text-caption text-placeholder">
          {reply.created_at}
        </time>
      </div>
      <p className="mt-1 pl-7 text-body text-ink">{reply.content}</p>
    </li>
  );
}
