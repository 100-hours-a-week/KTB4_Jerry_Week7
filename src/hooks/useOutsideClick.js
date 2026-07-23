import { useEffect } from "react";

export default function useOutsideClick(ref, handler) {
  useEffect(() => {
    function listener(e) {
      if (!ref.current || ref.current.contains(e.target)) return;
      handler();
    }

    document.addEventListener("click", listener);
    return () => document.removeEventListener("click", listener);
  }, [ref, handler]);
}
