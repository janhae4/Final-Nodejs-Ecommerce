import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useMemo,
} from "react";
import { message } from "antd";
import axios from "axios";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

// Helper function to calculate item subtotal
const calculateItemSubtotal = (item) => {
  console.log(item);
  const price = item.price;
  return price * item.quantity;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const localData = localStorage.getItem("cartItems");
    return localData ? JSON.parse(localData) : [];
  });
  const [discountInfo, setDiscountInfo] = useState(null); // { discountId: string, code: string, type: 'percentage' | 'fixed', value: number }
  const [shippingCost, setShippingCost] = useState(5.0);
  const [taxRate, setTaxRate] = useState(0.07);
  const [orders, setOrders] = useState([]);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    getOrderFromUser();
  }, [orders]);

  const addItemToCart = (product, variant = null, quantity = 1) => {
    setCartItems((prevItems) => {
      const itemKey = variant ? `${product._id}-${variant._id}` : product._id;

      const existingItemIndex = prevItems.findIndex(
        (item) => item.key === itemKey
      );

      if (existingItemIndex > -1) {
        const updatedItems = [...prevItems];
        const newQuantity = updatedItems[existingItemIndex].quantity + quantity;

        // Check against inventory
        const inventory = variant?.inventory || product.inventory;
        if (newQuantity > inventory) {
          messageApi.warning(
            `Cannot add more. Only ${inventory} of ${product.nameProduct}${
              variant ? ` (${variant.name})` : ""
            } in stock.`
          );
          updatedItems[existingItemIndex].quantity = inventory;
        } else {
          updatedItems[existingItemIndex].quantity = newQuantity;
        }
        return updatedItems;
      } else {
        // Check inventory for new item
        const inventory = variant?.inventory || product.inventory;
        if (quantity > inventory) {
          messageApi.warning(
            `Cannot add ${quantity}. Only ${inventory} of ${
              product.nameProduct
            }${variant ? ` (${variant.name})` : ""} in stock.`
          );
          quantity = inventory;
        }

        console.log(product.variants);

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
            price: variant?.price ? variant.price : product.variants[0].price,
            quantity: quantity,
            image: product.images[0],
          },
        ];
      }
    });
    messageApi.success(
      `${product.nameProduct}${
        variant ? ` (${variant.name})` : ""
      } added to cart!`
    );
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
            messageApi.warning(`Only ${inventory} in stock.`);
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
    messageApi.info("Item removed from cart.");
  };

  const clearCart = () => {
    setCartItems([]);
    setDiscountInfo(null);
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

    // Ensure discount doesn't exceed subtotal
    return Math.min(deduction, subtotal);
  }, [subtotal, discountInfo]);

  const total = useMemo(() => {
    const totalBeforeShipping = subtotal - discountAmount + taxes;
    return totalBeforeShipping > 0 ? totalBeforeShipping + shippingCost : 0;
  }, [subtotal, discountAmount, taxes, shippingCost]);

  const applyDiscountCode = async (code) => {
    try {
      const normalizedCode = code.toUpperCase();
      const response = await axios.get(
        `${API_URL}/discount-codes/code/${normalizedCode}`
      );
      const discount = response.data;
      console.log(discount);
      if (discount.usedCount >= discount.usageLimit) {
        throw new Error("Discount code has reached its usage limit.");
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
    messageApi.info("Discount code removed.");
  };

  const cartItemCount = useMemo(() => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  }, [cartItems]);

  const getCartForOrder = (userInfo) => {
    return {
      userInfo: {
        userId: userInfo._id,
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
    };
  };

  const addOrderToUser = (order) => {
    const user = JSON.parse(localStorage.getItem("user")) || {};
    user.orders = [...(user.orders || []), order];
    localStorage.setItem("user", JSON.stringify(user));
  };

  const getOrderFromUser = () => {
    const user = JSON.parse(localStorage.getItem("user")) || {};
    return user.orders || [];
  };

  const setLoyaltyPoints = (earnedPoints, usedPoints) => {
    const user = JSON.parse(localStorage.getItem("user")) || {};
    user.loyaltyPoints = (user.loyaltyPoints || 0) + earnedPoints - usedPoints;
    localStorage.setItem("user", JSON.stringify(user));
  };

  const placeOrder = async (orderData) => {
    try {
      const response = await axios.post(`${API_URL}/orders`, orderData);
      messageApi.success("Order placed successfully.");
      addOrderToUser(response.data);
      setLoyaltyPoints(response.data.loyaltyPointsEarned, response.data.loyaltyPointsUsed);
      setOrders((prev) => [...prev, response.data]);
      clearCart();
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const [messageApi, contextHolder] = message.useMessage();
  return (
    <CartContext.Provider
      value={{
        orders,
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
        applyDiscountCode,
        removeDiscountCode,
        setShippingCost,
        getCartForOrder,
      }}
    >
      {contextHolder}
      {children}
    </CartContext.Provider>
  );
};
