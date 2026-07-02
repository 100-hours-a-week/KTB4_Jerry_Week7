import { apiFetch } from "./client.js";

/**
 *  게시글 목록 조회
 */
function getPosts(cursor) {
  const query = cursor != null ? `?cursor=${cursor}` : "";
  return apiFetch(`/posts${query}`);
}

/**
 *  게시글 추가
 */
function createPost(payload) {
  return apiFetch("/posts", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 *  게시글 상세조회
 */
function getPost(postId) {
  return apiFetch(`/posts/${postId}`);
}

/**
 *  게시글 수정
 */
function updatePost(postId, payload) {
  return apiFetch(`/posts/${postId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

/**
 *  게시글 삭제
 */
function deletePost(postId) {
  return apiFetch(`/posts/${postId}`, { method: "DELETE" });
}

/**
 *  게시글 좋아요
 */
function likePost(postId) {
  return apiFetch(`/posts/${postId}/likes`, { method: "POST" });
}

/**
 *  게시글 좋아요 취소
 */
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
