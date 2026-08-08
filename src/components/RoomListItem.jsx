import { Link } from "react-router-dom";
import { resolveImageUrl } from "../utils/image";
import { formatRoomListTime } from "../utils/format";

export default function RoomListItem({ room }) {
  const { roomId, partner, lastMessagePreview, lastMessageAt, unreadCount } =
    room;

  return (
    <li>
      <Link
        to={`/chat/${roomId}`}
        className="flex items-center gap-4 border-b border-line px-2 py-4 transition hover:bg-sunken"
      >
        <img
          src={resolveImageUrl(partner.profile_image_url)}
          alt={partner.nickname}
          className="h-14 w-14 shrink-0 rounded-full bg-avatar object-cover"
        />

        <div className="min-w-0 flex-1">
          <p className="text-card text-ink">{partner.nickname}</p>
          <p className="mt-1 truncate text-body text-ink-subtle">
            {lastMessagePreview ?? ""}
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <span className="text-caption text-ink-subtle">
            {formatRoomListTime(lastMessageAt)}
          </span>
          {unreadCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-coral px-1.5 text-caption font-bold text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </div>
      </Link>
    </li>
  );
}
