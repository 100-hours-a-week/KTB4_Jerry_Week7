import { resolveImageUrl } from "../utils/image";
import { formatMessageTime } from "../utils/format";
import RetryIcon from "./icons/RetryIcon";
import TrashIcon from "./icons/TrashIcon";
import CloseIcon from "./icons/CloseIcon";

export default function MessageBubble({
  message,
  isMine,
  senderName,
  avatarUrl,
  showSender,
  onRetry,
  onDiscard,
  onDelete,
}) {
  const { content, deleted, createdAt, clientMessageId } = message;
  const status = message.status ?? "sent";
  const time = formatMessageTime(createdAt);

  const body = deleted ? (
    <span className="whitespace-nowrap italic opacity-70">
      삭제된 메시지입니다
    </span>
  ) : (
    <span className="whitespace-pre-wrap wrap-break-word">{content}</span>
  );

  if (isMine) {
    const meta =
      status === "failed" ? (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onRetry?.(clientMessageId)}
            className="text-ink-subtle transition hover:text-coral"
          >
            <RetryIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onDiscard?.(clientMessageId)}
            className="text-ink-subtle transition hover:text-coral"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      ) : status === "sending" ? null : (
        <span className="text-caption text-ink-subtle">{time}</span>
      );

    const canDelete = !deleted && message.messageId != null;

    return (
      <div className="flex items-end justify-end gap-2">
        <div className="flex shrink-0 flex-col items-end">{meta}</div>
        <div
          className={`group relative max-w-[70%] rounded-2xl rounded-tr-sm bg-coral px-3.5 py-2 text-body text-white ${
            status === "sending" ? "opacity-60" : ""
          }`}
        >
          {canDelete && (
            <button
              type="button"
              onClick={() => onDelete?.(message.messageId)}
              className="absolute -right-2 -top-2 z-10 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-white/70 text-ink-subtle shadow-sm opacity-0 transition group-hover:opacity-100 hover:bg-white hover:text-coral"
            >
              <CloseIcon className="h-3 w-3" />
            </button>
          )}
          {body}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2">
      {showSender ? (
        <img
          src={resolveImageUrl(avatarUrl)}
          alt=""
          className="h-9 w-9 shrink-0 rounded-full bg-avatar object-cover"
        />
      ) : (
        <div className="w-9 shrink-0" aria-hidden="true" />
      )}

      <div className="min-w-0">
        {showSender && (
          <p className="mb-1 text-caption text-ink-muted">{senderName}</p>
        )}
        <div className="flex items-end gap-2">
          <div className="max-w-[70%] rounded-2xl rounded-tl-sm bg-sunken px-3.5 py-2 text-body text-ink">
            {body}
          </div>
          <span className="shrink-0 text-caption text-ink-subtle">{time}</span>
        </div>
      </div>
    </div>
  );
}
