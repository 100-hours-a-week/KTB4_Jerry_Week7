import { createContext, useContext, useState, useEffect } from "react";
import { login as apiLogin, logout as apiLogout } from "../api/auth";
import { getMyInfo } from "../api/user";
import { setToken, clearToken } from "../api/client";

const AuthContext = createContext(null);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const isAuthenticated = user !== null;

  useEffect(() => {
    let alive = true;

    getMyInfo()
      .then((res) => {
        if (!alive) return;
        if (res.ok) {
          setUser(res.body.data);
        }
      })
      .finally(() => {
        if (alive) setIsAuthLoading(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  async function login(email, password) {
    const res = await apiLogin(email, password);
    if (!res.ok) return res;

    setToken(res.body.data.access_token);

    const userRes = await getMyInfo();
    if (userRes.ok) {
      setUser(userRes.body.data);
    }

    return res;
  }

  async function logout() {
    await apiLogout();
    clearToken();
    setUser(null);
  }

  async function updateUser() {
    const res = await getMyInfo();
    if (res.ok) {
      setUser(res.body.data);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isAuthLoading,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
