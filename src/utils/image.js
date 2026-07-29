import { IMAGE_BASE_URL } from "../constants/config";

const DEFAULT_AVATAR = "/assets/default-avatar.png";

export function resolveImageUrl(url) {
  if (!url) return DEFAULT_AVATAR;
  return `${IMAGE_BASE_URL}${url}`;
}
