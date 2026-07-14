import { getPost, updatePost } from "../api/post.js";
import { uploadImage } from "../api/image.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";
import { ERROR } from "../constants/messages.js";
import { goLogin } from "../utils/sessions.js";
import { mountHeader } from "../components/header.js";
import { resolveImageUrl } from "../utils/image.js";

const postId = new URLSearchParams(window.location.search).get("id");

const form = document.querySelector("form");
const titleInput = document.getElementById("title");
const contentInput = document.getElementById("content");
const helper = document.getElementById("formHelper");
const imageInput = document.getElementById("image");
const submitBtn = document.getElementById("submitBtn");
const imagePreview = document.getElementById("imagePreview");

let images = [];
let touched = false;

if (!localStorage.getItem("accessToken")) goLogin();

mountHeader();

init();

async function init() {
  if (!postId) {
    window.location.href = "/";
    return;
  }

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

  images = (post.post_images ?? []).map((img) => ({
    id: img.id,
    src: resolveImageUrl(img.url),
  }));
  renderImages();

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

    results.forEach((r, i) => {
      images.push({ id: r.body.data.id, src: URL.createObjectURL(files[i]) });
    });
    renderImages();
  } catch {
    helper.textContent = ERROR.api.default;
  } finally {
    imageInput.value = "";
  }
});

imagePreview.addEventListener("click", (e) => {
  if (!e.target.closest(".thumb-delete")) return;
  const id = Number(e.target.closest("[data-image-id]").dataset.imageId);
  images = images.filter((img) => img.id !== id);
  renderImages();
});

function renderImages() {
  imagePreview.innerHTML = images
    .map(
      ({ id, src }) => `
      <div class="relative h-20 w-20 shrink-0 overflow-hidden rounded-field border border-line" data-image-id="${id}">
        <img src="${src}" alt="" class="h-full w-full object-cover" />
        <button type="button" class="thumb-delete absolute right-1 top-1 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-ink/60 text-white transition hover:bg-ink/80" aria-label="이미지 삭제">
          <span class="text-xs leading-none">✕</span>
        </button>
      </div>`,
    )
    .join("");
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (submitBtn.disabled) return;

  submitBtn.disabled = true;

  const payload = {
    title: titleInput.value.trim(),
    content: contentInput.value,
    post_image_ids: images.map((img) => img.id),
  };

  try {
    const { ok, status, body } = await updatePost(postId, payload);

    if (ok) {
      window.location.replace(`/pages/post-detail.html?id=${postId}`);
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
