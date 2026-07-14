import { HTTP_STATUS } from "../constants/httpStatus.js";
import { resolveImageUrl } from "../utils/image.js";
import { goLogin } from "../utils/sessions.js";
import { commentItem, replyItem } from "../components/comment.js";
import { confirmModal } from "../components/confirmModal.js";
import { formatCount, formatNow } from "../utils/format.js";
import { getPost, deletePost, likePost, unlikePost } from "../api/post.js";
import { getMyInfo } from "../api/user.js";
import {
  getComments,
  getReplies,
  createComment,
  updateComment,
  deleteComment,
} from "../api/comment.js";
import { mountHeader } from "../components/header.js";
import { reloadOnBFCacheRestore } from "../utils/bfcache.js";
import { showToast } from "../utils/toast.js";
import { ERROR } from "../constants/messages.js";

const postId = new URLSearchParams(window.location.search).get("id");

const postMeta = document.getElementById("postMeta");
const postTitle = document.getElementById("postTitle");
const postWriterAvatar = document.getElementById("postWriterAvatar");
const postWriterName = document.getElementById("postWriterName");
const postCreatedAt = document.getElementById("postCreatedAt");
const postContent = document.getElementById("postContent");

const postActions = document.getElementById("postActions");
const editPostLink = document.getElementById("editPostLink");

const deletePostBtn = document.getElementById("deletePostBtn");
const likeBtn = document.getElementById("likeBtn");

const postStats = document.getElementById("postStats");
const likeCount = document.getElementById("likeCount");
const viewCount = document.getElementById("viewCount");
const commentCount = document.getElementById("commentCount");

const commentSection = document.getElementById("commentSection");
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

mountHeader();

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
  }

  if (!postRes.ok) {
    if (postRes.status === HTTP_STATUS.UNAUTHORIZED) return goLogin();
    window.location.href = "/";
    return;
  }

  const post = postRes.body.data;
  renderPost(post);
  if (!post.is_blinded) renderComments(post.comments);
  applyOwnership(post);
}

function renderPost(post) {
  if (post.is_blinded) {
    postTitle.textContent = "블라인드 처리된 게시글입니다.";
    postContent.textContent = "";
    postMeta.classList.add("hidden");
    postStats.classList.add("hidden");
    commentSection.classList.add("hidden");
    return;
  }

  postTitle.textContent = post.title;
  postContent.textContent = post.content;
  postWriterName.textContent = post.writer.nickname;
  postWriterAvatar.src = resolveImageUrl(post.writer.profile_image_url);
  postCreatedAt.textContent = post.created_at;
  postCreatedAt.setAttribute("datetime", post.created_at);

  editPostLink.href = `/pages/edit-post.html?id=${post.id}`;

  initCarousel(post.post_images ?? []);

  liked = post.is_liked ?? false;
  likeCountValue = post.like_count;
  renderLike();

  commentCountValue = post.comment_count;
  commentCount.textContent = formatCount(commentCountValue);

  viewCount.textContent = formatCount(post.view_count);
}

function initCarousel(images) {
  const container = document.getElementById("postImages");
  const track = document.getElementById("carouselTrack");
  const dots = document.getElementById("carouselDots");
  const prev = document.getElementById("carouselPrev");
  const next = document.getElementById("carouselNext");

  if (!images.length) {
    container.classList.add("hidden");
    return;
  }
  container.classList.remove("hidden");

  track.innerHTML = images
    .map(
      (img) =>
        `<img src="${resolveImageUrl(img.url)}" alt="" class="h-90 w-full shrink-0 object-cover" />`,
    )
    .join("");

  dots.classList.toggle("hidden", images.length <= 1);
  dots.innerHTML = images
    .map(
      (_, i) =>
        `<span class="w-1.5 h-1.5 rounded-full ${i === 0 ? "bg-white" : "bg-white/50"}"></span>`,
    )
    .join("");

  let index = 0;
  const update = () => {
    track.style.transform = `translateX(-${index * 100}%)`;
    [...dots.children].forEach((d, i) => {
      d.className = `w-1.5 h-1.5 rounded-full ${i === index ? "bg-white" : "bg-white/50"}`;
    });
    prev.classList.toggle("hidden", index === 0);
    next.classList.toggle("hidden", index === images.length - 1);
  };

  prev.addEventListener("click", () => {
    if (index > 0) {
      index--;
      update();
    }
  });

  next.addEventListener("click", () => {
    if (index < images.length - 1) {
      index++;
      update();
    }
  });

  update();
}

function renderLike() {
  likeCount.textContent = formatCount(likeCountValue);

  likeBtn.classList.toggle("bg-sage", liked);
  likeBtn.classList.toggle("text-white", liked);
  likeBtn.classList.toggle("bg-sunken", !liked);
  likeBtn.classList.toggle("text-ink-muted", !liked);
}

