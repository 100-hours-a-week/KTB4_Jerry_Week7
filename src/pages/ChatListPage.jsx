import { useEffect } from "react";
import { Link } from "react-router-dom";
import { getRooms } from "../api/chat";
import { useToast } from "../contexts/ToastContext";
import { useChatSocket } from "../contexts/ChatSocketContext";
import { ERROR } from "../constants/messages";
import RoomListItem from "../components/RoomListItem";
import ChatIcon from "../components/icons/ChatIcon";
import useCursorPagination from "../hooks/useCursorPagination";
import useInfiniteScroll from "../hooks/useInfiniteScroll";

export default function ChatListPage() {
  const { showToast } = useToast();
  const { onRoomUpdate } = useChatSocket();

  const {
    items: rooms,
    setItems,
    hasMore,
    isLoading,
    error,
    loadMore,
  } = useCursorPagination({
    fetchPage: async (cursor) => {
      const { ok, body } = await getRooms(cursor);
      if (!ok) {
        showToast(ERROR.chat.cannot_load_rooms, "error");
        throw new Error(ERROR.chat.cannot_load_rooms);
      }
      return body.data.rooms;
    },
    getKey: (room) => room.roomId,
  });

  useEffect(() => {
    return onRoomUpdate((evt) => {
      setItems((prev) => {
        const idx = prev.findIndex((r) => r.roomId === evt.roomId);
        if (idx >= 0) {
          const updated = {
            ...prev[idx],
            lastMessagePreview: evt.lastMessagePreview,
            lastMessageAt: evt.lastMessageAt,
            unreadCount: (prev[idx].unreadCount ?? 0) + 1,
          };
          return [updated, ...prev.slice(0, idx), ...prev.slice(idx + 1)];
        }
        return [
          {
            roomId: evt.roomId,
            partner: evt.partner,
            lastMessagePreview: evt.lastMessagePreview,
            lastMessageAt: evt.lastMessageAt,
            unreadCount: 1,
          },
          ...prev,
        ];
      });
    });
  }, [onRoomUpdate, setItems]);

  const sentinelRef = useInfiniteScroll({
    onLoadMore: loadMore,
    hasMore,
    isLoading,
    error,
  });

  const isEmpty = !isLoading && !hasMore && rooms.length === 0;

  return (
    <main className="mx-auto min-h-full w-full max-w-170 bg-white px-4 pb-8">
      <h2 className="py-6 text-heading text-ink">메시지</h2>

      {isEmpty ? (
        <EmptyState />
      ) : (
        <ul className="flex flex-col">
          {rooms.map((room) => (
            <RoomListItem key={room.roomId} room={room} />
          ))}
        </ul>
      )}

      {error && hasMore && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={loadMore}
            className="cursor-pointer rounded-xl border border-line px-4 py-2 text-label text-ink-muted transition hover:bg-sunken"
          >
            재시도
          </button>
        </div>
      )}
      <div ref={sentinelRef} className="h-10" />
    </main>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center py-24 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-sunken">
        <ChatIcon className="h-9 w-9 text-ink-subtle" />
      </div>
      <p className="mt-6 text-card text-ink">아직 주고받은 대화가 없어요</p>
      <p className="mt-2 text-body text-ink-subtle">
        관심 있는 글의 작성자에게 먼저 말을 걸어보세요
      </p>
      <Link
        to="/"
        className="mt-6 rounded-xl bg-coral px-5 py-2.5 text-label font-bold text-white transition hover:brightness-95"
      >
        게시판 둘러보기
      </Link>
    </div>
  );
}
