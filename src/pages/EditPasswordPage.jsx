import { useState } from "react";
import { updatePassword } from "../api/user";
import { validatePassword, validatePasswordConfirm } from "../utils/validation";
import { useToast } from "../contexts/ToastContext";

export default function EditPasswordPage() {
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [touched, setTouched] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

  const passwordError = validatePassword(password);
  const passwordConfirmError = validatePasswordConfirm(password, passwordConfirm);
  const isValid = passwordError === "" && passwordConfirmError === "";

  async function handleSubmit(e) {
    e.preventDefault();
    if (!isValid || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const { ok } = await updatePassword(password);

      if (ok) {
        showToast("수정 완료");
        setPassword("");
        setPasswordConfirm("");
        setTouched(false);
        return;
      }

      showToast("수정 실패", "error");
    } catch {
      showToast("수정 실패", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex flex-col items-center py-14">
      <h2 className="text-title text-ink">비밀번호 수정</h2>

      <form
        noValidate
        onSubmit={handleSubmit}
        className="mt-8 flex w-full max-w-115 flex-col gap-4 rounded-card border border-line bg-surface p-7 shadow-md"
      >
        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-label text-ink-muted">
            비밀번호
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="새 비밀번호를 입력하세요"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setTouched(true);
            }}
            className="rounded-field border border-line bg-field px-3 py-2 text-body text-ink placeholder:text-placeholder focus:border-coral focus:outline-none"
          />
          <p className="min-h-4.5 text-caption text-danger">
            {touched ? passwordError : ""}
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="passwordConfirm" className="text-label text-ink-muted">
            비밀번호 확인
          </label>
          <input
            id="passwordConfirm"
            type="password"
            autoComplete="new-password"
            placeholder="비밀번호를 한번 더 입력하세요"
            value={passwordConfirm}
            onChange={(e) => {
              setPasswordConfirm(e.target.value);
              setTouched(true);
            }}
            className="rounded-field border border-line bg-field px-3 py-2 text-body text-ink placeholder:text-placeholder focus:border-coral focus:outline-none"
          />
          <p className="min-h-4.5 text-caption text-danger">
            {touched ? passwordConfirmError : ""}
          </p>
        </div>

        <button
          type="submit"
          disabled={!isValid || isSubmitting}
          className="mt-6 h-12 w-full cursor-pointer rounded-xl bg-coral text-button text-white transition hover:brightness-95 disabled:opacity-50"
        >
          수정하기
        </button>
      </form>
    </main>
  );
}
