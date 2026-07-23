import { apiFetch } from "./client";

function uploadImage(file) {
  const formData = new FormData();
  formData.append("image", file);

  return apiFetch("/images", {
    method: "POST",
    body: formData,
  });
}

export { uploadImage };
