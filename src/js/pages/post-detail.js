import { HTTP_STATUS } from "../constants/httpStatus.js";
import { resolveImageUrl } from "../utils/image.js";
import { goLogin } from "../utils/sessions.js";
import { bindHeaderProfileEvents } from "../components/header.js";
import { commentItem } from "../components/comment.js";
import { confirmModal } from "../components/confirmModal.js";
import { formatCount, formatNow } from "../utils/format.js";
import { getPost, deletePost, likePost, unlikePost } from "../api/post.js";
import { getMyInfo } from "../api/user.js";
import {
  getComments,
  createComment,
  updateComment,
  deleteComment,
} from "../api/comment.js";

const postId = new URLSearchParams(window.location.search).get("id");

const headerProfileAvatar = document.getElementById("headerProfileAvatar");

const postTitle = document.getElementById("postTitle");
const postWriterAvatar = document.getElementById("postWriterAvatar");
const postWriterName = document.getElementById("postWriterName");
const postCreatedAt = document.getElementById("postCreatedAt");
const postImages = document.getElementById("postImages");
const postContent = document.getElementById("postContent");

const postActions = document.getElementById("postActions");
const editPostLink = document.getElementById("editPostLink");

const deletePostBtn = document.getElementById("deletePostBtn");
const likeBtn = document.getElementById("likeBtn");

const likeCount = document.getElementById("likeCount");
const viewCount = document.getElementById("viewCount");
const commentCount = document.getElementById("commentCount");

const commentList = document.getElementById("commentList");
const commentForm = document.getElementById("commentForm");
const commentInput = document.getElementById("commentInput");
const commentSubmit = document.getElementById("commentSubmit");

const loadMoreCommentsBtn = document.getElementById("loadMoreCommentsBtn");

let me = null;
let myId = null;

let liked = false;
let likeCountValue = 0;
let likePending = false;

let commentsData = [];
let editingCommentId = null;
let commentCountValue = 0;

let commentCursor = null;

if (!localStorage.getItem("accessToken")) goLogin();
bindHeaderProfileEvents();

init();

async function init() {
  if (!postId) {
    window.location.href = "/";
    return;
  }

  const [meRes, postRes] = await Promise.all([
    getMyInfo().catch(() => ({ ok: false })),
    getPost(postId).catch(() => ({ ok: false })),
  ]);

  if (meRes.ok) {
    me = meRes.body.data;
    myId = me.id;
    headerProfileAvatar.src = resolveImageUrl(me.profile_image_url);
  }

  if (!postRes.ok) {
    if (postRes.status === HTTP_STATUS.UNAUTHORIZED) return goLogin();
    window.location.href = "/";
    return;
  }

  const post = postRes.body.data;
  renderPost(post);
  renderComments(post.comments);
  applyOwnership(post);
}

function renderPost(post) {
  if (post.is_blinded) {
    postTitle.textContent = "블라인드 처리된 게시글입니다.";
    postContent.textContent = "";
    return;
  }

  postTitle.textContent = post.title;
  postContent.textContent = post.content;
  postWriterName.textContent = post.writer.nickname;
  postWriterAvatar.src = resolveImageUrl(post.writer.profile_image_url);
  postCreatedAt.textContent = post.created_at;
  postCreatedAt.setAttribute("datetime", post.created_at);

  editPostLink.href = `/pages/edit-post.html?id=${post.id}`;

  postImages.innerHTML = (post.post_images ?? [])
    .map(
      (img) =>
        `<img src="${resolveImageUrl(img.url)}" alt="" class="rounded object-cover w-136" />`,
    )
    .join("");

  liked = post.is_liked ?? false;
  likeCountValue = post.like_count;
  renderLike();

  commentCountValue = post.comment_count;
  commentCount.textContent = formatCount(commentCountValue);

  viewCount.textContent = formatCount(post.view_count);
}

function renderLike() {
  likeCount.textContent = formatCount(likeCountValue);
  likeBtn.classList.toggle("bg-like-button-on", liked);
  likeBtn.classList.toggle("bg-like-button-off", !liked);
}

likeBtn.addEventListener("click", async () => {
  if (likePending) return;
  likePending = true;

  // Optimistic UI
  const nextLiked = !liked;

  liked = nextLiked;
  likeCountValue += nextLiked ? 1 : -1;
  renderLike();

  const res = await (nextLiked ? likePost(postId) : unlikePost(postId)).catch(
    () => ({ ok: false }),
  );

  if (!res.ok) {
    liked = !nextLiked;
    likeCountValue += nextLiked ? -1 : 1;
    renderLike();

    if (res.status === HTTP_STATUS.UNAUTHORIZED) goLogin();
  }
  likePending = false;
});

function renderComments(comments) {
  commentsData = comments?.items ?? [];
  commentList.innerHTML = commentsData.map(commentItem).join("");
  commentCursor = comments?.next_cursor ?? null;
  updateLoadMoreBtn();
}

function updateLoadMoreBtn() {
  loadMoreCommentsBtn.classList.toggle("hidden", commentCursor == null);
}