likeBtn.addEventListener("click", async () => {
  if (likePending) return;
  likePending = true;

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
    else showToast(ERROR.api.default, "error");
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
    showToast(ERROR.api.default, "error");
    return;
  }

  const { items, next_cursor } = res.body.data.comments;
  const seen = new Set(commentsData.map((c) => c.id));
  const newItems = items.filter((c) => !seen.has(c.id));
  const html = newItems.map(commentItem).join("");

  const addedOptimistic = commentList.querySelector('[data-optimistic="true"]');
  if (addedOptimistic) {
    addedOptimistic.insertAdjacentHTML("beforebegin", html);
  } else {
    commentList.insertAdjacentHTML("beforeend", html);
  }

  commentsData.push(...newItems);
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

commentInput.addEventListener("keydown", (e) => {
  if (e.key == "Enter" && !e.shiftKey && !e.isComposing) {
    e.preventDefault();
    commentForm.requestSubmit();
  }
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
    showToast(ERROR.comment.fail_register, "error");
    commentSubmit.disabled = false;
    return;
  }

  if (editingCommentId == null) {
    const newComment = {
      id: res.body.data.id,
      content,
      created_at: res.body.data.created_at ?? formatNow(),
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
    showToast(ERROR.comment.fail_delete, "error");
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

  if (e.target.closest(".comment-edit")) startEditComment(commentId);
  else if (e.target.closest(".comment-delete")) requestDeleteComment(commentId);
  else if (e.target.closest(".reply-toggle")) openReplyComposer(li, commentId);
  else if (e.target.closest(".reply-more"))
    loadMoreReplies(li, commentId, e.target.closest(".reply-more"));
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
  showToast(ERROR.post.cannot_delete, "error");
});

function openReplyComposer(li, parentId) {
  if (li.querySelector(":scope > .reply-composer")) {
    li.querySelector(":scope > .reply-composer .reply-input").focus();
    return;
  }

  const composer = document.createElement("form");
  composer.className = "reply-composer mt-2 pl-8";
  composer.innerHTML = `
    <div class="rounded-card border border-line bg-surface p-2">
      <textarea class="reply-input w-full resize-none bg-transparent p-2 text-body text-ink placeholder:text-placeholder focus:outline-none" rows="2" placeholder="답글을 남겨주세요!"></textarea>
      <div class="flex justify-end gap-2 border-t border-line pt-2">
        <button type="button" class="reply-cancel cursor-pointer px-2 text-caption text-ink-subtle">취소</button>
        <button type="submit" class="reply-submit cursor-pointer rounded-full bg-coral px-4 py-1.5 text-caption font-bold text-white disabled:opacity-50" disabled>등록</button>
      </div>
    </div>`;

  const replyList = li.querySelector(":scope > .reply-list");
  li.insertBefore(composer, replyList);

  const input = composer.querySelector(".reply-input");
  const submit = composer.querySelector(".reply-submit");

  input.addEventListener("input", () => {
    submit.disabled = input.value.trim() === "";
  });
  input.focus();

  composer
    .querySelector(".reply-cancel")
    .addEventListener("click", () => composer.remove());
  composer.addEventListener("submit", async (e) => {
    e.preventDefault();
    const content = input.value.trim();
    if (!content) return;
    submit.disabled = true;

    const res = await createComment(postId, content, parentId).catch(() => ({
      ok: false,
    }));
    if (!res.ok) {
      if (res.status === HTTP_STATUS.UNAUTHORIZED) return goLogin();
      showToast(ERROR.comment.fail_register, "error");
      submit.disabled = false;
      return;
    }

    const reply = {
      id: res.body.data.id,
      content,
      created_at: res.body.data.created_at ?? formatNow(),
      writer: {
        id: me.id,
        nickname: me.nickname,
        profile_image_url: me.profile_image_url,
      },
      is_deleted: false,
    };

    replyList.insertAdjacentHTML("beforeend", replyItem(reply));
    commentCountValue += 1;
    commentCount.textContent = formatCount(commentCountValue);
    composer.remove();
  });
}

async function loadMoreReplies(li, commentId, btn) {
  btn.disabled = true;
  const res = await getReplies(postId, commentId, btn.dataset.cursor).catch(
    () => ({ ok: false }),
  );
  if (!res.ok) {
    if (res.status === HTTP_STATUS.UNAUTHORIZED) return goLogin();
    showToast(ERROR.comment.cannot_load_comments, "error");
    btn.disabled = false;
    return;
  }

  const { items, next_cursor } = res.body.data.comments;

  const replyList = li.querySelector(":scope > .reply-list");
  const seen = new Set(
    [...replyList.querySelectorAll("[data-comment-id]")].map((el) =>
      Number(el.dataset.commentId),
    ),
  );
  const newItems = items.filter((r) => !seen.has(r.id));
  replyList.insertAdjacentHTML("beforeend", newItems.map(replyItem).join(""));

  if (next_cursor != null) {
    btn.dataset.cursor = next_cursor;
    btn.disabled = false;
  } else {
    btn.remove();
  }
}

reloadOnBFCacheRestore();
