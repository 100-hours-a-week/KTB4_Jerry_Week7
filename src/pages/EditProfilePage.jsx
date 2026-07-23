import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { checkNicknameAvailability, updateMyInfo, withdraw } from "../api/user";
import { uploadImage } from "../api/image";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { useConfirm } from "../contexts/ConfirmContext";
import { validateNickname } from "../utils/validation";
import { resolveImageUrl } from "../utils/image";
import { ERROR } from "../constants/messages";

export default function EditProfilePage() {
  const navigate = useNavigate();
  const { user, logout, updateUser } = useAuth();
  const { showToast } = useToast();
  const { confirm } = useConfirm();

  const [nickname, setNickname] = useState(user?.nickname ?? "");
  const [nicknameAvailable, setNicknameAvailable] = useState(true);
  const [profileImageId, setProfileImageId] = useState(null);
  const [profilePreview, setProfilePreview] = useState(
    resolveImageUrl(user?.profile_image_url),
  );
  const [profileError, setProfileError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const originalNickname = user?.nickname ?? "";
  const previewUrlRef = useRef(null);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  const formatError = validateNickname(nickname);
  const dupError = nicknameAvailable === false ? ERROR.nickname.duplicated : "";
  const nicknameError = formatError || dupError;
  const isValid = formatError === "" && nicknameAvailable === true;

  function handleNicknameChange(e) {
    const value = e.target.value;
    setNickname(value);
    setNicknameAvailable(value === originalNickname ? true : null);
  }

  async function handleNicknameBlur() {
    if (nicknameAvailable != null) return;
    if (validateNickname(nickname) !== "") return;

    const trimmed = nickname.trim();
    try {
      const { ok, body } = await checkNicknameAvailability(trimmed);
      setNicknameAvailable(ok && body?.data ? body.data.is_available : null);
    } catch {}
  }

  async function handleProfileChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    const url = URL.createObjectURL(file);
    previewUrlRef.current = url;
    setProfilePreview(url);
    setProfileError("");
    setProfileImageId(null);

    try {
      const res = await uploadImage(file);
      if (!res.ok) {
        setProfileError(ERROR.api[res.body?.message] ?? ERROR.api.default);
        return;
      }
      setProfileImageId(res.body.data.id);
    } catch {
      setProfileError(ERROR.api.default);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!isValid || isSubmitting) return;

    setIsSubmitting(true);

    const payload = { nickname };
    if (profileImageId != null) {
      payload.profile_image_id = profileImageId;
    }

    try {
      const { ok } = await updateMyInfo(payload);

      if (ok) {
        await updateUser();
        showToast("수정 완료");
        return;
      }

      showToast("수정 실패", "error");
    } catch {
      showToast("수정 실패", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleWithdraw() {
    const ok = await confirm({
      title: "회원 탈퇴하시겠습니까?",
      message: "작성된 게시글과 댓글은 삭제됩니다.",
    });
    if (!ok) return;

    const res = await withdraw().catch(() => ({ ok: false }));
    if (res.ok) {
      await logout();
      navigate("/login", { replace: true });
      return;
    }
    showToast(ERROR.api.default, "error");
  }

  return (
    <main className="flex flex-col items-center py-14">
      <h2 className="text-title">프로필 수정</h2>

      <form
        noValidate
        onSubmit={handleSubmit}
        className="mt-8 flex w-full max-w-115 flex-col rounded-card border border-line bg-surface p-7 shadow-md"
      >
        <div className="flex flex-col items-center gap-2">
          <div className="flex flex-col justify-center">
            <span className="text-label text-ink-muted">프로필 이미지</span>
            {profileError && (
              <p className="text-xs text-danger">{profileError}</p>
            )}
          </div>
          <label
            htmlFor="profileImage"
            className="flex flex-col items-center gap-2"
          >
            <div className="h-32 w-32 overflow-hidden rounded-full bg-avatar">
              <img
                src={profilePreview}
                alt="프로필"
                className="h-full w-full object-cover"
              />
            </div>
            <span className="cursor-pointer text-label font-medium text-coral-strong">
              이미지 변경
            </span>
            <input
              id="profileImage"
              type="file"
              accept="image/*"
              onChange={handleProfileChange}
              className="sr-only"
            />
          </label>
        </div>

        <div className="mt-4 flex flex-col gap-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="nickname" className="text-label text-ink-muted">
              닉네임
            </label>
            <input
              id="nickname"
              type="text"
              value={nickname}
              onChange={handleNicknameChange}
              onBlur={handleNicknameBlur}
              className="rounded-field border border-line bg-field px-3 py-2 text-body text-ink placeholder:text-placeholder focus:border-coral focus:outline-none"
            />
            <p className="min-h-4.5 text-caption text-danger">
              {nicknameError}
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-label text-ink-muted">
              이메일 <span className="text-ink-subtle">(변경 불가)</span>
            </span>
            <p className="rounded-field border border-line bg-field-readonly px-3 py-2 text-body text-ink-subtle">
              {user?.email}
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={!isValid || isSubmitting}
          className="mt-10 h-12 w-full cursor-pointer rounded-xl bg-coral text-button text-white transition hover:brightness-95 disabled:opacity-50"
        >
          수정하기
        </button>
      </form>

      <button
        type="button"
        onClick={handleWithdraw}
        className="mt-4 cursor-pointer text-label text-danger hover:underline"
      >
        회원 탈퇴
      </button>
    </main>
  );
}
