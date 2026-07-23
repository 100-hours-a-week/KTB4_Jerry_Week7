import { useState, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { resolveImageUrl } from "../utils/image";
import useOutsideClick from "../hooks/useOutsideClick";

export default function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useOutsideClick(
    menuRef,
    useCallback(() => setMenuOpen(false), []),
  );

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  const avatar = resolveImageUrl(user?.profile_image_url);

  return (
    <header className="border-b border-line bg-surface">
      <div className="mx-auto grid h-17 max-w-170 grid-cols-[1fr_auto_1fr] items-center">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 cursor-pointer items-center justify-center justify-self-start rounded-lg text-3xl leading-none text-ink hover:bg-sunken"
        >
          ‹
        </button>

        <h1 className="text-center text-logo text-ink">
          <Link to="/">톡톡</Link>
        </h1>

        <div className="relative justify-self-end" ref={menuRef}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((prev) => !prev);
            }}
            className="h-9 w-9 overflow-hidden rounded-full bg-avatar"
          >
            <img
              src={avatar}
              alt="프로필"
              className="h-full w-full cursor-pointer object-cover"
            />
          </button>

          {menuOpen && (
            <ul className="absolute right-0 mt-2 w-40 overflow-hidden rounded-card border border-line bg-surface shadow-md">
              <li>
                <Link
                  to="/profile/edit"
                  className="block px-4 py-3 text-center text-label text-ink hover:bg-sunken"
                  onClick={() => setMenuOpen(false)}
                >
                  회원정보수정
                </Link>
              </li>
              <li>
                <Link
                  to="/profile/password"
                  className="block px-4 py-3 text-center text-label text-ink hover:bg-sunken"
                  onClick={() => setMenuOpen(false)}
                >
                  비밀번호수정
                </Link>
              </li>
              <li>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="block w-full cursor-pointer px-4 py-3 text-center text-label text-danger hover:bg-sunken"
                >
                  로그아웃
                </button>
              </li>
            </ul>
          )}
        </div>
      </div>
    </header>
  );
}
