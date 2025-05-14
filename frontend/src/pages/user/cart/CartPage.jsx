// src/pages/CartPage.jsx
import React from 'react';
import { Row, Col, Typography, Button, Empty, Layout } from 'antd';
import { Link } from 'react-router-dom';
import CartItem from '../../../components/cart/CartItem';
import CartSummary from '../../../components/cart/CartSummary';
import { useCart } from '../../../context/CartContext';

const { Title } = Typography;

const CartPage = () => {
  const { cartItems, clearCart, cartItemCount } = useCart();

  return (
    <Layout>
      <div className="container mx-auto p-4 md:p-8">
        <Title level={2} className="mb-6">Your Shopping Cart</Title>
        {cartItemCount === 0 ? (
          <Empty
            image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
            description={
              <span>
                Your cart is empty. <Link to="/products" className="text-blue-500 hover:text-blue-700">Continue Shopping</Link>
              </span>
            }
            className="py-10"
          />
        ) : (
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={16}>
              <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
                <div className="flex justify-between items-center mb-4">
                    <Title level={4} className="mb-0">Items ({cartItemCount})</Title>
                    <Button type="link" danger onClick={clearCart}>Clear Cart</Button>
                </div>
                {cartItems.map(item => (
                  <CartItem key={item.product.id + (item.variant ? `-${item.variant.id}` : '')} item={item} />
                ))}
              </div>
            </Col>
            <Col xs={24} lg={8}>
              <CartSummary />
            </Col>
          </Row>
        )}
      </div>
    </Layout>
  );
};

export default CartPage;