export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

export const IMAGE_BASE_URL = import.meta.env.VITE_CLOUDFRONT_URL ?? "";

export const WS_BASE_URL = API_BASE_URL.replace(/^http/, "ws");
