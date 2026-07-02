import { uploadImage } from "../api/image.js";
import {
  checkEmailAvailability,
  checkNicknameAvailability,
  signup,
} from "../api/user.js";
import { ERROR } from "../constants/messages.js";
import {
  validateEmail,
  validateNickname,
  validatePassword,
  validatePasswordConfirm,
} from "../utils/validation.js";

const form = document.querySelector("form");
const profileImage = document.getElementById("profileImage");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const passwordConfirmInput = document.getElementById("passwordConfirm");
const nicknameInput = document.getElementById("nickname");
const signupBtn = document.getElementById("signupBtn");

const profileHelper = document.getElementById("profileHelper");
const helpers = {
  email: document.getElementById("emailHelper"),
  password: document.getElementById("passwordHelper"),
  passwordConfirm: document.getElementById("passwordConfirmHelper"),
  nickname: document.getElementById("nicknameHelper"),
};

const touched = {
  email: false,
  password: false,
  passwordConfirm: false,
  nickname: false,
};

const availability = { email: null, nickname: null };

const profilePreview = document.getElementById("profilePreview");
let previewUrl = null;
let profileImageId = null;

const SIGNUP_ERROR = {
  bad_request: { field: "nickname", text: ERROR.api.bad_request },

  /* ===== figma 요구사항에는 없어서 helper text로 사용할지는 보류 ===== */
  // image_not_found: { field: "profile", text: ERROR.api.image_not_found },
  // too_large_file: { field: "profile", text: ERROR.api.too_large_file },
  // unsupported_media_type: {
  //   field: "profile",
  //   text: ERROR.api.unsupported_media_type,
  // },
};

function showError(msg) {
  const { field, text } = SIGNUP_ERROR[msg] ?? {
    field: "nickname", // 등록되지 않은 에러는 가장 하단 helper text에 띄우도록 처리(방어용)
    text: ERROR.api.default,
  };
  helpers[field].textContent = text;
}

function validateAll() {
  return {
    email:
      validateEmail(emailInput.value) ||
      (availability.email === false ? ERROR.email.duplicated : ""),
    password: validatePassword(passwordInput.value),
    passwordConfirm: validatePasswordConfirm(
      passwordInput.value,
      passwordConfirmInput.value,
    ),
    nickname:
      validateNickname(nicknameInput.value) ||
      (availability.nickname === false ? ERROR.nickname.duplicated : ""),
  };
}

function refresh() {
  const errors = validateAll();

  for (const key in helpers) {
    helpers[key].textContent = touched[key] ? errors[key] : "";
  }

  const formatValid = Object.values(errors).every((e) => e === "");
  const dupValid = availability.email && availability.nickname;
  signupBtn.disabled = !(formatValid && dupValid);
}

function handleInput(key) {
  touched[key] = true;
  availability[key] = null;
  refresh();
}

async function checkDuplicate(key, input, checkFunc, validateFunc) {
  if (availability[key] != null) return;
  if (validateFunc(input.value) !== "") return;

  const value = input.value.trim();
  const { ok, body } = await checkFunc(value).catch(() => ({
    ok: false,
  }));
  if (input.value.trim() !== value) return;
  availability[key] = ok && body?.data ? body.data.is_available : null;
  refresh();
}

emailInput.addEventListener("input", () => handleInput("email"));
emailInput.addEventListener("blur", () => {
  checkDuplicate("email", emailInput, checkEmailAvailability, validateEmail);
});

nicknameInput.addEventListener("input", () => handleInput("nickname"));
nicknameInput.addEventListener("blur", () => {
  checkDuplicate(
    "nickname",
    nicknameInput,
    checkNicknameAvailability,
    validateNickname,
  );
});

[passwordInput, passwordConfirmInput].forEach((input) => {
  input.addEventListener("input", () => {
    touched[input.id] = true;
    refresh();
  });
});

profileImage.addEventListener("change", async () => {
  const file = profileImage.files[0];
  if (!file) return;

  if (previewUrl) {
    URL.revokeObjectURL(previewUrl);
  }
  previewUrl = URL.createObjectURL(file);
  profilePreview.src = previewUrl;
  profilePreview.classList.remove("hidden");
  profileHelper.textContent = "";
  profileImageId = null;

  try {
    const imgRes = await uploadImage(file);
    if (!imgRes.ok) {
      profileHelper.textContent =
        ERROR.api[imgRes.body?.message] ?? ERROR.api.default;
      return;
    }
    profileImageId = imgRes.body.data.id;
  } catch {
    profileHelper.textContent = ERROR.api.default;
  }

  refresh();
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (signupBtn.disabled) return;

  signupBtn.disabled = true;
  try {
    const res = await signup({
      email: emailInput.value.trim(),
      password: passwordInput.value,
      nickname: nicknameInput.value,
      profile_image_id: profileImageId,
    });

    if (res.ok) {
      window.location.href = "/pages/login.html";
      return;
    }

    showError(res.body?.message);
  } catch {
    showError();
  } finally {
    signupBtn.disabled = false;
  }
});
