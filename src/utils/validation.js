import { ERROR } from "../constants/messages";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,20}$/;
const SPACE_RE = /\s/;

function validateEmail(value) {
  if (!value) return ERROR.email.empty;
  if (!EMAIL_RE.test(value)) return ERROR.email.invalid;
  return "";
}

function validatePassword(value) {
  if (!value) return ERROR.password.empty;
  if (!PASSWORD_RE.test(value)) return ERROR.password.invalid;
  return "";
}

function validatePasswordConfirm(password, confirm) {
  if (!confirm) return ERROR.passwordConfirm.empty;
  if (password !== confirm) return ERROR.passwordConfirm.mismatch;
  return "";
}

function validateNickname(value) {
  if (!value) return ERROR.nickname.empty;
  if (SPACE_RE.test(value)) return ERROR.nickname.space;
  if (value.length > 10) return ERROR.nickname.tooLong;
  return "";
}

export {
  validateEmail,
  validatePassword,
  validatePasswordConfirm,
  validateNickname,
};
