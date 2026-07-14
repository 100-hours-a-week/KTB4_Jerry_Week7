import { resolveImageUrl } from "../utils/image.js";
import { getMyInfo } from "../api/user.js";
import { logout } from "../api/auth.js";
import { goLogin } from "../utils/sessions.js";

function renderHeader({ back = true, profile = true } = {}) {
  const backCell = back
    ? `<button type="button" id="backBtn" class="cursor-pointer justify-self-start flex w-10 h-10 items-center justify-center rounded-lg text-3xl leading-none text-ink hover:bg-sunken">‹</button>`
    : `<div></div>`;

  const profileCell = profile
    ? `
    <div class="relative justify-self-end">
      <button 
        id="profileBtn"
        class="h-9 w-9 overflow-hidden rounded-full bg-avatar"
      >
        <img
          id="headerProfileAvatar"
          src=""
          alt="프로필"
          class="cursor-pointer h-full w-full object-cover"
        />
      </button>
      <ul
        id="profileMenu"
        class="absolute right-0 mt-2 hidden w-40 overflow-hidden rounded-card border border-line bg-surface shadow-md"
      >
        <li>
          <a
            href="/pages/edit-profile.html"
            class="block px-4 py-3 text-center text-label text-ink hover:bg-sunken"
            >회원정보수정</a
          >
        </li>
        <li>
          <a
            href="/pages/edit-password.html"
            class="block px-4 py-3 text-center text-label text-ink hover:bg-sunken"
            >비밀번호수정</a
          >
        </li>
        <li>
          <button
            type="button"
            id="logoutBtn"
            class="cursor-pointer block w-full px-4 py-3 text-center text-label text-danger hover:bg-sunken"
          >
          로그아웃
          </button>
        </li>
      </ul>
    </div>`
    : `<div></div>`;

  return `
    <header class="border-b border-line bg-surface">
      <div class="mx-auto grid h-17 max-w-170 grid-cols-[1fr_auto_1fr] items-center">
        ${backCell}
        <h1 class="text-logo text-center text-ink">
          <a href="/index.html">톡톡</a>
        </h1>
        ${profileCell}
      </div>
    </header>
  `;
}

function mountHeader(options = {}) {
  const slot = document.getElementById("app-header");
  if (!slot) return;
  slot.innerHTML = renderHeader(options);
  bindHeaderProfileEvents();
  loadHeaderProfileAvatar();
}

async function loadHeaderProfileAvatar() {
  const avatar = document.getElementById("headerProfileAvatar");
  if (!avatar) return;

  const { ok, body } = await getMyInfo().catch(() => ({ ok: false }));
  if (!ok) return;

  avatar.src = resolveImageUrl(body.data.profile_image_url);
}

function bindHeaderProfileEvents() {
  const backBtn = document.getElementById("backBtn");
  if (backBtn) backBtn.addEventListener("click", () => history.back());

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

export {
  renderHeader,
  mountHeader,
  loadHeaderProfileAvatar,
  bindHeaderProfileEvents,
};
