import { apiFetch } from "./client.js";

function getPosts(cursor) {
  const query = cursor != null ? `?cursor=${cursor}` : "";
  return apiFetch(`/posts${query}`);
}

function createPost(payload) {
  return apiFetch("/posts", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

function getPost(postId) {
  return apiFetch(`/posts/${postId}`);
}

function updatePost(postId, payload) {
  return apiFetch(`/posts/${postId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

function deletePost(postId) {
  return apiFetch(`/posts/${postId}`, { method: "DELETE" });
}

function likePost(postId) {
  return apiFetch(`/posts/${postId}/likes`, { method: "POST" });
}

function unlikePost(postId) {
  return apiFetch(`/posts/${postId}/likes`, { method: "DELETE" });
}

export {
  getPosts,
  createPost,
  getPost,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
};
