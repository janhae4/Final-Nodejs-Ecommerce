import {
  Row,
  Col,
  Card,
  Typography,
  Tag,
  Divider,
  Button,
  Timeline,
  Descriptions,
} from "antd";
import {
  CreditCardOutlined,
  HomeOutlined,
  ShoppingOutlined,
  TagOutlined
} from "@ant-design/icons";
import React from "react";
import { Link } from "react-router-dom";
const { Text } = Typography;
const OrderDetail = ({ order }) => {
  const statusColors = {
    pending: "orange",
    confirmed: "blue",
    shipping: "purple",
    delivered: "green",
    cancelled: "red",
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  const formatDate = (dateString) => new Date(dateString).toLocaleString();

  return (
    <>
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card title="Order Summary" className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <Text strong>Order Code: {order.orderCode}</Text>
              <Tag
                color={statusColors[order.status]}
                className="text-capitalize"
              >
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Tag>
            </div>

            <Divider orientation="left">Products</Divider>
            {order.products.map((product, index) => (
              <div key={index} className="mb-4 pb-4 border-b last:border-b-0">
                <div className="flex justify-between">
                  <div>
                    <Text strong>{product.productName}</Text>
                    {product.variantName && (
                      <Text type="secondary" className="block">
                        Variant: {product.variantName}
                      </Text>
                    )}
                    <Text type="secondary">Qty: {product.quantity}</Text>
                  </div>
                  <Text strong>
                    {formatPrice(product.price * product.quantity)}
                  </Text>
                </div>
              </div>
            ))}

            <Divider orientation="left">Timeline</Divider>
            <Timeline>
              {order.statusHistory.map((status, index) => (
                <Timeline.Item key={index} color={statusColors[status.status]}>
                  <p>
                    {status.status.charAt(0).toUpperCase() +
                      status.status.slice(1)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatDate(status.timestamp)}
                  </p>
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Order Information" className="mb-6">
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item
                label={
                  <>
                    <ShoppingOutlined /> Purchase Date
                  </>
                }
              >
                {formatDate(order.purchaseDate)}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <>
                    <HomeOutlined /> Shipping Address
                  </>
                }
              >
                {order.shippingAddress}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <>
                    <CreditCardOutlined /> Payment Method
                  </>
                }
              >
                {order.paymentMethod === "credit_card"
                  ? "Credit Card"
                  : order.paymentMethod}
              </Descriptions.Item>
              {order.discountInfo && (
                <Descriptions.Item
                  label={
                    <>
                      <TagOutlined /> Discount
                    </>
                  }
                >
                  {order.discountInfo.code} (-
                  {formatPrice(order.discountInfo.value)})
                </Descriptions.Item>
              )}
            </Descriptions>

            <Divider />

            <div className="space-y-2">
              <div className="flex justify-between">
                <Text>Subtotal:</Text>
                <Text>
                  {formatPrice(
                    order.totalAmount + (order.discountInfo?.value || 0)
                  )}
                </Text>
              </div>
              {order.discountInfo && (
                <div className="flex justify-between">
                  <Text>Discount:</Text>
                  <Text type="success">
                    -{formatPrice(order.discountInfo.value)}
                  </Text>
                </div>
              )}
              <div className="flex justify-between">
                <Text strong>Total:</Text>
                <Text strong>{formatPrice(order.totalAmount)}</Text>
              </div>
              <div className="flex justify-between">
                <Text>Loyalty Points Earned:</Text>
                <Text type="success">+{order.loyaltyPointsEarned}</Text>
              </div>
            </div>
          </Card>

          <Card title="Customer Information">
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Full Name">
                {order.userInfo.fullName}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {order.userInfo.email}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default OrderDetail;
