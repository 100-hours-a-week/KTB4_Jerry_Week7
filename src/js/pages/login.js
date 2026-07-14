import { login } from "../api/auth.js";
import { ERROR } from "../constants/messages.js";
import { validateEmail, validatePassword } from "../utils/validation.js";

const form = document.querySelector("form");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const helper = document.getElementById("helperText");
const loginBtn = document.getElementById("loginBtn");

const touched = { email: false, password: false };

function refresh() {
  const emailErr = validateEmail(emailInput.value);
  const passwordErr = validatePassword(passwordInput.value);

  loginBtn.disabled = !(emailErr === "" && passwordErr === "");

  helper.textContent =
    (touched.email ? emailErr : "") || (touched.password ? passwordErr : "");
}

emailInput.addEventListener("input", () => {
  touched.email = true;
  refresh();
});

passwordInput.addEventListener("input", () => {
  touched.password = true;
  refresh();
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (loginBtn.disabled) return;
  loginBtn.disabled = true;

  try {
    const { ok, body } = await login(
      emailInput.value.trim(),
      passwordInput.value,
    );

    if (ok) {
      localStorage.setItem("accessToken", body.data.access_token);
      window.location.href = "/";
      return;
    }

    helper.textContent = ERROR.api[body?.message] ?? ERROR.api.default;
  } catch {
    helper.textContent = ERROR.api.default;
  } finally {
    loginBtn.disabled = false;
  }
});
