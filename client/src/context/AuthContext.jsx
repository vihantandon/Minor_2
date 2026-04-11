import { createContext, useContext, useState } from "react";
import { login as apiLogin, register as apiRegister } from "../api/client";

export const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("oh-user");
    return stored ? JSON.parse(stored) : null;
  });

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
