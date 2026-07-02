import { createPost } from "../api/post.js";
import { uploadImage } from "../api/image.js";
import {
  bindHeaderProfileEvents,
  loadHeaderProfileAvatar,
} from "../components/header.js";
import { goLogin } from "../utils/sessions.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";
import { ERROR } from "../constants/messages.js";

const form = document.querySelector("form");

const titleInput = document.getElementById("title");
const contentInput = document.getElementById("content");
const helper = document.getElementById("formHelper");
const imageInput = document.getElementById("image");
const fileName = document.getElementById("fileName");
const submitBtn = document.getElementById("submitBtn");

const postImageIds = [];
const fileNames = [];
let touched = false;

if (!localStorage.getItem("accessToken")) goLogin();
loadHeaderProfileAvatar();
bindHeaderProfileEvents();

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
    fileNames.push(...files.map((f) => f.name));
    fileName.textContent = fileNames.join(", ");
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
  };
  if (postImageIds.length > 0) {
    payload.post_image_ids = postImageIds;
  }

  try {
    const { ok, status, body } = await createPost(payload);

    if (ok) {
      window.location.href = `/pages/post-detail.html?id=${body.data.id}`;
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
