import { apiFetch } from "./client.js";

function getComments(postId, cursor) {
  const query = cursor != null ? `?cursor=${cursor}` : "";
  return apiFetch(`/posts/${postId}/comments${query}`);
}

function createComment(postId, content, parentId) {
  const payload = { content };
  if (parentId != null) {
    payload.parent_id = parentId;
  }

  return apiFetch(`/posts/${postId}/comments`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

function updateComment(postId, commentId, content) {
  return apiFetch(`/posts/${postId}/comments/${commentId}`, {
    method: "PUT",
    body: JSON.stringify({ content }),
  });
}

function deleteComment(postId, commentId) {
  return apiFetch(`/posts/${postId}/comments/${commentId}`, {
    method: "DELETE",
  });
}

export { getComments, createComment, updateComment, deleteComment };
