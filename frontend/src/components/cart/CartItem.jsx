// src/components/cart/CartItem.jsx
import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Image,
  InputNumber,
  Button,
  Typography,
  Tag,
  Select,
  message,
} from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";

const { Text, Title } = Typography;

const CartItem = ({ item, setShowCheckoutButton=null }) => {
  const { updateItemQuantity, removeItemFromCart, updateVariant } = useCart();
  useEffect(() => {
    const variant = item.variants.find((v) => v._id === item.variantId);
    if (variant.inventory - variant.used < item.quantity) {
      message.warning(`Only ${variant.inventory - variant.used} available.`);
      if (setShowCheckoutButton) {
        setShowCheckoutButton(false);
      }
    }
    else {
      if (setShowCheckoutButton) {
        setShowCheckoutButton(true);
      }
    }
  }, [item]);
  
  const unitPrice = item.price;
  const itemSubtotal = unitPrice * item.quantity;
  
  const handleChangeVariant = (value) => {
    console.log(123123, value)
    const newVariant = item.variants.find((v) => v._id === value);
    console.log(newVariant)
    updateVariant(item.key, newVariant);
  };

  return (
    <Row
      gutter={[16, 16]}
      align="middle"
      className="py-4 border-b border-gray-200"
    >
      <Col xs={8} sm={3} md={3}>
        <Image
          width="100%"
          src={item.image || "https://via.placeholder.com/100?text=No+Image"}
          alt={item.productName}
          className="rounded"
        />
      </Col>
      <Col xs={16} sm={7} md={7}>
        <Link to={`/products/detail/${item.slug}`}>
          <Title level={5} className="mb-1 hover:text-blue-500">
            {item.productName}
          </Title>
        </Link>
        {item.variant && (
          <Tag color="blue" className="mb-1">
            {item.variant.name}
          </Tag>
        )}
        <Text type="secondary" className="block text-sm">
          Unit Price:{" "}
          {unitPrice.toLocaleString("vi-VN", {
            style: "currency",
            currency: "VND",
          })}
        </Text>
      </Col>

      <Col xs={9} sm={5} md={5} className="text-right">
        <Select
          value={item?.variantId}
          onChange={handleChangeVariant}
          className="w-full"
          defaultValue={(item?.variants && item?.variants[0]?._id) || ""}
        >
          {item?.variants.map((v) => (
            <Select.Option key={v.id} value={v._id}>
              {v.name}
            </Select.Option>
          ))}
        </Select>
      </Col>

      <Col xs={5} sm={3} md={3} className="flex items-center">
        <InputNumber
          min={1}
          max={item.variant?.stock || 100}
          value={item.quantity}
          onChange={(value) => updateItemQuantity(item.key, value)}
          className="w-20"
        />
      </Col>
      <Col xs={7} sm={3} md={3} className="text-right">
        <Text strong className="text-md">
          {itemSubtotal.toLocaleString("vi-VN", {
            style: "currency",
            currency: "VND",
          })}
        </Text>
      </Col>
      <Col xs={2} sm={2} md={2} className="text-right">
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => removeItemFromCart(item.key)}
          aria-label="Remove item"
        />
      </Col>
    </Row>
  );
};

export default CartItem;
