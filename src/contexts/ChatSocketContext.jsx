import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import { Client } from "@stomp/stompjs";
import { WS_BASE_URL } from "../constants/config";
import { getToken, refreshAccessToken, notifyAuthFailure } from "../api/client";
import { useAuth } from "./AuthContext";

const ChatSocketContext = createContext(null);

function isAuthError(frame) {
  return frame?.headers?.message === "invalid_token";
}

export default function ChatSocketProvider({ children }) {
  const { isAuthenticated } = useAuth();

  const clientRef = useRef(null);
  const subscriptionsRef = useRef(new Map());
  const liveSubsRef = useRef(new Map());

  const ackListenersRef = useRef(new Set());
  const errorListenersRef = useRef(new Set());
  const roomUpdateListenersRef = useRef(new Set());

  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;

    const client = new Client({
      brokerURL: `${WS_BASE_URL}/ws`,
      reconnectDelay: 3000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      debug: import.meta.env.DEV
        ? (msg) => console.log("[STOMP]", msg)
        : () => {},

      beforeConnect: () => {
        const token = getToken();
        client.configure({
          connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
        });
      },

      onConnect: () => {
        setIsConnected(true);

        liveSubsRef.current.set(
          "/user/queue/acks",
          client.subscribe("/user/queue/acks", (frame) => {
            const dto = JSON.parse(frame.body);
            for (const fn of ackListenersRef.current) fn(dto);
          }),
        );
        liveSubsRef.current.set(
          "/user/queue/errors",
          client.subscribe("/user/queue/errors", (frame) => {
            const err = JSON.parse(frame.body);
            for (const fn of errorListenersRef.current) fn(err);
          }),
        );
        liveSubsRef.current.set(
          "/user/queue/rooms",
          client.subscribe("/user/queue/rooms", (frame) => {
            const evt = JSON.parse(frame.body);
            for (const fn of roomUpdateListenersRef.current) fn(evt);
          }),
        );

        for (const [dest, handler] of subscriptionsRef.current) {
          liveSubsRef.current.set(dest, client.subscribe(dest, handler));
        }
      },

      onWebSocketClose: () => {
        setIsConnected(false);
        liveSubsRef.current.clear();
      },

      onStompError: (frame) => {
        if (!isAuthError(frame)) {
          console.error("[STOMP] error:", frame.headers?.message, frame.body);
          return;
        }

        client.deactivate();
        refreshAccessToken().then((newToken) => {
          if (newToken) {
            client.activate();
          } else {
            notifyAuthFailure();
          }
        });
      },
    });

    clientRef.current = client;
    client.activate();

    return () => {
      client.deactivate();
      clientRef.current = null;
      liveSubsRef.current.clear();
    };
  }, [isAuthenticated]);

  const subscribeRoom = useCallback((roomId, onMessage) => {
    const dest = `/topic/chat/rooms/${roomId}`;
    const handler = (frame) => onMessage(JSON.parse(frame.body));

    subscriptionsRef.current.set(dest, handler);

    const client = clientRef.current;
    if (client && client.connected) {
      liveSubsRef.current.set(dest, client.subscribe(dest, handler));
    }

    return () => {
      subscriptionsRef.current.delete(dest);
      liveSubsRef.current.get(dest)?.unsubscribe();
      liveSubsRef.current.delete(dest);
    };
  }, []);

  const onAck = useCallback((fn) => {
    ackListenersRef.current.add(fn);
    return () => ackListenersRef.current.delete(fn);
  }, []);

  const onSendError = useCallback((fn) => {
    errorListenersRef.current.add(fn);
    return () => errorListenersRef.current.delete(fn);
  }, []);

  const onRoomUpdate = useCallback((fn) => {
    roomUpdateListenersRef.current.add(fn);
    return () => roomUpdateListenersRef.current.delete(fn);
  }, []);

  const sendMessage = useCallback((roomId, payload) => {
    const client = clientRef.current;
    if (!client || !client.connected) return false;
    client.publish({
      destination: `/app/chat/rooms/${roomId}`,
      body: JSON.stringify(payload),
    });
    return true;
  }, []);

  const value = useMemo(
    () => ({
      subscribeRoom,
      sendMessage,
      onAck,
      onSendError,
      onRoomUpdate,
      isConnected,
    }),
    [subscribeRoom, sendMessage, onAck, onSendError, onRoomUpdate, isConnected],
  );

  return (
    <ChatSocketContext.Provider value={value}>
      {children}
    </ChatSocketContext.Provider>
  );
}

export function useChatSocket() {
  return useContext(ChatSocketContext);
}
