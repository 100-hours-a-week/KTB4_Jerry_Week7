import { goLogin } from "../utils/sessions.js";
import { getPosts } from "../api/post.js";
import { postCard } from "../components/postCard.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";
import { mountHeader } from "../components/header.js";
import { reloadOnBFCacheRestore } from "../utils/bfcache.js";
import { showToast } from "../utils/toast.js";
import { ERROR } from "../constants/messages.js";

const postList = document.getElementById("postList");
const sentinel = document.getElementById("scrollSentinel");

let cursor = null;
let isLoading = false;
let hasMore = true;

if (!localStorage.getItem("accessToken")) {
  goLogin();
}

mountHeader();

async function loadPosts() {
  if (isLoading || !hasMore) return;
  isLoading = true;

  const { ok, status, body } = await getPosts(cursor).catch(() => ({
    ok: false,
  }));

  if (!ok) {
    if (status === HTTP_STATUS.UNAUTHORIZED) return goLogin();
    showToast(ERROR.post.cannot_load_posts, "error");
    isLoading = false;
    return;
  }

  const { items, next_cursor } = body.data.posts;
  postList.insertAdjacentHTML("beforeend", items.map(postCard).join(""));

  cursor = next_cursor;
  hasMore = next_cursor != null;
  isLoading = false;

  if (!hasMore) {
    observer.disconnect();
  }
}

const observer = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting) {
    loadPosts();
  }
});
observer.observe(sentinel);

reloadOnBFCacheRestore();
