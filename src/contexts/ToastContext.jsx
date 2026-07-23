import { createContext, useContext, useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";

const ToastContext = createContext(null);

const COLOR = {
  default: "bg-coral",
  error: "bg-danger",
};

export default function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);

  const showToast = useCallback((message, type = "default") => {
    clearTimeout(timerRef.current);
    setToast({ message, type });
    timerRef.current = setTimeout(() => setToast(null), 2000);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast &&
        createPortal(
          <div
            role="status"
            aria-live="polite"
            className={`fixed bottom-10 left-1/2 -translate-x-1/2 rounded-full px-6 py-3 text-body text-white shadow-lg ${COLOR[toast.type] ?? COLOR.default}`}
          >
            {toast.message}
          </div>,
          document.body,
        )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
