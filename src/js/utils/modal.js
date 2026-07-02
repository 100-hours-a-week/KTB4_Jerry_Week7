function openModal(dialog) {
  dialog.showModal();
  document.body.classList.add("overflow-hidden");
}

function closeModal(dialog) {
  dialog.close();
}

function setupModal(dialog, cancelBtn) {
  cancelBtn?.addEventListener("click", () => closeModal(dialog));

  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) {
      closeModal(dialog);
    }
  });

  dialog.addEventListener("close", () => {
    document.body.classList.remove("overflow-hidden");
  });
}

export { openModal, closeModal, setupModal };
