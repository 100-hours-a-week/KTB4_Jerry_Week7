export function goLogin() {
  localStorage.removeItem("accessToken");
  window.location.href = "/pages/login.html";
}
