import { openModal, closeModal, setupModal } from "../utils/modal.js";

let dialog, titleEl, messageEl, cancelBtn, confirmBtn;
let resolver = null;
let result = false;

function ensureModal() {
  if (dialog) return;

  dialog = document.createElement("dialog");
  dialog.className = "m-auto h-60.5 w-102 rounded-lg p-6 backdrop:bg-black/50";
  dialog.innerHTML = `
    <div class="flex flex-col justify-center gap-4">
        <p data-title class="text-center text-2xl font-bold"></p>
        <p data-message class="text-center text-xl font-regular"></p>

        <div class="mt-4 flex justify-center gap-4">
          <button type="button"
            data-cancel
            class="rounded-xl w-30 h-13 px-4 py-2 text-xl bg-black text-white"
          >
            취소
          </button>
          <button
            type="button"
            data-confirm
            class="rounded-xl w-30 h-13 px-4 py-2 text-xl bg-talktalk-primary text-foreground"
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
