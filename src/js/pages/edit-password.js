import { updatePassword } from "../api/user.js";
import { goLogin } from "../utils/sessions.js";
import {
  validatePassword,
  validatePasswordConfirm,
} from "../utils/validation.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";
import { mountHeader } from "../components/header.js";
import { showToast } from "../utils/toast.js";

const form = document.querySelector("form");
const passwordInput = document.getElementById("password");
const passwordConfirmInput = document.getElementById("passwordConfirm");
const passwordHelper = document.getElementById("passwordHelper");
const passwordConfirmHelper = document.getElementById("passwordConfirmHelper");
const submitBtn = document.getElementById("submitBtn");

let touched = false;

if (!localStorage.getItem("accessToken")) {
  goLogin();
}

mountHeader();

function refresh() {
  const passwordError = validatePassword(passwordInput.value);
  const passwordConfirmError = validatePasswordConfirm(
    passwordInput.value,
    passwordConfirmInput.value,
  );

  passwordHelper.textContent = touched ? passwordError : "";
  passwordConfirmHelper.textContent = touched ? passwordConfirmError : "";

  submitBtn.disabled = !(passwordError === "" && passwordConfirmError === "");
}

[passwordInput, passwordConfirmInput].forEach((input) => {
  touched = true;
  input.addEventListener("input", refresh);
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (submitBtn.disabled) return;

  submitBtn.disabled = true;
  try {
    const { ok, status } = await updatePassword(passwordInput.value);

    if (ok) {
      showToast("수정 완료");
      form.reset();
      touched = false;
      return;
    }

    if (status === HTTP_STATUS.UNAUTHORIZED) return goLogin();

    showToast("수정 실패");
  } catch {
    showToast("수정 실패");
  } finally {
    refresh();
  }
});
