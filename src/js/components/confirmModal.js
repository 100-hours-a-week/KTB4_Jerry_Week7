import { openModal, closeModal, setupModal } from "../utils/modal.js";

let dialog, titleEl, messageEl, cancelBtn, confirmBtn;
let resolver = null;
let result = false;

function ensureModal() {
  if (dialog) return;

  dialog = document.createElement("dialog");
  dialog.className =
    "m-auto w-90 max-w-[calc(100%-2rem)] rounded-card bg-surface px-7 py-10 backdrop:bg-ink/40";
  dialog.innerHTML = `
      <p data-title class="text-center text-heading text-ink"></p>
      <p data-message class="mt-2 text-center text-body text-ink-muted"></p>

      <div class="mt-6 flex gap-3 px-8">
        <button 
          type="button"
          data-cancel
          class="cursor-pointer flex-1 rounded-xl h-12 px-4 py-2 text-xl bg-ink text-button text-white transition hover:brightness-110"
        >
          취소
        </button>
        <button
          type="button"
          data-confirm
          class="cursor-pointer flex-1 rounded-xl h-12 px-4 py-2 text-xl bg-coral text-button text-white transition hover:brightness-95"
        >
          확인
        </button>
      </div>
    </div>`;
  document.body.appendChild(dialog);

  titleEl = dialog.querySelector("[data-title]");
  messageEl = dialog.querySelector("[data-message]");
  cancelBtn = dialog.querySelector("[data-cancel]");
  confirmBtn = dialog.querySelector("[data-confirm]");

  setupModal(dialog, cancelBtn);

  confirmBtn.addEventListener("click", () => {
    result = true;
    closeModal(dialog);
  });

  dialog.addEventListener("close", () => {
    if (resolver) {
      resolver(result);
    }
    resolver = null;
  });
}

export function confirmModal({ title, message = "" }) {
  ensureModal();
  titleEl.textContent = title;
  messageEl.textContent = message;
  result = false;
  openModal(dialog);
  return new Promise((resolve) => {
    resolver = resolve;
  });
}
