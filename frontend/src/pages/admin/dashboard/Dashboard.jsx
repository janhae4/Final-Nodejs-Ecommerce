import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  Select,
  DatePicker,
  Button,
  Typography,
  Divider,
  Tabs,
  message,
} from "antd";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  UserOutlined,
  ShoppingOutlined,
  DollarOutlined,
  RiseOutlined,
  FallOutlined,
  StarOutlined,
} from "@ant-design/icons";
import axios from "axios";

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

// ==================== COMPONENTS ====================

const MetricCard = ({ title, value, icon, change, changeType }) => (
  <Card>
    <Row align="middle" gutter={16}>
      <Col>
        <div style={{ fontSize: 24 }}>{icon}</div>
      </Col>
      <Col flex="auto">
        <Text type="secondary">{title}</Text>
        <Title level={3} style={{ margin: "8px 0" }}>
          {value}
        </Title>
        <Text type={changeType === "increase" ? "success" : "danger"}>
          {changeType === "increase" ? <RiseOutlined /> : <FallOutlined />}
          {change}%
        </Text>
      </Col>
    </Row>
  </Card>
);

const TimeSeriesChart = ({ data, interval }) => (
  <Card
    title={`Performance Trends (${interval})`}
    style={{ minHeight: "28rem" }}
  >
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="revenue" stroke="#1890ff" />
        <Line type="monotone" dataKey="profit" stroke="#52c41a" />
        <Line type="monotone" dataKey="product" stroke="#722ed1" />
      </LineChart>
    </ResponsiveContainer>
  </Card>
);

