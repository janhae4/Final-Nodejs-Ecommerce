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
  const [userInfo, setUserInfo] = useState({});
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof userInfo?.id === "string") {
      setIsLoggedIn(!userInfo?.id.includes("guest"));
    }
  }, [userInfo?.id]);

  useEffect(() => {
    if (userInfo?.addresses) {
      setAddresses(userInfo.addresses);
    }
  }, [userInfo?.addresses]);

  const guestLogin = () => {
    const id = `guest-${uuidv4()}`;
    localStorage.setItem("user", JSON.stringify({ id }));
  };

  useEffect(() => {
    const init = async () => {
      await getUserInfo();
    };
    init();
  }, [userInfo?.id, isLoggedIn]);

  useEffect(() => {
    if (!localStorage.getItem("user")) guestLogin();
  }, []);

  const logout = async () => {
    localStorage.removeItem("user");
    localStorage.removeItem("cartItems");
    localStorage.removeItem("isCreateCart");
    guestLogin();
    setIsLoggedIn(false);
    await axios.post(`${API_URL}/auth/logout`, {}, { withCredentials: true });
  };

  const login = async (data) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, data, {
        withCredentials: true,
      });
      const user = response.data.user;
      if (user.isBanned) {
        console.log("User is banned:", user.isBanned);
        alert("Your account has been banned.");
        return;
      }
      localStorage.setItem("user", JSON.stringify({ id: user._id }));
      localStorage.removeItem("isCreateCart");
      message.success("Login successful!");
      setIsLoggedIn(true);

      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Login error:", error);
      message.error(
        error.response.data.message || "Login failed, please try again!"
      );
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

  const addAddress = async (shippingForm) => {
    try {
      const r1 = await axios.post(
        `${API_URL}/users/shipping-addresses`,
        shippingForm,
        { withCredentials: true }
      );
      setUserInfo(r1.data.userInfo);
    } catch (error) {
      console.error("Add address failed:", error);
      message.error("Failed to add address.");
      message.error("Failed to add address.");
    }
  };

  const updateAddress = async (data) => {
    try {
      await axios.put(`${API_URL}/users/shipping-addresses/${data._id}`, data, {
        withCredentials: true,
      });
      await getUserInfo();
      message.success("Address updated successfully.");
    } catch (error) {
      message.error("Failed to update address.");
      message.error("Failed to update address.");
    }
  };

  const deleteAddress = async (id) => {
    try {
      const response = await axios.delete(
        `${API_URL}/users/shipping-addresses/${id}`,
        { withCredentials: true }
      );
      await getUserInfo();
      message.success("Address deleted successfully.");
    } catch (error) {
      message.error("Failed to delete address.");
      message.error("Failed to delete address.");
    }
  };

  useEffect(() => {
    if (userInfo && userInfo.addresses) {
      setAddresses(userInfo.addresses);
    }
  }, [userInfo?.id]);

  const getUserInfo = async () => {
    try {
      const id = JSON.parse(localStorage.getItem("user") || [])?.id;
      let response;
      if (!id?.includes("guest")) {
        response = await axios.get(`${API_URL}/users/profile`, {
          withCredentials: true,
        });
        setIsLoggedIn(true);
      } else if (id.includes("guest")) {
        response = await axios.get(`${API_URL}/guests/info/${id}`);
      }
      console.log(response.data)
      setUserInfo({ id, ...response?.data });
      setAddresses(response?.data?.addresses);
      return { id, ...response?.data };
    } catch (error) {
      console.error("Error fetching user info:", error);
      return {};
    }
  };

  const addInfo = async (id, data) => {
    try {
      const response = await axios.post(`${API_URL}/guests/info/${id}`, data);
      setUserInfo(response.data);
      return response.data;
    } catch (error) {
      console.error("Error updating user info:", error);
      return {};
    }
  };

  const setDefaultAddress = async (addressId) => {
    try {
      await axios.put(
        `http://localhost:3000/api/users/shipping-addresses/${addressId}/set-default`,
        null,
        {
          withCredentials: true,
        }
      );
      await getUserInfo();
      message.success("Default address updated!");
    } catch (error) {
      message.error("Failed to set default address.");
    }
  };

  const updateInfo = async (values) => {
    try {
      await axios.put("http://localhost:3000/api/users/profile", values, {
        withCredentials: true,
      });
      message.success("Profile updated successfully!");
    } catch (error) {
      message.error(error.response.data.message || "Failed to update profile.");
    }
  };

  const changePassword = async (values) => {
    try {
      await axios.put(
        "http://localhost:3000/api/users/change-password",
        {
          currentPassword: values.oldPassword,
          newPassword: values.newPassword,
        },
        {
          withCredentials: true,
        }
      );
      message.success("Password changed successfully!");
      await getUserInfo();
    } catch (error) {
      message.error(
        error.response?.data?.message || "Failed to change password."
      );
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        addresses,
        userInfo,
        setAddresses,
        addInfoToUser,
        addInfo,
        updateInfo,
        changePassword,
        addAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
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
