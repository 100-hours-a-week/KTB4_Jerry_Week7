import { getPost, updatePost } from "../api/post.js";
import { uploadImage } from "../api/image.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";
import { ERROR } from "../constants/messages.js";
import { goLogin } from "../utils/sessions.js";
import {
  bindHeaderProfileEvents,
  loadHeaderProfileAvatar,
} from "../components/header.js";

const postId = new URLSearchParams(window.location.search).get("id");

const backLink = document.getElementById("backLink");
const form = document.querySelector("form");

const titleInput = document.getElementById("title");
const contentInput = document.getElementById("content");
const helper = document.getElementById("formHelper");
const imageInput = document.getElementById("image");
const fileName = document.getElementById("fileName");
const submitBtn = document.getElementById("submitBtn");

let postImageIds = [];
let touched = false;

if (!localStorage.getItem("accessToken")) goLogin();
loadHeaderProfileAvatar();
bindHeaderProfileEvents();

init();

async function init() {
  if (!postId) {
    window.location.href = "/";
    return;
  }
  backLink.href = `/pages/post-detail.html?id=${postId}`;

  const { ok, status, body } = await getPost(postId).catch(() => ({
    ok: false,
  }));
  if (!ok) {
    if (status === HTTP_STATUS.UNAUTHORIZED) return goLogin();
    window.location.href = "/";
    return;
  }

  const post = body.data;
  titleInput.value = post.title;
  contentInput.value = post.content;

  const images = post.post_images ?? [];
  postImageIds = images.map((img) => img.id);

  if (images.length) {
    fileName.textContent = images
      .map((img) => img.url.split("/").pop())
      .join(", ");
  }

  refresh();
}

function refresh() {
  const filled =
    titleInput.value.trim() !== "" && contentInput.value.trim() !== "";
  submitBtn.disabled = !filled;
  helper.textContent = touched && !filled ? ERROR.post.empty : "";
}

[titleInput, contentInput].forEach((input) => {
  input.addEventListener("input", () => {
    touched = true;
    refresh();
  });
});

imageInput.addEventListener("change", async () => {
  const files = [...imageInput.files];
  if (files.length === 0) return;

  try {
    const results = await Promise.all(files.map((f) => uploadImage(f)));

    const failed = results.find((r) => !r.ok);
    if (failed) {
      helper.textContent = ERROR.api[failed.body?.message] ?? ERROR.api.default;
      return;
    }

    postImageIds.push(...results.map((r) => r.body.data.id));
    fileName.textContent = files.map((f) => f.name).join(", ");
  } catch {
    helper.textContent = ERROR.api.default;
  }
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (submitBtn.disabled) return;

  submitBtn.disabled = true;

  const payload = {
    title: titleInput.value.trim(),
    content: contentInput.value,
    post_image_ids: postImageIds,
  };

  try {
    const { ok, status, body } = await updatePost(postId, payload);

    if (ok) {
      window.location.href = `/pages/post-detail.html?id=${postId}`;
      return;
    }
    if (status === HTTP_STATUS.UNAUTHORIZED) return goLogin();
    helper.textContent = ERROR.api[body?.message] ?? ERROR.api.default;
  } catch {
    helper.textContent = ERROR.api.default;
  } finally {
    submitBtn.disabled = false;
  }
});
