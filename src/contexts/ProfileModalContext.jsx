import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { createDm } from "../api/chat";
import { useToast } from "./ToastContext";
import { ERROR } from "../constants/messages";
import { resolveImageUrl } from "../utils/image";
import ChatIcon from "../components/icons/ChatIcon";

const ProfileModalContext = createContext(null);

export default function ProfileModalProvider({ children }) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [writer, setWriter] = useState(null);
  const [isStarting, setIsStarting] = useState(false);

  const openProfile = useCallback((w) => setWriter(w), []);
  const close = useCallback(() => {
    setWriter(null);
    setIsStarting(false);
  }, []);

  async function handleStartDm() {
    if (isStarting || !writer) return;
    setIsStarting(true);
    const { ok, body } = await createDm(writer.id);
    if (!ok) {
      showToast(ERROR.chat.cannot_start_chat, "error");
      setIsStarting(false);
      return;
    }
    close();
    navigate(`/chat/${body.data.id}`);
  }

  const value = useMemo(() => ({ openProfile }), [openProfile]);

  return (
    <ProfileModalContext.Provider value={value}>
      {children}
      {writer &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40"
            onClick={close}
          >
            <div
              className="relative w-80 max-w-[calc(100%-2rem)] rounded-card bg-surface px-7 py-8"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={close}
                className="absolute right-4 top-4 cursor-pointer text-xl leading-none text-ink-subtle hover:text-ink"
              >
                ✕
              </button>

              <div className="flex flex-col items-center">
                <img
                  src={resolveImageUrl(writer.profile_image_url)}
                  alt={writer.nickname}
                  className="h-20 w-20 rounded-full bg-avatar object-cover"
                />
                <p className="mt-4 text-heading text-ink">{writer.nickname}</p>
                <p className="mt-1 text-caption text-ink-subtle">
                  1:1 대화를 시작할 수 있어요
                </p>

                <button
                  type="button"
                  onClick={handleStartDm}
                  disabled={isStarting}
                  className="mt-6 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-coral px-5 py-3 text-button text-white transition hover:brightness-95 disabled:opacity-50"
                >
                  <ChatIcon className="h-5 w-5" />
                  메시지 보내기
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </ProfileModalContext.Provider>
  );
}

export function useProfileModal() {
  return useContext(ProfileModalContext);
}
