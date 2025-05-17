import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  Select,
  DatePicker,
  Typography,
  Divider,
  Tabs,
  message,
} from "antd";
import {
  UserOutlined,
  ShoppingOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import axios from "axios";
import MetricCard from "../../../components/admin/dashboard/MetricCard";
import ProductPerformance from "../../../components/admin/dashboard/ProductPerformance";
import TimeSeriesChart from "../../../components/admin/dashboard/TimeSeriesChart";
import PieChartPerformance from "../../../components/admin/dashboard/PieChartPerformance";

const { Title, Text } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;

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
  const [categoryDistribution, setCategoryDistribution] = useState({});

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
      setAdvancedData(res.data.advancedStats);
      setCategoryDistribution(res.data.categoryDistribution);
    } catch (err) {
      message.error(err.response.data.message);
    }
  };

  useEffect(() => {
    getAllData();
    getAdvancedData();
  }, []);


  useEffect(() => {
    getAdvancedData();
  }, [timeInterval, dateRange]);

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Store Performance Dashboard</Title>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
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
                  <Col lg={12} md={24}>
                    <div className="text-center min-w-65 md:w-100%">
                      <Title level={1} style={{ color: "#1890ff" }}>
                        {advancedData && advancedData.length > 0
                          ? advancedData.reduce(
                              (sum, item) => sum + item.product,
                              0
                            )
                          : 0}
                      </Title>
                      <Text type="secondary">Total Products</Text>
                    </div>
                  </Col>
                  <Col lg={12} md={24}>
                    <div className="text-center min-w-65">
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
                  <Col lg={12} md={24}>
                    <div className="text-center min-w-65">
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
                  <Col lg={12} md={24}>
                    <div className="text-center min-w-65">
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

          <PieChartPerformance data={categoryDistribution} />
        </TabPane>
      </Tabs>
    </div>
  );
};
export default Dashboard;
