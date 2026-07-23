import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { validateEmail, validatePassword } from "../utils/validation";
import { ERROR } from "../constants/messages";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  if (isAuthenticated) return <Navigate to="/" replace />;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState({ email: false, password: false });
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const emailError = validateEmail(email);
  const passwordError = validatePassword(password);
  const isValid = emailError === "" && passwordError === "";

  const displayError =
    serverError ||
    (touched.email ? emailError : "") ||
    (touched.password ? passwordError : "");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!isValid || isSubmitting) return;

    setIsSubmitting(true);
    setServerError("");

    try {
      const res = await login(email.trim(), password);

      if (res.ok) {
        navigate("/", { replace: true });
        return;
      }

      setServerError(ERROR.api[res.body?.message] ?? ERROR.api.invalid_credentials);
    } catch {
      setServerError(ERROR.api.default);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center pt-36">
      <div className="text-center">
        <h1 className="text-[2rem] font-bold leading-none text-ink">톡톡</h1>
        <p className="mt-2 text-body text-ink-subtle">함께 소통하는 작은 세상</p>
      </div>

      <form
        noValidate
        onSubmit={handleSubmit}
        className="mt-12 flex w-full max-w-95 flex-col rounded-card border border-line bg-surface p-7 shadow-md"
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-label text-ink-muted">
              이메일
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="이메일을 입력하세요"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setTouched((t) => ({ ...t, email: true }));
                setServerError("");
              }}
              className="rounded-field border border-line bg-field px-3 py-2 text-body text-ink placeholder:text-placeholder focus:border-coral focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-label text-ink-muted">
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setTouched((t) => ({ ...t, password: true }));
                setServerError("");
              }}
              className="rounded-field border border-line bg-field px-3 py-2 text-body text-ink placeholder:text-placeholder focus:border-coral focus:outline-none"
            />
          </div>
        </div>

        <p className="mt-2 text-caption text-danger">{displayError}</p>

        <button
          type="submit"
          disabled={!isValid || isSubmitting}
          className="mt-8 h-12 w-full cursor-pointer rounded-xl bg-coral text-button text-white transition hover:brightness-95 disabled:opacity-50"
        >
          로그인
        </button>

        <p className="mt-2 flex justify-center text-label text-ink-subtle">
          아직 회원이 아니신가요?
          <Link to="/signup" className="px-1 font-medium text-coral-strong">
            회원가입하러 가기
          </Link>
        </p>
      </form>
    </main>
  );
}
