import { useEffect, useState } from "react";
import { Typography, Layout, Collapse, Tag, Divider, Button, Empty, Spin } from "antd";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import { Link } from "react-router-dom";
import OrderDetail from "../../../components/order/OrderDetail";

const { Title, Text } = Typography;
const { Panel } = Collapse;

const statusColors = {
  pending: "orange",
  confirmed: "blue",
  shipping: "purple",
  delivered: "green",
  cancelled: "red",
};

const statusLabels = {
  pending: "Pending",
  confirmed: "Confirmed",
  shipping: "Shipping",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const OrderPage = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const { userInfo, isLoggedIn } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeKeys, setActiveKeys] = useState({});

  useEffect(() => {
    const getOrders = async () => {
      try {
        if (!userInfo?.id) return;
        setLoading(true);
        console.log(userInfo);
        const response = await axios.get(
          `${API_URL}/orders/?userId=${userInfo.id}`
        );
        setOrders(response.data.orders || []);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };
    getOrders();
  }, [userInfo.id]);

  const toggleOrderDetails = (orderId) => {
    setActiveKeys(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  const groupOrdersByStatus = () => {
    const grouped = {};
    orders.forEach(order => {
      if (!grouped[order.status]) {
        grouped[order.status] = [];
      }
      grouped[order.status].push(order);
    });
    return grouped;
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString();
  const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto p-4 md:p-8 overflow-auto flex justify-center">
          <Spin size="large" />
        </div>
      </Layout>
    );
  }

  if (orders.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto p-4 md:p-8 overflow-auto">
          <Empty
            description={
              <span>
                You don't have any orders yet.{" "}
                <Link to="/products" className="text-blue-500 hover:text-blue-700">
                  Start Shopping
                </Link>
              </span>
            }
          />
        </div>
      </Layout>
    );
  }

  const groupedOrders = groupOrdersByStatus();

  return (
    <Layout>
      <div className="container mx-auto p-4 md:p-8 overflow-auto">
        <Title level={2} className="mb-6">My Orders</Title>

        {Object.entries(groupedOrders).map(([status, statusOrders]) => (
          <div key={status} className="mb-8">
            <Divider orientation="left">
              <Tag color={statusColors[status]} style={{ fontSize: '1rem', padding: '0.25rem 0.75rem' }}>
                {statusLabels[status]}
              </Tag>
            </Divider>

            <div className="space-y-4">
              {statusOrders.map(order => (
                <div key={order._id} className="bg-white rounded-lg  p-4">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <Text strong className="text-lg">Order #{order.orderCode}</Text>
                      <Text type="secondary" className="block">
                        {formatDate(order.purchaseDate)} • {order.products.length} items
                      </Text>
                    </div>
                    <Text strong className="text-lg">
                      {formatPrice(order.totalAmount)}
                    </Text>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex space-x-2">
                      {order.products.slice(0, 3).map((product, idx) => (
                        <div key={idx} className="text-sm">
                          {product.productName}
                          {idx < 2 && idx < order.products.length - 1 && ','}
                        </div>
                      ))}
                      {order.products.length > 3 && (
                        <Text type="secondary">+{order.products.length - 3} more</Text>
                      )}
                    </div>

                    <Button 
                      type="link" 
                      onClick={() => toggleOrderDetails(order._id)}
                    >
                      {activeKeys[order._id] ? 'Hide details' : 'View details'}
                    </Button>
                  </div>

                  {activeKeys[order._id] && (
                    <div className="mt-4 pt-4 border-t">
                      <OrderDetail order={order} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
};

export default OrderPage;