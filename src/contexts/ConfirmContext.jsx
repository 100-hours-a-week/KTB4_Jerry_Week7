import { createContext, useContext, useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";

const ConfirmContext = createContext(null);

export default function ConfirmProvider({ children }) {
  const [state, setState] = useState(null);
  const resolverRef = useRef(null);

  const confirm = useCallback(({ title, message = "" }) => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setState({ title, message });
    });
  }, []);

  function handleClose(result) {
    resolverRef.current?.(result);
    resolverRef.current = null;
    setState(null);
  }

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {state &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40"
            onClick={() => handleClose(false)}
          >
            <div
              className="w-90 max-w-[calc(100%-2rem)] rounded-card bg-surface px-7 py-10"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-center text-heading text-ink">{state.title}</p>
              {state.message && (
                <p className="mt-2 text-center text-body text-ink-muted">
                  {state.message}
                </p>
              )}
              <div className="mt-6 flex gap-3 px-8">
                <button
                  type="button"
                  onClick={() => handleClose(false)}
                  className="h-12 flex-1 cursor-pointer rounded-xl bg-ink px-4 py-2 text-xl text-button text-white transition hover:brightness-110"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={() => handleClose(true)}
                  className="h-12 flex-1 cursor-pointer rounded-xl bg-coral px-4 py-2 text-xl text-button text-white transition hover:brightness-95"
                >
                  확인
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  return useContext(ConfirmContext);
}
