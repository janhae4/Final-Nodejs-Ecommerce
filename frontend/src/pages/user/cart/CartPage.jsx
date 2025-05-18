// src/pages/CartPage.jsx
import React, { useState } from "react";
import { Row, Col, Typography, Button, Empty, Layout, Spin } from "antd";
import { Link } from "react-router-dom";
import CartItem from "../../../components/cart/CartItem";
import CartSummary from "../../../components/cart/CartSummary";
import { useCart } from "../../../context/CartContext";

const { Title } = Typography;

const CartPage = () => {
  const { cartItems, clearCart, cartItemCount } = useCart();
  const [showCheckoutButton, setShowCheckoutButton] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleClearCart = async () => {
    setLoading(true);
    await clearCart();
    setLoading(false);
  };

  if (loading) {
    return (
      <Layout>
        <div className="container flex flex-col items-center justify-center p-4 md:p-8 overflow-auto min-h-104">
          <Spin size="large" spinning={true} />
          <Title className="mt-5" level={3}>
            Loading... Please wait
          </Title>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-4 md:p-8 overflow-auto min-h-104">
        <Title level={2} className="mb-6 text-center">
          Your Shopping Cart
        </Title>
        {cartItemCount === 0 ? (
          <div className="flex justify-center items-center">
            <Empty
              image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
              description={
                <span className="-ml-10">
                  Your cart is empty.{" "}
                  <Link
                    to="/products"
                    className="text-blue-500 hover:text-blue-700"
                  >
                    Continue Shopping
                  </Link>
                </span>
              }
              className="p-12 ml-6"
            />
          </div>
        ) : (
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={16}>
              <div className="bg-white p-4 sm:p-6 rounded-lg shadow">
                <div className="flex justify-between items-center mb-4">
                  <Title level={4} className="mb-0">
                    Items ({cartItemCount})
                  </Title>
                  <Button type="link" danger onClick={handleClearCart}>
                    Clear Cart
                  </Button>
                </div>
                {cartItems.map((item) => (
                  <CartItem
                    key={
                      item.productId +
                      (item.variant ? `-${item.variant.id}` : "")
                    }
                    item={item}
                    setShowCheckoutButton={setShowCheckoutButton}
                  />
                ))}
              </div>
            </Col>
            <Col xs={24} lg={8}>
              <CartSummary showCheckoutButton={showCheckoutButton} />
            </Col>
          </Row>
        )}
      </div>
    </Layout>
  );
};

export default CartPage;
