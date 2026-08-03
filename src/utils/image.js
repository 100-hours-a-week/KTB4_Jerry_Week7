import { IMAGE_BASE_URL } from "../constants/config";
import defaultAvatar from "../../assets/default-avatar.png";

const DEFAULT_AVATAR = defaultAvatar;

export function resolveImageUrl(url) {
  if (!url) return DEFAULT_AVATAR;
  return `${IMAGE_BASE_URL}${url}`;
}
