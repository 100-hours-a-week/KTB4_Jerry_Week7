import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { login as apiLogin, logout as apiLogout } from "../api/auth";
import { getMyInfo } from "../api/user";
import { setToken, clearToken, setOnAuthFailure } from "../api/client";

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

  useEffect(() => {
    setOnAuthFailure(() => {
      clearToken();
      setUser(null);
    });
    return () => setOnAuthFailure(null);
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await apiLogin(email, password);
    if (!res.ok) return res;

    setToken(res.body.data.access_token);

    const userRes = await getMyInfo();
    if (userRes.ok) {
      setUser(userRes.body.data);
    }

    return res;
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    clearToken();
    setUser(null);
  }, []);

  const updateUser = useCallback(async () => {
    const res = await getMyInfo();
    if (res.ok) {
      setUser(res.body.data);
    }
  }, []);

  const value = useMemo(
    () => ({ user, isAuthenticated, isAuthLoading, login, logout, updateUser }),
    [user, isAuthenticated, isAuthLoading, login, logout, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
