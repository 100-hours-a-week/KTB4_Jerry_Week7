import { useAuth } from "../contexts/AuthContext";
import { useProfileModal } from "../contexts/ProfileModalContext";

export default function AuthorTrigger({ writer, className = "", children }) {
  const { user } = useAuth();
  const { openProfile } = useProfileModal();
  const isSelf = user && writer.id === user.id;

  if (isSelf) {
    return <span className={className}>{children}</span>;
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        openProfile(writer);
      }}
      className={`relative z-10 cursor-pointer ${className}`}
    >
      {children}
    </button>
  );
}