loadMoreCommentsBtn.addEventListener("click", async () => {
  if (commentCursor == null) return;

  loadMoreCommentsBtn.disabled = true;
  const res = await getComments(postId, commentCursor).catch(() => ({
    ok: false,
  }));
  loadMoreCommentsBtn.disabled = false;

  if (!res.ok) {
    if (res.status === HTTP_STATUS.UNAUTHORIZED) return goLogin();
    return;
  }

  const { items, next_cursor } = res.body.data.comments;
  const html = items.map(commentItem).join("");

  // 실제 프레임워크 사용하면 낙관적 UI 적용하는 동안 백그라운드에서 받아와서 이 과정 필요 없을 수도 있다고 생각.
  const addedOptimistic = commentList.querySelector('[data-optimistic="true"]');
  if (addedOptimistic) {
    addedOptimistic.insertAdjacentHTML("beforebegin", html);
  } else {
    commentList.insertAdjacentHTML("beforeend", html);
  }

  commentsData.push(...items);
  applyCommentOwnership();

  commentCursor = next_cursor ?? null;
  updateLoadMoreBtn();
});

function applyOwnership(post) {
  const isMyPost = myId != null && post.writer.id === myId;
  postActions.classList.toggle("hidden", !isMyPost);
  postActions.classList.toggle("flex", isMyPost);

  applyCommentOwnership();
}

function applyCommentOwnership() {
  commentList.querySelectorAll("[data-comment-id]").forEach((li) => {
    const isMine = myId != null && Number(li.dataset.writerId) === myId;
    if (isMine) {
      li.querySelector(".comment-actions")?.classList.remove("hidden");
      li.querySelector(".comment-actions")?.classList.add("flex");
    }
  });
}

commentInput.addEventListener("input", () => {
  commentSubmit.disabled = commentInput.value.trim() === "";
});

function resetCommentForm() {
  editingCommentId = null;
  commentInput.value = "";
  commentSubmit.textContent = "댓글 등록";
  commentSubmit.disabled = true;
}

commentForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const content = commentInput.value.trim();
  if (!content) return;

  commentSubmit.disabled = true;

  const res = await (
    editingCommentId == null
      ? createComment(postId, content)
      : updateComment(postId, editingCommentId, content)
  ).catch(() => ({ ok: false }));

  if (!res.ok) {
    if (res.status === HTTP_STATUS.UNAUTHORIZED) return goLogin();
    commentSubmit.disabled = false;
    return;
  }

  if (editingCommentId == null) {
    // Optimistic UI
    const newComment = {
      id: res.body.data.id,
      content,
      created_at: formatNow(),
      writer: {
        id: me.id,
        nickname: me.nickname,
        profile_image_url: me.profile_image_url,
      },
      is_deleted: false,
    };
    commentsData.push(newComment);
    commentList.insertAdjacentHTML("beforeend", commentItem(newComment));
    commentList.lastElementChild.setAttribute("data-optimistic", "true");
    applyCommentOwnership();

    commentCountValue += 1;
    commentCount.textContent = formatCount(commentCountValue);
  } else {
    const li = commentList.querySelector(
      `[data-comment-id="${editingCommentId}"]`,
    );
    li?.querySelector("p").replaceChildren(content);

    const c = commentsData.find((cd) => cd.id === editingCommentId);
    if (c) {
      c.content = content;
    }
  }

  resetCommentForm();
});

function startEditComment(commentId) {
  const c = commentsData.find((cd) => cd.id === commentId);
  if (!c) return;

  editingCommentId = commentId;
  commentInput.value = c.content;
  commentSubmit.textContent = "댓글 수정";
  commentSubmit.disabled = false;
  commentInput.focus();
}

async function requestDeleteComment(commentId) {
  const ok = await confirmModal({
    title: "댓글을 삭제하시겠습니까?",
    message: "삭제한 내용은 복구할 수 없습니다.",
  });
  if (!ok) return;

  const res = await deleteComment(postId, commentId).catch(() => ({
    ok: false,
  }));
  if (!res.ok) {
    if (res.status === HTTP_STATUS.UNAUTHORIZED) return goLogin();
    return;
  }

  commentList.querySelector(`[data-comment-id="${commentId}"]`)?.remove();
  commentsData = commentsData.filter((cd) => cd.id !== commentId);
  commentCountValue -= 1;
  commentCount.textContent = formatCount(commentCountValue);
}

commentList.addEventListener("click", (e) => {
  const li = e.target.closest("[data-comment-id]");
  if (!li) return;

  const commentId = Number(li.dataset.commentId);
  if (e.target.closest(".comment-edit")) {
    startEditComment(commentId);
  } else if (e.target.closest(".comment-delete")) {
    requestDeleteComment(commentId);
  }
});

deletePostBtn.addEventListener("click", async () => {
  const ok = await confirmModal({
    title: "게시글을 삭제하시겠습니까?",
    message: "삭제한 내용은 복구할 수 없습니다.",
  });
  if (!ok) return;

  const res = await deletePost(postId).catch(() => ({ ok: false }));
  if (res.ok) {
    window.location.href = "/";
    return;
  }
  if (res.status === HTTP_STATUS.UNAUTHORIZED) return goLogin();
});
