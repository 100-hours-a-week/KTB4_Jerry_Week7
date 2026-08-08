import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getRoom, getMessages, markRead, deleteMessage } from "../api/chat";
import { useAuth } from "../contexts/AuthContext";
import { useChatSocket } from "../contexts/ChatSocketContext";
import { useToast } from "../contexts/ToastContext";
import { ERROR } from "../constants/messages";
import { formatMessageDate } from "../utils/format";
import ChatRoomHeader from "../components/ChatRoomHeader";
import MessageBubble from "../components/MessageBubble";
import MessageComposer from "../components/MessageComposer";
import useInfiniteScroll from "../hooks/useInfiniteScroll";

const SEND_TIMEOUT_MS = 8000;

function rank(m) {
  if (m.status === "failed") return 2;
  if (m.messageId == null) return 1;
  return 0;
}

function cmp(a, b) {
  const ra = rank(a);
  const rb = rank(b);
  if (ra !== rb) return ra - rb;
  if (ra === 0) return a.messageId - b.messageId;
  return (a.localSeq ?? 0) - (b.localSeq ?? 0);
}

function mergeById(a, b) {
  const map = new Map();
  for (const m of a) map.set(m.messageId ?? m.clientMessageId, m);
  for (const m of b) map.set(m.messageId ?? m.clientMessageId, m);
  return [...map.values()].sort(cmp);
}

