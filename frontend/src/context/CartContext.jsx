import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useMemo,
} from "react";
import { message } from "antd";

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

// Helper function to calculate item subtotal
const calculateItemSubtotal = (item) => {
  console.log(item)
  const price = item.productPrice;
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

  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

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
            productPrice: product.price,
            variantId: variant?._id ? variant._id : product.variants[0]._id,
            variantName: variant?.name ? variant.name : product.variants[0].name,
            productPrice: variant?.price ? variant.price : product.variants[0].price,
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
            productPrice: newVariant.price,
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
    messageApi.info("Cart cleared.");
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
    // In a real app, this would be an API call to validate the discount
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const normalizedCode = code.toUpperCase();

        // Mock discount validation
        if (normalizedCode === "SAVE10") {
          const newDiscountInfo = {
            discountId: "mock-discount-id-1",
            code: normalizedCode,
            type: "percentage",
            value: 10,
          };
          setDiscountInfo(newDiscountInfo);
          messageApi.success(`Discount "${normalizedCode}" applied!`);
          resolve(newDiscountInfo);
        } else if (normalizedCode === "FLAT20") {
          const newDiscountInfo = {
            discountId: "mock-discount-id-2",
            code: normalizedCode,
            type: "fixed",
            value: 20,
          };
          setDiscountInfo(newDiscountInfo);
          messageApi.success(`Discount "${normalizedCode}" applied!`);
          resolve(newDiscountInfo);
        } else {
          setDiscountInfo(null);
          messageApi.error("Invalid discount code.");
          reject(new Error("Invalid discount code."));
        }
      }, 1000);
    });
  };

  const removeDiscountCode = () => {
    setDiscountInfo(null);
    messageApi.info("Discount code removed.");
  };

  const cartItemCount = useMemo(() => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  }, [cartItems]);

  // Prepare cart data for order creation
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
        price: item.variantId ? item.variantPrice : item.productPrice,
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

  const [messageApi, contextHolder] = message.useMessage();
  return (
    <CartContext.Provider
      value={{
        cartItems,
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