const ProductPerformance = ({ data }) => {
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  return (
    <Card title="Product Distribution">
      <Row gutter={16}>
        <Col span={24}>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data?.topProducts}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nameProduct" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="soldQuantity" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </Col>
      </Row>
    </Card>
  );
};

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("simple");
  const [timeInterval, setTimeInterval] = useState("annual");
  const [dateRange, setDateRange] = useState(null);
  const [simpleMetrics, setSimpleMetrics] = useState({
    totalUsers: 0,
    newUsers: 0,
    totalOrders: 0,
    revenue: 0,
    bestSellers: [],
  });
  const [advancedData, setAdvancedData] = useState({});

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    console.log("Advanced Data:", advancedData);
  }, [advancedData]);

  const getAllData = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/dashboard`, {
        withCredentials: true,
      });
      console.log(res.data.totalRevenue.totalAmount);
      setSimpleMetrics({
        totalUsers: res.data.totalUsers,
        newUsers: res.data.totalNewUsers,
        totalOrders: res.data.totalOrders,
        revenue: res.data.totalRevenue || 0,
        bestSellers: res.data.bestSellers,
      });
    } catch (err) {
      message.error(err.response.data.message);
    }
  };

  const getAdvancedData = async () => {
    try {
      const res = await axios.get(`${API_URL}/admin/dashboard/performance`, {
        params: {
          interval: timeInterval,
          dateRange: JSON.stringify(dateRange),
        },
        withCredentials: true,
      });
      console.log(res.data);
      setAdvancedData(res.data);
    } catch (err) {
      message.error(err.response.data.message);
    }
  };

  useEffect(() => {
    getAllData();
    getAdvancedData();
  }, []);

  // const advancedData = {
  //   annual: [
  //     { name: "2022", revenue: 120000, profit: 42000, orders: 1200 },
  //     { name: "2023", revenue: 180000, profit: 72000, orders: 1800 },
  //     { name: "2024", revenue: 250000, profit: 110000, orders: 2500 },
  //   ],
  //   quarterly: [
  //     { name: "Q1", revenue: 65000, profit: 28000, orders: 650 },
  //     { name: "Q2", revenue: 75000, profit: 34000, orders: 750 },
  //     { name: "Q3", revenue: 85000, profit: 41000, orders: 850 },
  //     { name: "Q4", revenue: 95000, profit: 47000, orders: 950 },
  //   ],
  //     categories: [
  //       { name: "Electronics", value: 45 },
  //       { name: "Clothing", value: 25 },
  //       { name: "Home Goods", value: 20 },
  //       { name: "Other", value: 10 },
  //     ],
  //   },
  // };

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Store Performance Dashboard</Title>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        {/* SIMPLE DASHBOARD */}
        <TabPane tab="Overview" key="simple">
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={12} md={6}>
              <MetricCard
                title="Total Users"
                value={simpleMetrics.totalUsers}
                icon={<UserOutlined />}
                change="12.5"
                changeType="increase"
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <MetricCard
                title="New Users"
                value={simpleMetrics.newUsers}
                icon={<UserOutlined />}
                change="8.3"
                changeType="increase"
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <MetricCard
                title="Total Orders"
                value={simpleMetrics.totalOrders}
                icon={<ShoppingOutlined />}
                change="15.2"
                changeType="increase"
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <MetricCard
                title="Revenue"
                value={`${simpleMetrics.revenue?.toLocaleString("vi-VN", {
                  style: "currency",
                  currency: "VND",
                })}`}
                icon={<DollarOutlined />}
                change="18.7"
                changeType="increase"
              />
            </Col>
          </Row>

          <ProductPerformance
            data={{
              topProducts: simpleMetrics.bestSellers,
              categories: [
                { name: "Electronics", value: 45 },
                { name: "Clothing", value: 25 },
                { name: "Home Goods", value: 20 },
                { name: "Other", value: 10 },
              ],
            }}
          />
        </TabPane>

        {/* ADVANCED DASHBOARD */}
        <TabPane tab="Advanced Analytics" key="advanced">
          <Row justify="space-between" style={{ marginBottom: 24 }}>
            <Col>
              <Select
                value={timeInterval}
                onChange={setTimeInterval}
                style={{ width: 150 }}
              >
                <Option value="annual">Annual</Option>
                <Option value="quarterly">Quarterly</Option>
                <Option value="monthly">Monthly</Option>
                <Option value="weekly">Weekly</Option>
              </Select>

              {timeInterval === "custom" && (
                <RangePicker
                  style={{ marginLeft: 16, width: 250 }}
                  onChange={setDateRange}
                />
              )}
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} lg={12}>
              <TimeSeriesChart
                data={advancedData}
                interval={
                  timeInterval === "annual"
                    ? "Yearly"
                    : timeInterval === "quarterly"
                    ? "Quarterly"
                    : timeInterval === "monthly"
                    ? "Monthly"
                    : "Weekly"
                }
              />
            </Col>
            <Col xs={24} lg={12}>
              <Card title="Key Metrics" style={{ minHeight: "28rem" }}>
                <Row gutter={16}>
                  <Col span={12}>
                    <div style={{ textAlign: "center" }}>
                      <Title level={1} style={{ color: "#1890ff" }}>
                        {advancedData && advancedData.length > 0
                          ? advancedData
                              .reduce((sum, item) => sum + item.product, 0)
                          : 0}
                      </Title>
                      <Text type="secondary">Total Products</Text>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div style={{ textAlign: "center" }}>
                      <Title level={1} style={{ color: "#52c41a" }}>
                        {advancedData && advancedData.length > 0
                          ? advancedData
                              .reduce((sum, item) => sum + item.revenue, 0)
                              .toLocaleString("vi-VN", {
                                style: "currency",
                                currency: "VND",
                              })
                          : 0}
                      </Title>
                      <Text type="secondary">Total Revenue</Text>
                    </div>
                  </Col>
                </Row>
                <Divider />
                <Row gutter={16}>
                  <Col span={12}>
                    <div style={{ textAlign: "center" }}>
                      <Title level={1} style={{ color: "#722ed1" }}>
                        {advancedData && advancedData.length > 0
                          ? advancedData
                              .reduce((sum, item) => sum + item.profit, 0)
                              .toLocaleString("vi-VN", {
                                style: "currency",
                                currency: "VND",
                              })
                          : 0}
                      </Title>
                      <Text type="secondary">Total Profit</Text>
                    </div>
                  </Col>
                  <Col span={12}>
                    <div style={{ textAlign: "center" }}>
                      <Title level={1} style={{ color: "#faad14" }}>
                        {(
                          (advancedData?.[advancedData?.length - 1]?.profit /
                            advancedData?.[advancedData?.length - 1]?.revenue) *
                          100
                        ).toFixed(1)}
                        %
                      </Title>
                      <Text type="secondary">Profit Margin</Text>
                    </div>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>

          <ProductPerformance data={advancedData} />
        </TabPane>
      </Tabs>
    </div>
  );
};

export default Dashboard;
