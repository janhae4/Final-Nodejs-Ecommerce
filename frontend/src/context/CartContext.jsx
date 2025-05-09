import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
import { message } from 'antd';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

// Helper function to calculate item subtotal
const calculateItemSubtotal = (item) => {
    const basePrice = item.product.price;
    const variantPriceModifier = item.variant?.priceModifier || 0;
    return (basePrice + variantPriceModifier) * item.quantity;
};

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState(() => {
        const localData = localStorage.getItem('cartItems');
        return localData ? JSON.parse(localData) : [];
    });
    const [discountInfo, setDiscountInfo] = useState(null); // { code: 'SAVE10', type: 'percentage', value: 10, amountDeducted: 0 }
    const [shippingCost, setShippingCost] = useState(5.00); // Example fixed shipping
    const [taxRate, setTaxRate] = useState(0.07); // Example 7% tax rate

    useEffect(() => {
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }, [cartItems]);

    const addItemToCart = (product, variant, quantity = 1) => {
        setCartItems(prevItems => {
            const itemKey = product.id + (variant ? `-${variant.id}` : '');
            const existingItemIndex = prevItems.findIndex(item => (item.product.id + (item.variant ? `-${item.variant.id}` : '')) === itemKey);

            if (existingItemIndex > -1) {
                const updatedItems = [...prevItems];
                const newQuantity = updatedItems[existingItemIndex].quantity + quantity;
                // Check against stock if variant exists
                const stockLimit = variant?.stock;
                if (stockLimit !== undefined && newQuantity > stockLimit) {
                    message.warning(`Cannot add more. Only ${stockLimit} of ${product.name} (${variant.name}) in stock.`);
                    updatedItems[existingItemIndex].quantity = stockLimit;
                } else {
                    updatedItems[existingItemIndex].quantity = newQuantity;
                }
                return updatedItems;
            } else {
                // Check stock for new item
                const stockLimit = variant?.stock;
                if (stockLimit !== undefined && quantity > stockLimit) {
                    message.warning(`Cannot add ${quantity}. Only ${stockLimit} of ${product.name} (${variant.name}) in stock.`);
                    return [...prevItems, { product, variant, quantity: stockLimit, key: itemKey }];
                }
                return [...prevItems, { product, variant, quantity, key: itemKey }];
            }
        });
        message.success(`${product.name} ${variant ? `(${variant.name})` : ''} added to cart!`);
    };

    const updateItemQuantity = (itemKey, newQuantity) => {
        setCartItems(prevItems => {
            return prevItems.map(item => {
                const currentItemKey = item.product.id + (item.variant ? `-${item.variant.id}` : '');
                if (currentItemKey === itemKey) {
                    const stockLimit = item.variant?.stock;
                    if (newQuantity < 1) return { ...item, quantity: 1 }; // Minimum quantity 1
                    if (stockLimit !== undefined && newQuantity > stockLimit) {
                        message.warning(`Only ${stockLimit} in stock.`);
                        return { ...item, quantity: stockLimit };
                    }
                    return { ...item, quantity: newQuantity };
                }
                return item;
            });
        });
    };

    const removeItemFromCart = (itemKey) => {
        setCartItems(prevItems => prevItems.filter(item => (item.product.id + (item.variant ? `-${item.variant.id}` : '')) !== itemKey));
        message.info('Item removed from cart.');
    };

    const clearCart = () => {
        setCartItems([]);
        setDiscountInfo(null);
        message.info('Cart cleared.');
    };
    
    const subtotal = useMemo(() => {
        return cartItems.reduce((total, item) => total + calculateItemSubtotal(item), 0);
    }, [cartItems]);

    const taxes = useMemo(() => {
        return subtotal * taxRate;
    }, [subtotal, taxRate]);

    const discountAmount = useMemo(() => {
        if (!discountInfo) return 0;
        let deduction = 0;
        if (discountInfo.type === 'percentage') {
            deduction = subtotal * (discountInfo.value / 100);
        } else if (discountInfo.type === 'fixed_amount') {
            deduction = discountInfo.value;
        }
        // Ensure discount doesn't exceed subtotal
        return Math.min(deduction, subtotal);
    }, [subtotal, discountInfo]);

    const total = useMemo(() => {
        const totalBeforeShipping = subtotal - discountAmount + taxes;
        return totalBeforeShipping > 0 ? totalBeforeShipping + shippingCost : 0; // No shipping if total is 0 or less
    }, [subtotal, discountAmount, taxes, shippingCost]);


    // Mock discount validation
    const applyDiscountCode = async (code) => {
        // In a real app, this would be an API call to `checkoutService.js`
        // Simulating API call
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                const normalizedCode = code.toUpperCase();
                if (normalizedCode === 'SAVE10') {
                    const newDiscountInfo = { code: normalizedCode, type: 'percentage', value: 10, description: '10% off your order' };
                    setDiscountInfo(newDiscountInfo);
                    message.success(`Discount "${normalizedCode}" applied!`);
                    resolve(newDiscountInfo);
                } else if (normalizedCode === 'FLAT20') {
                     const newDiscountInfo = { code: normalizedCode, type: 'fixed_amount', value: 20, description: '$20 off your order' };
                    setDiscountInfo(newDiscountInfo);
                    message.success(`Discount "${normalizedCode}" applied!`);
                    resolve(newDiscountInfo);
                } else {
                    setDiscountInfo(null); // Clear previous discount if new one is invalid
                    message.error('Invalid discount code.');
                    reject(new Error('Invalid discount code.'));
                }
            }, 1000);
        });
    };
    
    const removeDiscountCode = () => {
        setDiscountInfo(null);
        message.info('Discount code removed.');
    };


    const cartItemCount = useMemo(() => {
        return cartItems.reduce((count, item) => count + item.quantity, 0);
    }, [cartItems]);

    return (
        <CartContext.Provider value={{
            cartItems,
            addItemToCart,
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
            setShippingCost
        }}>
            {children}
        </CartContext.Provider>
    );
};