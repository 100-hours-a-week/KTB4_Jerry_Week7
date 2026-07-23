import { API_BASE_URL } from "../constants/config";
import { HTTP_STATUS } from "../constants/httpStatus";

let accessToken = null;

export function setToken(token) {
  accessToken = token;
}

export function getToken() {
  return accessToken;
}

export function clearToken() {
  accessToken = null;
}

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
      accessToken = token;
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

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
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
