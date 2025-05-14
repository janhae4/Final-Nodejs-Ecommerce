import React, { useEffect, useState } from "react";
import {
  Modal,
  Button,
  Typography,
  Table,
  Space,
  Divider,
  Row,
  Col,
  Descriptions,
  Tag,
  Card,
  Timeline,
} from "antd";
import {
  DollarOutlined,
  TagOutlined,
  CloseCircleOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import axios from "axios";
import RenderStatusHistory from "./RenderStatusHistory";

const { Text, Title } = Typography;

const ModalViewOrder = ({ isModalVisible, handleCancel, orderData }) => {
  const [discount, setDiscount] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL;
  const formatCurrency = (value) => {
    return `$${parseFloat(value).toFixed(2)}`;
  };

  const getStatusColor = (status) => {
    const statusColors = {
      pending: "orange",
      confirmed: "blue",
      shipping: "purple",
      delivered: "green",
      cancelled: "red",
    };

    return statusColors[status] || "default";
  };

  const getPaymentMethod = (paymentMethod) => {
    const paymentMethods = {
      cash: "Cash",
      credit_card: "Credit Card",
      paypal: "PayPal",
    };
    return paymentMethods[paymentMethod] || paymentMethod["cash"];
  }

  const calculateFinalTotal = () => {
    const subtotal = calculateTotal();
    if (!discount) return subtotal;

    if (discount.type === "fixed") {
      return Math.max(0, subtotal - discount.value);
    } else if (discount.type === "percentage") {
      return Math.max(0, subtotal * (1 - discount.value / 100));
    }

    return subtotal;
  };

  const calculateTotal = () => {
    if (
      !orderData ||
      !orderData.products ||
      !Array.isArray(orderData.products)
    ) {
      return 0;
    }

    return orderData.products.reduce(
      (sum, product) => sum + product.price * product.quantity,
      0
    );
  };

  useEffect(() => {
    const getDiscount = async () => {
      try {
        if (!orderData?.discountCode) {
          setDiscount(null);
          return;
        }
        const response = await axios.get(
          `${API_URL}/discount-codes/code/${orderData.discountCode}`
        );
        console.log(response.data);
        setDiscount(response.data || null);
      } catch (error) {
        console.error("Error fetching discount:", error);
      }
    };
    getDiscount();
  }, [orderData]);

  const columns = [
    {
      title: "Product",
      key: "product",
      render: (_, record) => (
        <div>
          <div className="break-words whitespace-normal max-w-[200px]">
            <strong>{record.productName}</strong>
          </div>
          <div>
            <small>ID: {record.productId}</small>
          </div>
        </div>
      ),
    },
    {
      title: "Variant",
      key: "variant",
      render: (_, record) => <Text>{record.variantName || "N/A"}</Text>,
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "Price",
      key: "price",
      render: (_, record) => <Text>{formatCurrency(record.price)}</Text>,
    },
    {
      title: "Subtotal",
      key: "subtotal",
      render: (_, record) => (
        <Text>{formatCurrency(record.price * record.quantity)}</Text>
      ),
    },
  ];

  return (
    <Modal
      title="Order Details"
      open={isModalVisible}
      onCancel={handleCancel}
      width={1000}
      styles={{
        body: {
          maxHeight: "calc(100vh - 200px)",
          overflowY: "auto",
          paddingRight: "8px",
          scrollbarWidth: "thin",
        },
      }}
      className="modal-with-internal-scroll"
      footer={[
        <Button
          key="close"
          onClick={handleCancel}
          icon={<CloseCircleOutlined />}
        >
          Close
        </Button>,
      ]}
      centered
    >
      {orderData && (
        <>
          <div className="order-header mb-4">
            <Row gutter={16} align="middle">
              <Col span={12}>
                <Title level={4} className="m-0">
                  Order #{orderData.orderCode}
                </Title>
              </Col>
              <Col span={12} className="text-right">
                <Tag
                  color={getStatusColor(orderData.status)}
                  className="text-base py-1 px-3"
                >
                  {orderData.status?.charAt(0).toUpperCase() +
                    orderData.status?.slice(1)}
                </Tag>
              </Col>
            </Row>
          </div>

          <Descriptions bordered column={{ xs: 1, sm: 2 }} className="mb-4">
            <Descriptions.Item label="User Name">
              {orderData.userInfo.fullName}
            </Descriptions.Item>
            <Descriptions.Item label="Purchase Date">
              {orderData.purchaseDate
                ? dayjs(orderData.purchaseDate).format("DD/MM/YYYY")
                : "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Payment Method">
              {getPaymentMethod(orderData.paymentMethod)}
            </Descriptions.Item>
            <Descriptions.Item label="Discount Code">
              {orderData.discountCode || "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Shipping Address" span={2}>
              {orderData.shippingAddress}
            </Descriptions.Item>
            <Descriptions.Item label="Loyalty Points Earned">
              {orderData.loyaltyPointsEarned || 0}
            </Descriptions.Item>
            <Descriptions.Item label="Loyalty Points Used">
              {orderData.loyaltyPointsUsed || 0}
            </Descriptions.Item>
          </Descriptions>

          <Row gutter={[16, 16]}>
            <Col xs={24} md={16}>
              <Divider orientation="left">Products</Divider>
              <Table
                columns={columns}
                dataSource={orderData.products || []}
                rowKey={(record) => record.productId + (record.variantId || "")}
                pagination={false}
                scroll={{ x: "max-content" }}
                size="small"
                footer={() => (
                  <div className="p-5 flex justify-end">
                    <Row
                      justify="space-between"
                      align="middle"
                      gutter={[16, 16]}
                    >
                      <div style={{ textAlign: "right" }}>
                        <Space
                          direction="vertical"
                          size="small"
                          style={{ width: "100%" }}
                        >
                          <div className="flex justify-between gap-3">
                            <Text>Subtotal: </Text>
                            <Text>{formatCurrency(calculateTotal())}</Text>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <Text>Discount:</Text>
                            <Text
                              style={{ color: discount ? "#52c41a" : "#999" }}
                            >
                              {discount
                                ? discount.type === "fixed"
                                  ? `- ${formatCurrency(discount.value)}`
                                  : `- ${discount.value || 0}%`
                                : "N/A"}
                            </Text>
                          </div>
                          <Divider style={{ margin: "8px 0" }} />
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <Text strong>Total: </Text>
                            <Text strong>
                              {formatCurrency(calculateFinalTotal())}
                            </Text>
                          </div>
                        </Space>
                      </div>
                    </Row>
                  </div>
                )}
              />
            </Col>

            <Col xs={24} md={8}>
            <RenderStatusHistory 
                statusHistory={orderData.statusHistory} 
                currentStatus={orderData.status}
                getStatusColor={getStatusColor}
              />
            </Col>
          </Row>
        </>
      )}
    </Modal>
  );
};

export default ModalViewOrder;
