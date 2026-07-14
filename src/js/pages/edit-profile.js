import {
  checkNicknameAvailability,
  getMyInfo,
  updateMyInfo,
  withdraw,
} from "../api/user.js";
import { goLogin } from "../utils/sessions.js";
import { uploadImage } from "../api/image.js";
import { HTTP_STATUS } from "../constants/httpStatus.js";
import { ERROR } from "../constants/messages.js";
import { validateNickname } from "../utils/validation.js";
import { mountHeader } from "../components/header.js";
import { confirmModal } from "../components/confirmModal.js";
import { resolveImageUrl } from "../utils/image.js";
import { showToast } from "../utils/toast.js";

const form = document.querySelector("form");
const emailText = document.getElementById("email");
const nicknameInput = document.getElementById("nickname");
const nicknameHelper = document.getElementById("nicknameHelper");
const profileImage = document.getElementById("profileImage");
const profilePreview = document.getElementById("profilePreview");
const profileHelper = document.getElementById("profileHelper");

const submitBtn = document.getElementById("submitBtn");
const withdrawBtn = document.getElementById("withdrawBtn");

let previewUrl = null;
let profileImageId = null;
let originalNickname = "";
let nicknameAvailable = null;

mountHeader();

async function loadMyInfo() {
  const { ok, status, body } = await getMyInfo().catch(() => ({ ok: false }));

  if (!ok) {
    if (status === HTTP_STATUS.UNAUTHORIZED) return goLogin();
    showToast(ERROR.api.default);
    return;
  }

  const me = body.data;
  emailText.textContent = me.email;
  nicknameInput.value = me.nickname;

  const imageUrl = resolveImageUrl(me.profile_image_url);
  profilePreview.src = imageUrl;

  originalNickname = me.nickname;
  nicknameAvailable = true;

  refresh();
}

if (!localStorage.getItem("accessToken")) {
  goLogin();
} else {
  loadMyInfo();
}

function refresh() {
  const formatError = validateNickname(nicknameInput.value);
  const dupError = nicknameAvailable === false ? ERROR.nickname.duplicated : "";
  nicknameHelper.textContent = formatError || dupError;

  const formatValid = formatError === "";
  submitBtn.disabled = !(formatValid && nicknameAvailable === true);
}

nicknameInput.addEventListener("input", () => {
  nicknameAvailable = nicknameInput.value === originalNickname ? true : null;
  refresh();
});

nicknameInput.addEventListener("blur", async () => {
  if (nicknameAvailable != null) return;
  if (validateNickname(nicknameInput.value) !== "") return;

  const value = nicknameInput.value.trim();
  const { ok, body } = await checkNicknameAvailability(value).catch(() => ({
    ok: false,
  }));
  if (nicknameInput.value.trim() !== value) return;
  nicknameAvailable = ok && body?.data ? body.data.is_available : null;
  refresh();
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
  if (submitBtn.disabled) return;

  submitBtn.disabled = true;

  const payload = { nickname: nicknameInput.value };
  if (profileImageId != null) {
    payload.profile_image_id = profileImageId;
  }

  try {
    const { ok, status } = await updateMyInfo(payload);

    if (ok) {
      showToast("수정 완료");
      return;
    }

    if (status === HTTP_STATUS.UNAUTHORIZED) return goLogin();

    showToast("수정 실패");
  } catch {
    showToast("수정 실패");
  } finally {
    submitBtn.disabled = false;
  }
});

withdrawBtn.addEventListener("click", async () => {
  const ok = await confirmModal({
    title: "회원 탈퇴하시겠습니까?",
    message: "작성된 게시글과 댓글은 삭제됩니다.",
  });
  if (!ok) return;

  const res = await withdraw().catch(() => ({ ok: false }));
  if (res.ok) return goLogin();
  if (res.status === HTTP_STATUS.UNAUTHORIZED) return goLogin();
  showToast(ERROR.api.default);
});
