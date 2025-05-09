// src/components/cart/CartItem.jsx
import React from 'react';
import { Row, Col, Image, InputNumber, Button, Typography, Tag } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const { Text, Title } = Typography;

const CartItem = ({ item }) => {
  const { updateItemQuantity, removeItemFromCart } = useCart();
  const itemKey = item.product.id + (item.variant ? `-${item.variant.id}` : '');
  
  const basePrice = item.product.price;
  const variantPriceModifier = item.variant?.priceModifier || 0;
  const unitPrice = basePrice + variantPriceModifier;
  const itemSubtotal = unitPrice * item.quantity;

  return (
    <Row gutter={[16, 16]} align="middle" className="py-4 border-b border-gray-200">
      <Col xs={24} sm={4} md={3}>
        <Image 
            width="100%" 
            src={item.product.images[0]?.url || 'https://via.placeholder.com/100?text=No+Image'} 
            alt={item.product.name}
            className="rounded" 
        />
      </Col>
      <Col xs={24} sm={10} md={9}>
        <Link to={`/products/${item.product.id}`}>
          <Title level={5} className="mb-1 hover:text-blue-500">{item.product.name}</Title>
        </Link>
        {item.variant && <Tag color="blue" className="mb-1">{item.variant.name}</Tag>}
        <Text type="secondary" className="block text-sm">Unit Price: ${unitPrice.toFixed(2)}</Text>
      </Col>
      <Col xs={12} sm={5} md={4} className="flex items-center">
        <InputNumber
          min={1}
          max={item.variant?.stock || 100} // Use stock limit if available
          value={item.quantity}
          onChange={(value) => updateItemQuantity(itemKey, value)}
          className="w-20"
        />
      </Col>
      <Col xs={8} sm={3} md={4} className="text-right">
        <Text strong className="text-md">${itemSubtotal.toFixed(2)}</Text>
      </Col>
      <Col xs={4} sm={2} md={4} className="text-right">
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => removeItemFromCart(itemKey)}
          aria-label="Remove item"
        />
      </Col>
    </Row>
  );
};

export default CartItem;