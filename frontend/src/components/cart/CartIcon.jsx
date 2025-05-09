// src/components/cart/CartIcon.jsx
import React from 'react';
import { Badge, Button } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';

const CartIcon = () => {
  const { cartItemCount } = useCart();

  return (
    <Link to="/cart">
      <Badge count={cartItemCount} size="small" offset={[-3,3]}>
        <Button type="text" icon={<ShoppingCartOutlined style={{ fontSize: '20px' }} />} className="text-white hover:text-blue-300" />
      </Badge>
    </Link>
  );
};

export default CartIcon;