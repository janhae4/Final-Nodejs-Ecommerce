import React, { useState, useEffect } from "react";
import { Layout, Row, Col, Typography, Space, Input, Button } from "antd";
import { useNavigate } from "react-router-dom";
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
import Cookies from "js-cookie";
import { useAuth } from "../../contexts/AuthContext";

const { Content } = Layout;
const { Title, Text } = Typography;

const HomePage = () => {
  const navigate = useNavigate();
  const [newProducts, setNewProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [laptops, setLaptops] = useState([]);
  const [monitors, setMonitors] = useState([]);
  const [hardDrives, setHardDrives] = useState([]);
  const [components, setComponents] = useState([]);
  const API_URL = import.meta.env.VITE_API_URL;
  const { setIsLoggedIn } = useAuth();  // Sử dụng setIsLoggedIn từ context

  useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");
  const user = params.get("user");

  if (token && user) {
    Cookies.set("token", token, { expires: 1 });
    Cookies.set("user", user, { expires: 1 });

    // Kiểm tra giá trị cookie vừa cài đặt
    console.log(Cookies.get("token")); // In ra để xác nhận token đã được lưu

    // Cập nhật trạng thái đăng nhập khi có token
    setIsLoggedIn(true);

    // Xóa query params khỏi URL
    window.history.replaceState({}, document.title, "/");

    // Điều hướng sau khi cập nhật trạng thái đăng nhập
    navigate("/dashboard");
  }



    // Lấy danh sách sản phẩm
    const filterProducts = async () => {
      try {
        const urls = [
          `${API_URL}/products/filter?type=best_sellers`,
          `${API_URL}/products/filter?type=new_arrivals`,
          `${API_URL}/products/searchByCategory?category=laptop&limit=5`,
          `${API_URL}/products/searchByCategory?category=monito&limit=5`,
          `${API_URL}/products/searchByCategory?category=hard_drive&limit=5`,
          `${API_URL}/products/searchByCategory?category=component&limit=5`,
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

    filterProducts();
  }, [setIsLoggedIn, API_URL, navigate]);  // Thêm setIsLoggedIn và API_URL vào dependencies

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
              <Title level={4} className="!mb-1">Special Offers</Title>
              <Text className="text-gray-600">Limited-time deals on top products. Save big today!</Text>
            </div>
          </div>
        </Col>
        <Col xs={24} md={12}>
          <div className="bg-gray-100 p-6 rounded-lg flex items-center h-full">
            <div className="mr-4 text-4xl text-brand-primary">
              <ThunderboltFilled />
            </div>
            <div>
              <Title level={4} className="!mb-1">Free Shipping</Title>
              <Text className="text-gray-600">On all orders over $500. No code needed.</Text>
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
      />
      <ProductSection
        title="Best Sellers"
        products={bestSellers}
        icon={<FireOutlined />}
        description="Top-rated products loved by our customers"
      />
      <ProductSection
        title="Premium Laptops"
        products={laptops}
        icon={<LaptopOutlined />}
        description="Powerful laptops for work, gaming, and creativity"
      />
      <ProductSection
        title="High-Quality Monitors"
        products={monitors}
        icon={<DesktopOutlined />}
        description="Crystal-clear displays for every need"
      />
      <ProductSection
        title="Storage Solutions"
        products={hardDrives}
        icon={<HddOutlined />}
        description="SSDs, HDDs, and more for all your storage needs"
      />
      <ProductSection
        title="PC Components"
        products={components}
        icon={<HomeOutlined />}
        description="Upgrade your rig with our premium components"
      />

      {/* Newsletter Section */}
      <div className="bg-gray-100 rounded-lg p-8 text-center mt-12">
        <Title level={3} className="!mb-2">Stay Updated</Title>
        <Text className="text-gray-600 mb-6 block">Subscribe to our newsletter for the latest deals and product updates</Text>
        <Space.Compact className="w-full max-w-md mx-auto">
          <Input placeholder="Your email address" size="large" className="flex-grow" />
          <Button type="primary" size="large" className="bg-brand-primary">Subscribe</Button>
        </Space.Compact>
      </div>
    </Content>
  );
};

export default HomePage;
