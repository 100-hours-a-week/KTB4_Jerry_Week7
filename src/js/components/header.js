import { resolveImageUrl } from "../utils/image.js";
import { getMyInfo } from "../api/user.js";
import { logout } from "../api/auth.js";
import { goLogin } from "../utils/sessions.js";

function renderHeader() {
  const backCell = back
    ? `<a href="${back}" class="justify-self-end mr-33.25 text-2xl">‹</a>`
    : `<div></div>`;

  const profileCell = profile
    ? `
    <div class="relative justify-self-start ml-33.25">
      <button 
        id="profileBtn"
        class="h-9 w-9 overflow-hidden rounded-full bg-gray-200"
      >
        <img
          id="headerProfileAvatar"
          src=""
          alt="프로필"
          class="h-full w-full object-cover"
        />
        </button>
        <ul
          id="profileMenu"
          class="absolute right-0 mt-2 hidden w-40 overflow-hidden rounded-lg border bg-white shadow-md"
        >
          <li>
            <a
              href="/pages/edit-profile.html"
              class="block px-4 py-3 text-center text-sm hover:bg-menu-dropdown-hover"
              >회원정보수정</a
            >
          </li>
          <li>
            <a
              href="/pages/edit-password.html"
              class="block px-4 py-3 text-center text-sm hover:bg-menu-dropdown-hover"
              >비밀번호수정</a
            >
          </li>
          <li>
            <button
              type="button"
              id="logoutBtn"
              class="block w-full px-4 py-3 text-center text-sm hover:bg-menu-dropdown-hover"
            >
              로그아웃
            </button>
          </li>
        </ul>
      </div>`
    : `<div></div>`;

  return `
    <header class="border-b border-foreground">
      <div class="grid grid-cols-[1fr_auto_1fr] items-center h-26">
        ${backCell}
        <h1 class="text-logo text-center">아무 말 대잔치</h1>
        ${profileCell}
      </div>
    </header>
  `;
}

async function loadHeaderProfileAvatar() {
  const avatar = document.getElementById("headerProfileAvatar");
  if (!avatar) return;

  const { ok, body } = await getMyInfo().catch(() => ({ ok: false }));
  if (!ok) return;

  avatar.src = resolveImageUrl(body.data.profile_image_url);
}

function bindHeaderProfileEvents() {
  const profileBtn = document.getElementById("profileBtn");
  if (!profileBtn) return;

  const profileMenu = document.getElementById("profileMenu");
  const logoutBtn = document.getElementById("logoutBtn");

  profileBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    profileMenu.classList.toggle("hidden");
  });
  profileMenu.addEventListener("click", (e) => e.stopPropagation());
  document.addEventListener("click", () => profileMenu.classList.add("hidden"));

  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      logoutBtn.disabled = true;
      try {
        await logout();
      } finally {
        goLogin();
      }
    });
  }
}

export { loadHeaderProfileAvatar, bindHeaderProfileEvents };
