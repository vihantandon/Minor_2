import { createContext, useContext, useState, useEffect } from "react";
import {
  login as apiLogin,
  register as apiRegister,
  getMe,
} from "../api/client";

export const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("oh-user");
    return stored ? JSON.parse(stored) : null;
  });

  // On mount, if a token exists, fetch fresh user data from the server.
  // This keeps the score/rating in the UI accurate after rating updates.
  useEffect(() => {
    const token = localStorage.getItem("oh-token");
    if (!token) return;

    getMe()
      .then(({ data }) => {
        localStorage.setItem("oh-user", JSON.stringify(data));
        setUser(data);
      })
      .catch(() => {
        // Token is expired or invalid — clear stale session
        localStorage.removeItem("oh-token");
        localStorage.removeItem("oh-user");
        setUser(null);
      });
  }, []);

  const signIn = async (email, password) => {
    const { data } = await apiLogin({ email, password });
    localStorage.setItem("oh-token", data.token);
    localStorage.setItem("oh-user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const signUp = async (username, email, password) => {
    const { data } = await apiRegister({ username, email, password });
    localStorage.setItem("oh-token", data.token);
    localStorage.setItem("oh-user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const signOut = () => {
    localStorage.removeItem("oh-token");
    localStorage.removeItem("oh-user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
