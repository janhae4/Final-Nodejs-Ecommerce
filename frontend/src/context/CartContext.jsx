import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useMemo,
} from "react";
import { ConfigProvider, message } from "antd";
import axios from "axios";
import { useAuth } from "./AuthContext";
import { v4 as uuidv4 } from "uuid";
import { useLocation } from "react-router-dom";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

// Helper function to calculate item subtotal
const calculateItemSubtotal = (item) => {
  const price = item.price;
  return price * item.quantity;
};

export const CartProvider = ({ children }) => {
  const { isLoggedIn, userInfo, setAddresses } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [discountInfo, setDiscountInfo] = useState(null);
  const [shippingCost, setShippingCost] = useState(0);
  const [taxRate, setTaxRate] = useState(0.07);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [createCart, setCreateCart] = useState(false);
  const [loading, setLoading] = useState(true);
  const { pathname } = useLocation();
  const shouldFetchCart =
    pathname === "/" ||
    pathname === "/cart" ||
    pathname.startsWith("/products/");
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (!localStorage.getItem("isCreateCart")) {
      createGuestCart();
      setCreateCart(true);
      localStorage.setItem("isCreateCart", true);
    }
  }, [createCart]);

  const createGuestCart = async () => {
    try {
      if (!userInfo?._id) return;
      let response;
      if (isLoggedIn) {
        response = await axios.post(
          `${API_URL}/users/cart`,
          {
            data: [],
          },
          { withCredentials: true }
        );
      } else {
        response = await axios.post(`${API_URL}/guests/cart`, {
          data: [],
        });
      }
      const guestId = response.data;
      localStorage.setItem("user", { id: guestId });
      return guestId;
    } catch (error) {
      console.error("Failed to create guest cart:", error);
      return null;
    }
  };

  const fetchCart = async () => {
    try {
      if (!userInfo?.id) return;
      if (isLoggedIn && !userInfo?.id.includes("guest")) {
        const response = await axios.get(`${API_URL}/users/cart`, {
          withCredentials: true,
        });
        setCartItems(response.data || []);
      } else {
        const guestId = userInfo.id;
        const response = await axios.get(`${API_URL}/guests/cart/${guestId}`);
        const cartData = response.data;
        const normalizedData = cartData.data ? cartData.data : cartData;
        setCartItems(normalizedData || []);
      }
    } catch (error) {
      console.error("Failed to fetch cart:", error);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (shouldFetchCart && userInfo?.id) {
      fetchCart();
    }
  }, [userInfo?.id, isLoggedIn, shouldFetchCart]);

  const updateCartInRedis = async () => {
    if (loading) return;
    if (!userInfo?.id) return;
    try {
      if (isLoggedIn && userInfo?.id) {
        await axios.put(
          `${API_URL}/users/cart`,
          {
            data: cartItems,
          },
          { withCredentials: true }
        );
      } else {
        const guestId = userInfo.id;
        await axios.put(`${API_URL}/guests/cart/${guestId}`, {
          data: cartItems,
        });
      }
    } catch (error) {
      console.error("Failed to update cart in Redis:", error);
    }
  };

  useEffect(() => {
    let debounceTimer;
    console.log(213, createCart)
    if (JSON.parse(localStorage.getItem("isCreateCart"))) {
      console.log(213)
      debounceTimer = setTimeout(updateCartInRedis, 400);
    }
    return () => clearTimeout(debounceTimer);
  }, [cartItems, loading]);



  const addItemToCart = (product, variant = null, quantity = 1) => {
    setCreateCart(true);
    console.log("ADDED CART", product, variant);
    setCartItems((prevItems) => {
      const itemKey = variant ? `${product._id}-${variant._id}` : `${product._id}-${product.variants[0]._id}`;

      const existingItemIndex = prevItems.findIndex(
        (item) => item.key === itemKey
      );

      if (existingItemIndex > -1) {
        const updatedItems = [...prevItems];
        const newQuantity = updatedItems[existingItemIndex].quantity + quantity;

        const inventory = variant?.inventory || product.inventory;
        if (newQuantity > inventory) {
          message.warning(
            `Không thể thêm. Chỉ còn ${inventory} sản phẩm ${
              product.nameProduct
            }${variant ? ` (${variant.name})` : ""} trong kho.`
          );
          updatedItems[existingItemIndex].quantity = inventory;
        } else {
          updatedItems[existingItemIndex].quantity = newQuantity;
        }
        return updatedItems;
      } else {
        const inventory = variant?.inventory || product.inventory;
        if (quantity > inventory) {
          message.warning(
            `Cannot add ${quantity}. Only ${inventory} available.`
          );
          quantity = inventory;
        }

        return [
          ...prevItems,
          {
            key: itemKey,
            productId: product._id,
            productName: product.nameProduct,
            variants: product.variants,
            variantId: variant?._id ? variant._id : product.variants[0]._id,
            variantName: variant?.name
              ? variant.name
              : product.variants[0].name,
            price: Number(
              variant?.price ? variant.price : product.variants[0].price
            ),
            quantity: quantity,
            image: product.images[0],
            slug: product.slug,
          },
        ];
      }
    });
    message.success(`Added into cart!`);
  };

  const updateItemQuantity = (itemKey, newQuantity) => {
    setCartItems((prevItems) => {
      return prevItems.map((item) => {
        if (item.key === itemKey) {
          const inventory = item.variantId
            ? cartItems.find((i) => i.key === itemKey)?.inventory
            : cartItems.find((i) => i.key === itemKey)?.inventory;

          if (newQuantity < 1) return { ...item, quantity: 1 };
          if (inventory !== undefined && newQuantity > inventory) {
            message.warning(`Only ${inventory} available.`);
            message.warning(`Only ${inventory} available.`);
            return { ...item, quantity: inventory };
          }
          return { ...item, quantity: newQuantity };
        }
        return item;
      });
    });
  };

  const updateVariant = (itemKey, newVariant) => {
    setCartItems((prevItems) => {
      return prevItems.map((item) => {
        if (item.key === itemKey) {
          return {
            ...item,
            variantId: newVariant._id,
            variantName: newVariant.name,
            price: newVariant.price,
          };
        }
        return item;
      });
    });
  };

  const removeItemFromCart = (itemKey) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => item.key !== itemKey)
    );
    message.info("Deleted!.");
  };

  const clearCart = async () => {
    try {
      if (isLoggedIn && userInfo?._id) {
        await axios.delete(`${API_URL}/users/cart/`, {
          withCredentials: true,
        });
      } else {
        const guestId = userInfo.id;
        console.log(userInfo);
        await axios.delete(`${API_URL}/guests/cart/${guestId}`);
      }
      setCartItems([]);
    } catch (error) {
      console.error("Failed to clear cart:", error);
    }
  };

  const subtotal = useMemo(() => {
    return cartItems.reduce(
      (total, item) => total + calculateItemSubtotal(item),
      0
    );
  }, [cartItems]);

  const taxes = useMemo(() => {
    return subtotal * taxRate;
  }, [subtotal, taxRate]);

  const discountAmount = useMemo(() => {
    if (!discountInfo) return 0;

    let deduction = 0;
    if (discountInfo.type === "percentage") {
      deduction = subtotal * (discountInfo.value / 100);
    } else if (discountInfo.type === "fixed") {
      deduction = discountInfo.value;
    }

    return Math.min(deduction, subtotal);
  }, [subtotal, discountInfo]);

  const total = useMemo(() => {
    const totalBeforeShipping =
      subtotal - discountAmount + taxes - loyaltyPoints;
    return totalBeforeShipping > 0 ? totalBeforeShipping + shippingCost : 0;
  }, [subtotal, discountAmount, taxes, shippingCost, loyaltyPoints]);

  useEffect(() => {
    setShippingCost(subtotal > 1000000 ? 0 : subtotal * 0.05);
  }, [total]);

  const applyDiscountCode = async (code) => {
    try {
      const normalizedCode = code.toUpperCase();
      const response = await axios.get(
        `${API_URL}/discount-codes/code/${normalizedCode}`
      );
      const discount = response.data;
      console.log(discount);
      if (discount.usedCount >= discount.usageLimit) {
        throw new Error("Your discount code has reached its usage limit.");
      }
      setDiscountInfo(response.data);
    } catch (error) {
      setDiscountInfo(null);
      if (error.message.includes("404")) {
        throw new Error("Discount code not found.");
      }
      throw error;
    }
  };

  const removeDiscountCode = () => {
    setDiscountInfo(null);
    message.info("Deleted!");
  };

  const cartItemCount = useMemo(() => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  }, [cartItems]);

  const getCartForOrder = (userInfo) => {
    return {
      userInfo: {
        userId: isLoggedIn ? userInfo._id : userInfo.id,
        fullName: userInfo.fullName,
        email: userInfo.email,
        phone: userInfo.phone,
      },
      products: cartItems.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        variantId: item.variantId,
        variantName: item.variantName,
        quantity: item.quantity,
        price: item.variantId ? item.variantPrice : item.price,
      })),
      discountInfo: discountInfo
        ? {
            discountId: discountInfo.discountId,
            code: discountInfo.code,
            value: discountInfo.value,
            type: discountInfo.type,
          }
        : null,
      subtotal,
      discountAmount,
      taxes,
      shippingCost,
      total,
      loyaltyPointsUsed: loyaltyPoints > 0 ? loyaltyPoints : 0,
      loyaltyPointsEarned: Math.floor(total / 10),
    };
  };

  const placeOrder = async (orderData) => {
    try {
      let response;
      if (isLoggedIn) {
        response = await axios.post(`${API_URL}/orders`, orderData, {
          withCredentials: true,
        });
      } else {
        response = await axios.post(`${API_URL}/guests/orders`, orderData);
      }
      message.success("Order placed successfully.");
      setDiscountInfo(null);
      clearCart();
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        placeOrder,
        addItemToCart,
        updateVariant,
        updateItemQuantity,
        removeItemFromCart,
        clearCart,
        cartItemCount,
        subtotal,
        taxes,
        shippingCost,
        discountInfo,
        discountAmount,
        total,
        loyaltyPoints,
        applyDiscountCode,
        removeDiscountCode,
        setShippingCost,
        getCartForOrder,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
