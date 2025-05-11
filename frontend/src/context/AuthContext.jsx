import { createContext, useContext, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const guestLogin = () => {
    const id = uuidv4();
    localStorage.setItem("user-guest", JSON.stringify({ id }));
  };

  useEffect(() => {
    const user = localStorage.getItem("user");
    const guest = localStorage.getItem("user-guest");
    if (user) {
      setIsLoggedIn(true);
    } else if (!guest) {
      guestLogin();
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("user-guest");
    setIsLoggedIn(false);
  };

  const login = (user) => {
    localStorage.setItem("user", JSON.stringify(user));
    setIsLoggedIn(true);
  };

  const addInfoToUser = (info) => {
    const user = JSON.parse(localStorage.getItem("user")) || {};
    const updatedUser = { ...user, ...info };
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  const addOrderToUser = (order) => {
    const user = JSON.parse(localStorage.getItem("user")) || {};
    user.orders = [...(user.orders || []), order];
    localStorage.setItem("user", JSON.stringify(user));
  };

  const getUserInfo = () => {
    return JSON.parse(localStorage.getItem("user"));
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        addInfoToUser,
        getUserInfo,
        addOrderToUser,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
