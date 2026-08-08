import { resolveImageUrl } from "../utils/image";

export default function ChatRoomHeader({ partner }) {
  return (
    <div className="flex flex-col items-center border-b border-line py-6">
      <img
        src={resolveImageUrl(partner?.profile_image_url)}
        alt={partner?.nickname ?? ""}
        className="h-16 w-16 rounded-full bg-avatar object-cover"
      />
      <p className="mt-3 text-heading text-ink">{partner?.nickname ?? ""}</p>
      <p className="mt-1 text-caption text-ink-subtle">1:1 대화</p>
    </div>
  );
}