export default function ChatRoomPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { subscribeRoom, sendMessage, onAck, onSendError, isConnected } =
    useChatSocket();
  const { showToast } = useToast();

  const [partner, setPartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [cursor, setCursor] = useState(undefined);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);

  const scrollRef = useRef(null);
  const pendingScrollRef = useRef(null);
  const loadingOlderRef = useRef(false);

  const messagesRef = useRef([]);
  const timersRef = useRef(new Map());
  const localSeqRef = useRef(0);
  const lastReadSentRef = useRef(0);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const clearTimer = useCallback((cid) => {
    const t = timersRef.current.get(cid);
    if (t) {
      clearTimeout(t);
      timersRef.current.delete(cid);
    }
  }, []);

  const markFailed = useCallback(
    (cid) => {
      clearTimer(cid);
      setMessages((prev) => {
        const i = prev.findIndex((m) => m.clientMessageId === cid && m.status);
        if (i < 0) return prev;
        const next = prev.slice();
        next[i] = { ...prev[i], status: "failed" };
        return next.sort(cmp);
      });
    },
    [clearTimer],
  );

  const startTimer = useCallback(
    (cid) => {
      timersRef.current.set(
        cid,
        setTimeout(() => markFailed(cid), SEND_TIMEOUT_MS),
      );
    },
    [markFailed],
  );

  const handleDiscard = useCallback(
    (cid) => {
      clearTimer(cid);
      setMessages((prev) => prev.filter((m) => m.clientMessageId !== cid));
    },
    [clearTimer],
  );

  const markReadUpTo = useCallback(
    (messageId) => {
      if (messageId == null || messageId <= lastReadSentRef.current) return;
      lastReadSentRef.current = messageId;
      markRead(roomId, messageId);
    },
    [roomId],
  );

  const reconcileIncoming = useCallback(
    (dto) => {
      if (dto.clientMessageId) clearTimer(dto.clientMessageId);
      setMessages((prev) => {
        if (dto.clientMessageId) {
          const i = prev.findIndex(
            (m) => m.clientMessageId === dto.clientMessageId,
          );
          if (i >= 0) {
            const next = prev.slice();
            next[i] = dto;
            return next.sort(cmp);
          }
        }
        if (prev.some((m) => m.messageId === dto.messageId)) return prev;
        return [...prev, dto].sort(cmp);
      });
    },
    [clearTimer],
  );

  useEffect(() => {
    let alive = true;
    getRoom(roomId).then(({ ok, body }) => {
      if (!alive) return;
      if (!ok) {
        showToast(ERROR.chat.cannot_load_rooms, "error");
        navigate("/chat", { replace: true });
        return;
      }
      setPartner(body.data.partner);
    });
    return () => {
      alive = false;
    };
  }, [roomId, navigate, showToast]);

  useEffect(() => {
    let alive = true;
    setMessages([]);
    setCursor(undefined);
    lastReadSentRef.current = 0;

    const unsub = subscribeRoom(roomId, (msg) => {
      const el = scrollRef.current;
      const nearBottom = el
        ? el.scrollHeight - el.scrollTop - el.clientHeight < 120
        : true;
      if (nearBottom) pendingScrollRef.current = { type: "bottom" };
      reconcileIncoming(msg);
      markReadUpTo(msg.messageId);
    });

    (async () => {
      const { ok, body } = await getMessages(roomId);
      if (!alive) return;
      if (!ok) {
        showToast(ERROR.chat.cannot_load_messages, "error");
        return;
      }
      const asc = [...body.data.messages.items].reverse();
      pendingScrollRef.current = { type: "bottom" };
      setMessages((prev) => mergeById(asc, prev));
      setCursor(body.data.messages.next_cursor ?? null);
      markReadUpTo(asc.at(-1)?.messageId ?? null);
    })();

    const timers = timersRef.current;
    return () => {
      alive = false;
      unsub();
      for (const t of timers.values()) clearTimeout(t);
      timers.clear();
    };
  }, [roomId, subscribeRoom, showToast, reconcileIncoming, markReadUpTo]);

  useEffect(() => {
    const offAck = onAck((dto) => {
      if (String(dto.roomId) === String(roomId)) reconcileIncoming(dto);
    });
    const offErr = onSendError((err) => {
      if (err?.clientMessageId) markFailed(err.clientMessageId);
    });
    return () => {
      offAck();
      offErr();
    };
  }, [roomId, onAck, onSendError, reconcileIncoming, markFailed]);

  const loadOlder = useCallback(async () => {
    if (loadingOlderRef.current || cursor == null) return;
    loadingOlderRef.current = true;
    setIsLoadingOlder(true);
    try {
      const { ok, body } = await getMessages(roomId, cursor);
      if (!ok) {
        showToast(ERROR.chat.cannot_load_messages, "error");
        return;
      }
      const older = [...body.data.messages.items].reverse();
      const el = scrollRef.current;
      pendingScrollRef.current = {
        type: "preserve",
        prevHeight: el ? el.scrollHeight : 0,
      };
      setMessages((prev) => mergeById(older, prev));
      setCursor(body.data.messages.next_cursor ?? null);
    } finally {
      loadingOlderRef.current = false;
      setIsLoadingOlder(false);
    }
  }, [roomId, cursor, showToast]);

  const topSentinelRef = useInfiniteScroll({
    onLoadMore: loadOlder,
    hasMore: cursor != null,
    isLoading: isLoadingOlder,
    error: false,
  });

  useLayoutEffect(() => {
    const el = scrollRef.current;
    const pending = pendingScrollRef.current;
    if (!el || !pending) return;
    if (pending.type === "bottom") {
      el.scrollTop = el.scrollHeight;
    } else if (pending.type === "preserve") {
      el.scrollTop += el.scrollHeight - pending.prevHeight;
    }
    pendingScrollRef.current = null;
  }, [messages]);

  const handleSend = useCallback(
    (text) => {
      if (!user) return false;
      const clientMessageId = crypto.randomUUID();
      const ok = sendMessage(roomId, { content: text, clientMessageId });
      if (!ok) return false;

      const optimistic = {
        messageId: null,
        clientMessageId,
        roomId: Number(roomId),
        senderId: user.id,
        content: text,
        deleted: false,
        createdAt: new Date().toISOString(),
        status: "sending",
        localSeq: localSeqRef.current++,
      };
      pendingScrollRef.current = { type: "bottom" };
      setMessages((prev) => [...prev, optimistic].sort(cmp));
      startTimer(clientMessageId);
      return true;
    },
    [roomId, sendMessage, user, startTimer],
  );

  const handleRetry = useCallback(
    (cid) => {
      const msg = messagesRef.current.find((m) => m.clientMessageId === cid);
      if (!msg) return;
      const ok = sendMessage(roomId, {
        content: msg.content,
        clientMessageId: cid,
      });
      if (!ok) return;
      startTimer(cid);
      setMessages((prev) => {
        const i = prev.findIndex((m) => m.clientMessageId === cid);
        if (i < 0) return prev;
        const next = prev.slice();
        next[i] = { ...prev[i], status: "sending" };
        return next.sort(cmp);
      });
    },
    [roomId, sendMessage, startTimer],
  );

  const handleDelete = useCallback(
    async (messageId) => {
      const { ok } = await deleteMessage(roomId, messageId);
      if (!ok) {
        showToast(ERROR.chat.cannot_delete, "error");
        return;
      }
      setMessages((prev) =>
        prev.map((m) =>
          m.messageId === messageId
            ? { ...m, deleted: true, content: null }
            : m,
        ),
      );
    },
    [roomId, showToast],
  );

  const isEmpty = cursor !== undefined && messages.length === 0;

  return (
    <div className="mx-auto flex h-full w-full max-w-170 flex-col bg-white">
      <ChatRoomHeader partner={partner} />

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <div ref={topSentinelRef} className="h-1" />

        {isEmpty && <FirstMessagePrompt />}

        <ul className="flex flex-col gap-2">
          {messages.map((msg, i) => {
            const isMine = user && msg.senderId === user.id;
            const prev = messages[i - 1];
            const curDate = formatMessageDate(msg.createdAt);
            const showDate =
              !prev || formatMessageDate(prev.createdAt) !== curDate;
            const showSender =
              !isMine && (showDate || !prev || prev.senderId !== msg.senderId);

            return (
              <li key={msg.messageId ?? msg.clientMessageId}>
                {showDate && (
                  <div className="my-3 flex justify-center">
                    <span className="rounded-full bg-sunken px-3 py-1 text-caption text-ink-subtle">
                      {curDate}
                    </span>
                  </div>
                )}
                <MessageBubble
                  message={msg}
                  isMine={isMine}
                  senderName={partner?.nickname ?? ""}
                  avatarUrl={partner?.profile_image_url}
                  showSender={showSender}
                  onRetry={handleRetry}
                  onDiscard={handleDiscard}
                  onDelete={handleDelete}
                />
              </li>
            );
          })}
        </ul>
      </div>

      <MessageComposer onSend={handleSend} disabled={!isConnected} />
    </div>
  );
}

function FirstMessagePrompt() {
  return (
    <div className="flex flex-col items-center py-16 text-center">
      <p className="text-card text-ink">먼저 인사를 건네보세요 👋</p>
      <p className="mt-2 text-body text-ink-subtle">
        가벼운 인사로 대화를 시작할 수 있어요
      </p>
    </div>
  );
}
