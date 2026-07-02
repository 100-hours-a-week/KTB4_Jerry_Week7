import { API_BASE_URL } from "../constants/config.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";

let refreshPromise = null;

async function requestNewToken() {
  try {
    const res = await fetch(`${API_BASE_URL}/sessions/current/token`, {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) return null;

    const body = await res.json().catch(() => null);
    const token = body?.data?.access_token ?? null;
    if (token) {
      localStorage.setItem("accessToken", token);
    }
    return token;
  } catch {
    return null;
  }
}

function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = requestNewToken().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

export async function apiFetch(path, options = {}, retried = false) {
  const isFormData = options.body instanceof FormData;
  const token = localStorage.getItem("accessToken");

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {}),
    },
  });

  if (
    res.status === HTTP_STATUS.UNAUTHORIZED &&
    !retried &&
    path !== "/sessions/current/token"
  ) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      return apiFetch(path, options, true);
    }
  }

  const body = await res.json().catch(() => null);

  return { ok: res.ok, status: res.status, body };
}
