import { createContext, useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  // Kiểm tra khi tải trang, xác nhận người dùng đã đăng nhập chưa
 useEffect(() => {
  const token = Cookies.get("token");
  const user = localStorage.getItem("user");

  // Nếu có token, đăng nhập và lấy thông tin người dùng
  if (token) {
    setIsLoggedIn(true);
    if (user) {
      try {
        const storedUser = JSON.parse(user); // Parse thông tin người dùng từ localStorage
        setUser(storedUser); // Cập nhật trạng thái người dùng
      } catch (error) {
        console.error("Error parsing user data", error);
      }
    }
  } else {
    // Nếu không có token, kiểm tra user guest
    const guest = localStorage.getItem("user-guest");
    if (!guest) {
      guestLogin();
    }
  }
}, []);

  const guestLogin = () => {
    const id = uuidv4();
    localStorage.setItem("user", JSON.stringify({ id }));
  };

  const login = (token, userInfo) => {
  // Xóa dữ liệu cũ
  Cookies.remove("token");
  localStorage.removeItem("user");

  // Set dữ liệu mới
  Cookies.set("token", token, { expires: 7, secure: false, sameSite: "Strict" });
  localStorage.setItem("user", JSON.stringify(userInfo));

  setIsLoggedIn(true);
  setUser(userInfo);
};


  const logout = () => {
  Cookies.remove("token");
  localStorage.removeItem("user");
  localStorage.removeItem("user-guest");
  setIsLoggedIn(false);
  setUser(null);
  navigate("/auth/login"); // hoặc trang nào đó
};

  const addInfoToUser = (info) => {
    const updatedUser = { ...user, ...info };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const addOrderToUser = (order) => {
    const updatedUser = { ...user, orders: [...(user.orders || []), order] };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const getUserProfile = async () => {
    try {
      const response = await fetch("/api/profile", {
        method: "GET",
        credentials: "include",  // Quan trọng: để gửi cookie theo request
      });

      const data = await response.json();
      if (response.ok) {
        console.log("User profile:", data);
      } else {
        console.error("Error:", data.message);
      }
    } catch (err) {
      console.error("Request failed:", err);
    }
  };

  const getUserInfo = () => {
    return user; // Trả về thông tin người dùng đang được lưu trong state
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        setIsLoggedIn,
        user,
        addInfoToUser,
        getUserInfo,  // Truyền hàm mà không gọi
        addOrderToUser,
        login,
        logout,
        getUserProfile,  // Truyền hàm để có thể lấy profile người dùng
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
