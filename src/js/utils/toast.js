let toastEl;
let hideTimer;

const COLOR = {
  default: "bg-coral",
  error: "bg-danger",
};

export function showToast(message, type = "default") {
  if (!toastEl) {
    toastEl = document.createElement("div");
    toastEl.setAttribute("role", "status");
    toastEl.setAttribute("aria-live", "polite");
    document.body.appendChild(toastEl);
  }

  toastEl.textContent = message;
  toastEl.className = `fixed bottom-10 left-1/2 -translate-x-1/2 rounded-full px-6 py-3 text-body text-white shadow-lg ${COLOR[type] ?? COLOR.default}`;

  clearTimeout(hideTimer);
  hideTimer = setTimeout(() => toastEl.classList.add("hidden"), 2000);
}
