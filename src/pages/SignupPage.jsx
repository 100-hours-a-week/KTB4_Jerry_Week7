import { useState, useRef, useEffect } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  signup,
  checkEmailAvailability,
  checkNicknameAvailability,
} from "../api/user";
import { uploadImage } from "../api/image";
import {
  validateEmail,
  validatePassword,
  validatePasswordConfirm,
  validateNickname,
} from "../utils/validation";
import { ERROR } from "../constants/messages";

const SIGNUP_ERROR = {
  bad_request: { field: "nickname", text: ERROR.api.bad_request },
};

export default function SignupPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) return <Navigate to="/" replace />;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [nickname, setNickname] = useState("");
  const [touched, setTouched] = useState({
    email: false,
    password: false,
    passwordConfirm: false,
    nickname: false,
  });
  const [availability, setAvailability] = useState({
    email: null,
    nickname: null,
  });
  const [profileImageId, setProfileImageId] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [profileError, setProfileError] = useState("");
  const [serverError, setServerError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const previewUrlRef = useRef(null);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  const errors = {
    email:
      validateEmail(email) ||
      (availability.email === false ? ERROR.email.duplicated : ""),
    password: validatePassword(password),
    passwordConfirm: validatePasswordConfirm(password, passwordConfirm),
    nickname:
      validateNickname(nickname) ||
      (availability.nickname === false ? ERROR.nickname.duplicated : ""),
  };

  const formatValid = Object.values(errors).every((e) => e === "");
  const dupValid =
    availability.email === true && availability.nickname === true;
  const isValid = formatValid && dupValid;

  function touch(field) {
    setTouched((t) => ({ ...t, [field]: true }));
  }

  function displayError(field) {
    if (serverError?.field === field) return serverError.text;
    return touched[field] ? errors[field] : "";
  }

  async function checkDuplicate(field, value, checkFn, validateFn) {
    if (validateFn(value) !== "") return;

    const trimmed = value.trim();
    try {
      const { ok, body } = await checkFn(trimmed);
      setAvailability((prev) => ({
        ...prev,
        [field]: ok && body?.data ? body.data.is_available : null,
      }));
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
    setServerError(null);

    try {
      const res = await signup({
        email: email.trim(),
        password,
        nickname,
        profile_image_id: profileImageId,
      });

      if (res.ok) {
        navigate("/login", { replace: true });
        return;
      }

      const msg = res.body?.message;
      const { field, text } = SIGNUP_ERROR[msg] ?? {
        field: "nickname",
        text: ERROR.api.default,
      };
      setServerError({ field, text });
    } catch {
      setServerError({ field: "nickname", text: ERROR.api.default });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center py-16">
      <div className="text-center">
        <h1 className="text-[2rem] font-bold leading-none text-ink">
          회원가입
        </h1>
      </div>

      <form
        noValidate
        onSubmit={handleSubmit}
        className="mt-8 flex w-full max-w-120 flex-col rounded-card border border-line bg-surface p-7 shadow-md"
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
            className="relative flex h-32 w-32 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-avatar"
          >
            {profilePreview ? (
              <img
                src={profilePreview}
                alt="프로필 미리보기"
                className="absolute inset-0 h-full w-full object-cover"
              />
            ) : (
              <span className="text-4xl text-ink-subtle">+</span>
            )}
            <input
              id="profileImage"
              type="file"
              accept="image/*"
              onChange={handleProfileChange}
              className="sr-only"
            />
          </label>
        </div>

        <div className="mt-4 flex flex-col gap-1.5">
          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-label text-ink-muted">
              이메일 <span className="text-danger">*</span>
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="이메일을 입력하세요"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                touch("email");
                setAvailability((a) => ({ ...a, email: null }));
                setServerError(null);
              }}
              onBlur={() =>
                checkDuplicate(
                  "email",
                  email,
                  checkEmailAvailability,
                  validateEmail,
                )
              }
              className="rounded-field border border-line bg-field px-3 py-2 text-body text-ink placeholder:text-placeholder focus:border-coral focus:outline-none"
            />
            <p className="min-h-4.5 text-caption text-danger">
              {displayError("email")}
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="password" className="text-label text-ink-muted">
              비밀번호 <span className="text-danger">*</span>
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                touch("password");
              }}
              className="rounded-field border border-line bg-field px-3 py-2 text-body text-ink placeholder:text-placeholder focus:border-coral focus:outline-none"
            />
            <p className="min-h-4.5 text-caption text-danger">
              {displayError("password")}
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor="passwordConfirm"
              className="text-label text-ink-muted"
            >
              비밀번호 확인 <span className="text-danger">*</span>
            </label>
            <input
              id="passwordConfirm"
              type="password"
              autoComplete="new-password"
              placeholder="비밀번호를 한번 더 입력하세요"
              value={passwordConfirm}
              onChange={(e) => {
                setPasswordConfirm(e.target.value);
                touch("passwordConfirm");
              }}
              className="rounded-field border border-line bg-field px-3 py-2 text-body text-ink placeholder:text-placeholder focus:border-coral focus:outline-none"
            />
            <p className="min-h-4.5 text-caption text-danger">
              {displayError("passwordConfirm")}
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="nickname" className="text-label text-ink-muted">
              닉네임 <span className="text-danger">*</span>
            </label>
            <input
              id="nickname"
              type="text"
              autoComplete="nickname"
              placeholder="닉네임을 입력하세요"
              value={nickname}
              onChange={(e) => {
                setNickname(e.target.value);
                touch("nickname");
                setAvailability((a) => ({ ...a, nickname: null }));
                setServerError(null);
              }}
              onBlur={() =>
                checkDuplicate(
                  "nickname",
                  nickname,
                  checkNicknameAvailability,
                  validateNickname,
                )
              }
              className="rounded-field border border-line bg-field px-3 py-2 text-body text-ink placeholder:text-placeholder focus:border-coral focus:outline-none"
            />
            <p className="min-h-4.5 text-caption text-danger">
              {displayError("nickname")}
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={!isValid || isSubmitting}
          className="mt-4 h-12 w-full cursor-pointer rounded-xl bg-coral text-button text-white transition hover:brightness-95 disabled:opacity-50"
        >
          회원가입
        </button>
      </form>

      <p className="mt-4 flex justify-center text-label text-ink-subtle">
        이미 계정이 있으신가요?
        <Link to="/login" className="px-1 font-medium text-coral-strong">
          로그인하러 가기
        </Link>
      </p>
    </main>
  );
}
