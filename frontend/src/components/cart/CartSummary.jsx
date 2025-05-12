// src/components/cart/CartSummary.jsx
import React, { useState } from "react";
import {
  Card,
  Typography,
  List,
  Button,
  Divider,
  InputNumber,
  Switch,
  Tooltip,
} from "antd";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import DiscountCodeInput from "./DiscountCodeInput";
import { QuestionCircleOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const CartSummary = ({ showCheckoutButton = true }) => {
  const {
    subtotal,
    taxes,
    shippingCost,
    discountAmount,
    total,
    cartItemCount,
    loyaltyPoints,
    applyLoyaltyPoints,
    removeLoyaltyPoints,
  } = useCart();

  const [usePoints, setUsePoints] = useState(false);
  const [pointsToUse, setPointsToUse] = useState(0);
  const [maxPointsToUse] = useState(
    Math.min(loyaltyPoints, subtotal * 0.5)
  );
  if (cartItemCount === 0 && showCheckoutButton) {
    return null;
  }

  const vnd = (price) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);

  const handleUsePointsChange = (checked) => {
    setUsePoints(checked);
    if (!checked) {
      setPointsToUse(0);
      removeLoyaltyPoints();
    } else {
      setPointsToUse(maxPointsToUse);
      applyLoyaltyPoints(maxPointsToUse);
    }
  };

  const handlePointsChange = (value) => {
    const points = value || 0;
    setPointsToUse(points);
    applyLoyaltyPoints(points);
  };

  const summaryData = [
    { label: "Subtotal", value: `${vnd(subtotal)}` },
    { label: "Taxes", value: `${vnd(taxes)}` },
    { label: "Shipping", value: `${vnd(shippingCost)}` },
  ];

  if (discountAmount > 0) {
    summaryData.push({
      label: "Discount",
      value: `-${vnd(discountAmount)}`,
      isDiscount: true,
    });
  }

  if (usePoints && pointsToUse > 0) {
    summaryData.push({
      label: "Loyalty Points Used",
      value: `-${vnd(pointsToUse)}`,
      isDiscount: true,
      tooltip: `${pointsToUse} points (${vnd(pointsToUse)})`,
    });
  }

  return (
    <Card
      title={
        <Title level={4} className="mb-0">
          Order Summary
        </Title>
      }
      className="shadow-lg"
    >
      <List
        dataSource={summaryData}
        renderItem={(item) => (
          <List.Item className="flex justify-between px-0 py-2">
            <div>
              <Text className={item.isDiscount ? "text-green-600" : ""}>
                {item.label}
                {item.tooltip && (
                  <Tooltip title={item.tooltip}>
                    <QuestionCircleOutlined className="ml-2 text-gray-400" />
                  </Tooltip>
                )}
              </Text>
            </div>
            <Text strong className={item.isDiscount ? "text-green-600" : ""}>
              {item.value}
            </Text>
          </List.Item>
        )}
      />

      {/* Loyalty Points Section */}
      <div className="mb-4 mt-4">
        <div className="flex justify-between items-center mb-2">
          <div>
            <Text strong>Use Loyalty Points</Text>
            <Tooltip
              title={`Available: ${loyaltyPoints} points (${vnd(
                loyaltyPoints
              )})`}
            >
              <QuestionCircleOutlined className="ml-2 text-gray-400" />
            </Tooltip>
          </div>
          <Switch
            checked={usePoints}
            onChange={handleUsePointsChange}
            disabled={loyaltyPoints <= 0}
          />
        </div>

        {usePoints && (
          <div className="mt-2">
            <Text className="block mb-1">
              Points to use (Max: {vnd(maxPointsToUse)})
            </Text>
            <InputNumber
              min={0}
              max={maxPointsToUse}
              value={pointsToUse}
              onChange={handlePointsChange}
              formatter={(value) => `${value} pts`}
              parser={(value) => value.replace(" pts", "")}
              style={{ width: "100%" }}
              step={1000} // Bước nhảy 1000 points
            />
            <Text type="secondary" className="block mt-1">
              You'll earn {Math.floor((subtotal - (pointsToUse || 0)) * 0.1)}{" "}
              points from this order
            </Text>
          </div>
        )}
      </div>

      <DiscountCodeInput />
      <Divider className="my-3" />
      <div className="flex justify-between mb-4">
        <Title level={4} className="mb-0">
          Total:
        </Title>
        <Title level={4} className="mb-0 text-blue-600">
          {vnd(total - (pointsToUse || 0))}
        </Title>
      </div>
      {showCheckoutButton && cartItemCount > 0 && (
        <Link to="/checkout">
          <Button
            type="primary"
            size="large"
            block
            className="bg-green-500 hover:bg-green-600"
          >
            Proceed to Checkout
          </Button>
        </Link>
      )}
    </Card>
  );
};

export default CartSummary;
