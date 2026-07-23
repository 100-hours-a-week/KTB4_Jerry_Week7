import { apiFetch } from "./client";

function signup(payload) {
  return apiFetch("/users", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

function checkEmailAvailability(email) {
  return apiFetch(
    `/users/email-availability?email=${encodeURIComponent(email)}`,
  );
}

function checkNicknameAvailability(nickname) {
  return apiFetch(
    `/users/nickname-availability?nickname=${encodeURIComponent(nickname)}`,
  );
}

function getMyInfo() {
  return apiFetch("/users/me");
}

function updateMyInfo(payload) {
  return apiFetch("/users/me", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

function updatePassword(password) {
  return apiFetch("/users/me/password", {
    method: "PATCH",
    body: JSON.stringify({ password }),
  });
}

function withdraw() {
  return apiFetch("/users/me", { method: "DELETE" });
}

export {
  signup,
  checkEmailAvailability,
  checkNicknameAvailability,
  getMyInfo,
  updateMyInfo,
  updatePassword,
  withdraw,
};
