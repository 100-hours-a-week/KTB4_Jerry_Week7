import { apiFetch } from "./client.js";

function login(email, password) {
  return apiFetch("/sessions", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

function logout() {
  return apiFetch("/sessions/current", { method: "DELETE" });
}

export { login, logout };
