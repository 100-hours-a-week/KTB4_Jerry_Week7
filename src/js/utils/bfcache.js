export function reloadOnBFCacheRestore() {
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) window.location.reload();
  });
}
