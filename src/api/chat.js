import { apiFetch } from "./client";

function getRooms(cursor) {
  const query = cursor != null ? `?cursor=${cursor}` : "";
  return apiFetch(`/chat/rooms${query}`);
}

function createDm(partnerId) {
  return apiFetch("/chat/rooms", {
    method: "POST",
    body: JSON.stringify({ partnerId }),
  });
}

function getRoom(roomId) {
  return apiFetch(`/chat/rooms/${roomId}`);
}

function getMessages(roomId, cursor) {
  const query = cursor != null ? `?cursor=${cursor}` : "";
  return apiFetch(`/chat/rooms/${roomId}/messages${query}`);
}

function markRead(roomId, lastReadMessageId) {
  return apiFetch(`/chat/rooms/${roomId}/read`, {
    method: "POST",
    body: JSON.stringify({ lastReadMessageId }),
  });
}

function deleteMessage(roomId, messageId) {
  return apiFetch(`/chat/rooms/${roomId}/messages/${messageId}`, {
    method: "DELETE",
  });
}

export { getRooms, createDm, getRoom, getMessages, markRead, deleteMessage };
