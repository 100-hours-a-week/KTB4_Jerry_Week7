import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import AuthProvider from "./contexts/AuthContext";
import ToastProvider from "./contexts/ToastContext";
import ConfirmProvider from "./contexts/ConfirmContext";
import ChatSocketProvider from "./contexts/ChatSocketContext";
import ProfileModalProvider from "./contexts/ProfileModalContext";
import App from "./App";
import "./styles/globals.css";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <ToastProvider>
        <ConfirmProvider>
          <ChatSocketProvider>
            <ProfileModalProvider>
              <App />
            </ProfileModalProvider>
          </ChatSocketProvider>
        </ConfirmProvider>
      </ToastProvider>
    </AuthProvider>
  </BrowserRouter>,
);
