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
    if (userInfo?.id?.includes("guest")) {
      setIsLoggedIn(false);
    } else {
      setIsLoggedIn(true);
    }
  }, [userInfo.id]);

  const guestLogin = () => {
    const id = `guest-${uuidv4()}`;
    localStorage.setItem("user", JSON.stringify({ id }));
  };

  useEffect(() => {
    const init = async () => {
      const user = await getUserInfo();
      setUserInfo(user);
      setAddresses(user.addresses || []);
    };
    init();
  }, [userInfo.id, isLoggedIn]);

  useEffect(() => {
    console.log("Addresses changed:", addresses);
  }, [addresses]);

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
      message.success("Login successfully");

      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
      setIsLoggedIn(true);
    } catch (error) {
      console.error("Login error:", error);
      message.error("Login failed, please try again");
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
      if (!isLoggedIn) {
        const r2 = await axios.post(`${API_URL}/guests/shipping-addresses`, shippingForm);
        setUserInfo(r2.data.userInfo);
      } else {
        const r1 = await axios.post(
          `${API_URL}/users/shipping-addresses`,
          shippingForm,
          { withCredentials: true }
        );
        setUserInfo(r1.data.userInfo);
      }
    } catch (error) {
      console.error("Add address failed:", error);
      message.error("Failed to add address.");
    }
  };

  const updateAddress = async (data) => {
    try {
      const { userInfo, address } = data;
      let response;
      if (!isLoggedIn) {
        response = await axios.put(
          `${API_URL}/guests/shipping-addresses/${userInfo.id}`,
          address
        );
      } else {
        response = await axios.put(
          `${API_URL}/users/shipping-addresses/`,
          address,
          {
            withCredentials: true,
          }
        );
      }
      setAddresses(response.data.addresses);
      message.success("Address updated successfully.");
    } catch (error) {
      message.error("Failed to update address.");
    }
  };

  const deleteAddress = async (id = null, addressId) => {
    try {
      let response;
      if (!isLoggedIn) {
        response = await axios.delete(
          `${API_URL}/guests/shipping-addresses/${id}/${addressId}`
        );
      } else {
        (response = await axios.delete(
          `${API_URL}/users/shipping-addresses/${addressId}`
        )),
          { withCredentials: true };
      }
      setAddresses(response.data.addresses);
      message.success("Address deleted successfully.");
    } catch (error) {
      message.error("Failed to delete address.");
    }
  };

  useEffect(() => {
    setAddresses(userInfo.addresses);
  }, [userInfo.id]);

  const getUserInfo = async () => {
    try {
      const id = JSON.parse(localStorage.getItem("user") || [])?.id;
      let response;
      if (!id?.includes("guest")) {
        response = await axios.get(`${API_URL}/users/profile`, {
          withCredentials: true,
        });
      } else if (id.includes("guest")) {
        response = await axios.get(`${API_URL}/guests/info/${id}`);
      }
      console.log(response)
      setUserInfo({ id, ...response?.data });
      return { id, ...response?.data };
    } catch (error) {
      console.error("Error fetching user info:", error);
      return {};
    }
  };

  const updateInfo = async (id, data) => {
    try {
      const response = await axios.put(`${API_URL}/guests/info/${id}`, data);
      setUserInfo(response.data);
      return response.data;
    } catch (error) {
      console.error("Error updating user info:", error);
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

  const getAddresses = async () => {
    try {
      console.log(userInfo);
      if (!userInfo?.id) return;
      if (isLoggedIn) {
        const response = await axios.get(
          `${API_URL}/users/shipping-addresses`,
          {
            withCredentials: true,
          }
        );
        return response.data;
      } else {
        const response = await axios.get(
          `${API_URL}/guests/shipping-addresses/${userInfo.id}`
        );
        return response.data;
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
      return [];
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
        addAddress,
        updateAddress,
        deleteAddress,
        getUserInfo,
        getAddresses,
        addOrderToUser,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
