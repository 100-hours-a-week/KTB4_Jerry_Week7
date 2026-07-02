import { apiFetch } from "./client.js";

/**
 *  회원가입
 */
function signup(payload) {
  return apiFetch("/users", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 *  이메일 중복 검사
 */
function checkEmailAvailability(email) {
  return apiFetch(
    `/users/email-availability?email=${encodeURIComponent(email)}`,
  );
}

/**
 *  닉네임 중복 검사
 */
function checkNicknameAvailability(nickname) {
  return apiFetch(
    `/users/nickname-availability?nickname=${encodeURIComponent(nickname)}`,
  );
}

/**
 *  내 정보 조회
 */
function getMyInfo() {
  return apiFetch("/users/me");
}

/**
 *  회원정보 수정
 */
function updateMyInfo(payload) {
  return apiFetch("/users/me", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

/**
 *  비밀번호 수정
 */
function updatePassword(password) {
  return apiFetch("/users/me/password", {
    method: "PATCH",
    body: JSON.stringify({ password }),
  });
}

/**
 *  회원탈퇴
 */
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
