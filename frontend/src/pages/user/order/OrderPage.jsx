import { useEffect, useState } from "react";
import { Typography, Layout, Tabs } from "antd";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import TabPane from "antd/es/tabs/TabPane";
import OrderDetail from "../../../components/order/OrderDetail";

const { Title } = Typography;

const OrderPage = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const { getUserInfo } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getOrders = async () => {
      try {
        setLoading(true);
        const userInfo = getUserInfo();
        console.log(userInfo);
        const response = await axios.get(
          `${API_URL}/orders/?userId=${userInfo._id}`
        );
        setOrders(response.data.orders || []);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };
    getOrders();
  }, []);

  return (
    <Layout>
      {loading ? (
        <div className="container mx-auto p-4 md:p-8 overflow-auto flex justify-center">
          <Spin size="large" />
        </div>
      ) : orders.length === 0 ? (
        <div className="container mx-auto p-4 md:p-8 overflow-auto">
          <Empty
            description={
              <span>
                You don't have any orders yet.{" "}
                <Link
                  to="/products"
                  className="text-blue-500 hover:text-blue-700"
                >
                  Start Shopping
                </Link>
              </span>
            }
          />
        </div>
      ) : (
        <div className="container mx-auto p-4 md:p-8 overflow-auto">
          <Title level={2} className="mb-6">
            My Orders
          </Title>

          <Tabs defaultActiveKey="0" type="card">
            {orders.map((order, index) => (
              <TabPane tab={`Order #${order.orderCode}`} key={index}>
                <OrderDetail order={order} />
              </TabPane>
            ))}
          </Tabs>
        </div>
      )}
    </Layout>
  );
};

export default OrderPage;
