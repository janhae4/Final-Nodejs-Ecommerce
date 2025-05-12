import { message } from "antd";
import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [messageApi, contextHolder] = message.useMessage();
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  const guestLogin = () => {
    const id = uuidv4();
    localStorage.setItem("user-guest", JSON.stringify({ id }));
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    const guest = JSON.parse(localStorage.getItem("user-guest"));
    if (user) {
      setIsLoggedIn(true);
      console.log(user.addresses)
      setAddresses(user.addresses || []);
    } else if (!guest) {
      guestLogin();
    }
  }, []);

  const logout = async () => {
    localStorage.removeItem("user");
    localStorage.removeItem("user-guest");
    await axios.post(`${API_URL}/auth/logout`, {}, { withCredentials: true });
    setIsLoggedIn(false);
  };

  const login = async (data) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, data, {
        withCredentials: true,
      });
      const user = response.data.user;
      if (user.isBanned) {
        console.log("User is banned:", user.isBanned);
        alert("Tài khoản của bạn đã bị cấm.");
        return;
      }
      localStorage.setItem("user", JSON.stringify(user));
      messageApi.success("Đăng nhập thành công!");

      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
      setIsLoggedIn(true);
    } catch (error) {
      console.error("Login error:", error);
      messageApi.error("Đăng nhập thất bại. Vui lòng kiểm tra lại!");
    }
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

  const addAddress = async (address) => {
    try {
      await axios.post(`${API_URL}/users/shipping-addresses`, address, {
        withCredentials: true,
      });
      const user = JSON.parse(localStorage.getItem("user")) || {};
      user.addresses = [...(user.addresses || []), address];
      localStorage.setItem("user", JSON.stringify(user));
      setAddresses((prev) => [...prev, address]);
    } catch (error) {
      messageApi.error("Failed to add address.");
    }
  };

  const updateAddress = async (address) => {
    try {
      await axios.put(
        `${API_URL}/users/shipping-addresses/${address._id}`,
        address,
        {
          withCredentials: true,
        }
      );
      const user = JSON.parse(localStorage.getItem("user")) || {};
      user.addresses = user.addresses.map((a) =>
        a._id === address._id ? address : a
      );
      localStorage.setItem("user", JSON.stringify(user));
      setAddresses(user.addresses);
    } catch (error) {
      messageApi.error("Failed to update address.");
    }
  };

  const deleteAddress = (addressId) => {
    const user = JSON.parse(localStorage.getItem("user")) || {};
    user.addresses = user.addresses.filter((a) => a._id !== addressId);
    localStorage.setItem("user", JSON.stringify(user));
    setAddresses((prev) => prev.filter((a) => a._id !== addressId));
  };

  const getUserInfo = () => {
    return JSON.parse(localStorage.getItem("user"));
  };

  const getAddresses = () => {
    return JSON.parse(localStorage.getItem("user")).addresses;
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        addresses,
        addInfoToUser,
        addAddress,
        updateAddress,
        deleteAddress,
        getUserInfo,
        addOrderToUser,
        login,
        logout,
      }}
    >
      {contextHolder}
      {children}
    </AuthContext.Provider>
  );
};
