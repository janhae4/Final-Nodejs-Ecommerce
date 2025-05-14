// src/components/cart/CartSummary.jsx
import React from 'react';
import { Card, Typography, List, Button, Divider } from 'antd';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import DiscountCodeInput from './DiscountCodeInput';

const { Title, Text } = Typography;

const CartSummary = ({ showCheckoutButton = true }) => {
  const { subtotal, taxes, shippingCost, discountAmount, total, cartItemCount } = useCart();

  if (cartItemCount === 0 && showCheckoutButton) { // Don't show summary if cart is empty on cart page
    return null; 
  }

  const summaryData = [
    { label: 'Subtotal', value: `$${subtotal.toFixed(2)}` },
    { label: 'Taxes', value: `$${taxes.toFixed(2)}` },
    { label: 'Shipping', value: `$${shippingCost.toFixed(2)}` },
  ];

  if (discountAmount > 0) {
    summaryData.push({ label: 'Discount', value: `-$${discountAmount.toFixed(2)}`, isDiscount: true });
  }

  return (
    <Card title={<Title level={4} className="mb-0">Order Summary</Title>} className="shadow-lg">
      <List
        dataSource={summaryData}
        renderItem={item => (
          <List.Item className="flex justify-between px-0 py-2">
            <Text className={item.isDiscount ? "text-green-600" : ""}>{item.label}:</Text>
            <Text strong className={item.isDiscount ? "text-green-600" : ""}>{item.value}</Text>
          </List.Item>
        )}
      />
      <DiscountCodeInput />
      <Divider className="my-3" />
      <div className="flex justify-between mb-4">
        <Title level={4} className="mb-0">Total:</Title>
        <Title level={4} className="mb-0 text-blue-600">${total.toFixed(2)}</Title>
      </div>
      {showCheckoutButton && cartItemCount > 0 && (
        <Link to="/checkout">
          <Button type="primary" size="large" block className="bg-green-500 hover:bg-green-600">
            Proceed to Checkout
          </Button>
        </Link>
      )}
    </Card>
  );
};

export default CartSummary;