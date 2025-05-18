import React, { useState, useEffect } from "react";
import { Layout, Row, Col, Typography, Space, Input, Button, Spin } from "antd";
import ProductSection from "../../components/homepage/ProductSection";
import ProductCarousel from "../../components/homepage/ProductCarousel";
import {
  RocketOutlined,
  FireOutlined,
  LaptopOutlined,
  DesktopOutlined,
  HddOutlined,
  HomeOutlined,
  PercentageOutlined,
  ThunderboltFilled,
} from "@ant-design/icons";
import axios from "axios";
import { useCart } from "../../context/CartContext";
import { socket } from "../../context/SocketContext";
const { Content } = Layout;
const { Title, Text } = Typography;

const HomePage = () => {
  const { addItemToCart } = useCart();
  const [newProducts, setNewProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [laptops, setLaptops] = useState([]);
  const [monitors, setMonitors] = useState([]);
  const [hardDrives, setHardDrives] = useState([]);
  const [components, setComponents] = useState([]);
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL;

  const filterProducts = async (category) => {
    try {
      const urls = [
        `${API_URL}/products/filter?type=best_sellers`,
        `${API_URL}/products/filter?type=new_arrivals`,
        `${API_URL}/products/?category=Laptop&limit=4`,
        `${API_URL}/products/?category=Graphics+Card&limit=4`,
        `${API_URL}/products/?category=Hard+drive&limit=4`,
        `${API_URL}/products/?category=Network+Card&limit=4`,
      ];
      const responses = await Promise.all(urls.map((url) => axios.get(url)));
      setBestSellers(responses[0].data.products);
      setNewProducts(responses[1].data.products);
      setLaptops(responses[2].data.products);
      setMonitors(responses[3].data.products);
      setHardDrives(responses[4].data.products);
      setComponents(responses[5].data.products);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    filterProducts();
  }, [isConnected]);

  useEffect(() => {
    socket.on("connection", () => setIsConnected(true));
    socket.on("disconnect", () => setIsConnected(false));
    return () => {
      socket.off("connection", () => setIsConnected(true));
      socket.off("disconnect", () => setIsConnected(false));
    };
  }, []);

  if (!isConnected) {
    return (
      <Layout>
        <div className="flex flex-col justify-center items-center min-h-screen">
          <Title level={1}>Loading... Please wait!</Title>
          <Spin size="large" spinning={!isConnected}></Spin>
        </div>
      </Layout>
    )
  }

  return (
    <Content className="container mx-auto px-4 py-8">
      {/* Hero Carousel/Banner Section */}
      <ProductCarousel />

      {/* Promo Banners */}
      <Row gutter={[16, 16]} className="mb-12">
        <Col xs={24} md={12}>
          <div className="bg-gray-100 p-6 rounded-lg flex items-center h-full">
            <div className="mr-4 text-4xl text-brand-primary">
              <PercentageOutlined />
            </div>
            <div>
              <Title level={3} className="!mb-1">
                Special Offers
              </Title>
              <Text className="text-gray-600 text-lg">
                Limited-time deals on top products. Save big today!
              </Text>
            </div>
          </div>
        </Col>
        <Col xs={24} md={12}>
          <div className="bg-gray-100 p-6 rounded-lg flex items-center h-full">
            <div className="mr-4 text-4xl text-brand-primary">
              <ThunderboltFilled />
            </div>
            <div>
              <Title level={3} className="!mb-1">
                Free Shipping
              </Title>
              <Text className="text-gray-600 text-lg">
                On all orders over {Number(1000000).toLocaleString("vi-VN", {style: "currency", currency: "VND"})} 
              </Text>
            </div>
          </div>
        </Col>
      </Row>

      {/* Product Sections */}
      <ProductSection
        title="New Arrivals"
        products={newProducts}
        icon={<RocketOutlined />}
        description="Discover our latest tech products just added to the store"
        action={addItemToCart}
        isNew={true}
      />
      <ProductSection
        title="Best Sellers"
        products={bestSellers}
        icon={<FireOutlined />}
        description="Top-rated products loved by our customers"
        action={addItemToCart}
        isBestSeller={true}
      />
      <ProductSection
        title="Premium Laptops"
        products={laptops}
        icon={<LaptopOutlined />}
        description="Powerful laptops for work, gaming, and creativity"
        action={addItemToCart}
      />
      <ProductSection
        title="High-Quality Monitors"
        products={monitors}
        icon={<DesktopOutlined />}
        description="Crystal-clear displays for every need"
        action={addItemToCart}
      />
      <ProductSection
        title="Storage Solutions"
        products={hardDrives}
        icon={<HddOutlined />}
        description="SSDs, HDDs, and more for all your storage needs"
        action={addItemToCart}
      />
      <ProductSection
        title="PC Components"
        products={components}
        icon={<HomeOutlined />}
        description="Upgrade your rig with our premium components"
        action={addItemToCart}
      />

      {/* Newsletter Section */}
      <div className="bg-gray-100 rounded-lg p-8 text-center mt-12">
        <Title level={3} className="!mb-2">
          Stay Updated
        </Title>
        <Text className="text-gray-600 mb-6 block">
          Subscribe to our newsletter for the latest deals and product updates
        </Text>
        <Space.Compact className="w-full max-w-md mx-auto">
          <Input
            placeholder="Your email address"
            size="large"
            className="flex-grow"
          />
          <Button type="primary" size="large" className="bg-brand-primary">
            Subscribe
          </Button>
        </Space.Compact>
      </div>
    </Content>
  );
};

export default HomePage;
