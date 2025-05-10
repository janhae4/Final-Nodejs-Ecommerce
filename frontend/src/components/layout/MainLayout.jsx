import {
  Input,
  Button,
  Space,
  Badge,
  Dropdown,
  Menu,
  Avatar,
  Layout,
  Row,
  Col,
  Typography,
  Drawer,
  List,
  Divider,
  Spin,
} from "antd";
import { Footer, Header } from "antd/es/layout/layout";
import {
  DownOutlined,
  SearchOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  CloseOutlined,
  MenuOutlined,
  ShoppingOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import Title from "antd/es/skeleton/Title";
import debounce from "debounce";
import SearchResult from "./main/SearchResult";
import SearchResultRender from "./main/SearchResult";
import MobileSearchDrawer from "./main/MobileSearchDrawer";
const { Text } = Typography;

const MainLayout = () => {
  const cartItemCount = 0;
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  // Handle click outside search results to close
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const debounceSearch = useCallback(
    debounce((query) => {
      if (query.trim()) {
        setIsSearching(true);
        setTimeout(() => {
          setSearchResults([]);
          setShowSearchResults(true);
          setIsSearching(false);
        }, 500);
      } else {
        setShowSearchResults(false);
        setSearchResults([]);
      }
    }),
    []
  );

  useEffect(() => {
    debounceSearch(searchQuery);
    return () => {
      debounceSearch.clear();
    };
  }, [searchQuery, debounceSearch]);

  const handleLogin = () => {
    navigate("/auth/login");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/");
  };

  const userMenu = (
    <Menu>
      <Menu.Item key="profile">
        <UserOutlined /> My Profile
      </Menu.Item>
      <Menu.Item key="orders">
        <ShoppingOutlined /> My Orders
      </Menu.Item>
      <Menu.Item key="logout" danger onClick={handleLogout}>
        <LogoutOutlined /> Logout
      </Menu.Item>
    </Menu>
  );

  return (
    <Layout>
      <Header className="bg-white h-auto shadow-md sticky top-0 z-40 px-2 md:px-4 py-0">
        <div className="container mx-auto">
          <div className="flex justify-between items-center h-16">
            {/* Mobile menu button */}
            <div className="block md:hidden">
              <Button
                type="text"
                icon={<MenuOutlined className="text-xl" />}
                onClick={() => setMobileMenuOpen(true)}
              />
            </div>

            {/* Logo */}
            <div className="text-2xl font-bold text-blue-600">
              <Link to="/" className="hover:text-blue-700 transition-colors">
                SHOP
              </Link>
            </div>

            {/* Desktop Search */}
            <div
              className="hidden md:block relative flex-grow max-w-xl mx-4"
              ref={searchRef}
            >
              <Input
                size="large"
                placeholder="Tìm kiếm sản phẩm..."
                prefix={<SearchOutlined className="text-gray-400" />}
                className="rounded-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClick={() => searchQuery && setShowSearchResults(true)}
              />
              {showSearchResults && (
                <SearchResultRender
                  searchQuery={searchQuery}
                  searchResults={searchResults}
                  isSearching={isSearching}
                  setShowSearchResults={setShowSearchResults}
                />
              )}
            </div>

            {/* Mobile Search Icon */}
            <div className="block md:hidden">
              <Button
                type="text"
                icon={<SearchOutlined className="text-xl" />}
                onClick={() => setMobileSearchOpen(true)}
              />
            </div>

            {/* User Actions */}
            <Space size="middle">
              <Badge count={cartItemCount} size="small">
                <Button
                  type="text"
                  icon={
                    <ShoppingCartOutlined className="text-xl text-gray-700 hover:text-blue-600" />
                  }
                  onClick={() => navigate("/cart")}
                />
              </Badge>

              {isLoggedIn ? (
                <Dropdown menu={userMenu} trigger={["click"]}>
                  <a
                    onClick={(e) => e.preventDefault()}
                    className="flex items-center text-gray-700 hover:text-blue-600"
                  >
                    <Avatar
                      icon={<UserOutlined />}
                      size="small"
                      className="mr-2"
                    />
                    <span className="hidden sm:inline">Hi, User</span>{" "}
                    <DownOutlined className="ml-1" />
                  </a>
                </Dropdown>
              ) : (
                <Button
                  type="primary"
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={handleLogin}
                >
                  <span className="hidden sm:inline">Login</span>
                  <UserOutlined className="sm:hidden" />
                </Button>
              )}
            </Space>
          </div>
        </div>
      </Header>

      <MobileSearchDrawer
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        isSearching={isSearching}
        searchResults={searchResults}
        setShowSearchResults={setShowSearchResults}
        mobileSearchOpen={mobileSearchOpen}
        setMobileSearchOpen={setMobileSearchOpen}
      />

      <Outlet />

      <Footer className="bg-gray-800 text-gray-300 text-center py-8">
        <div className="container mx-auto">
          <Row gutter={[16, 32]}>
            <Col xs={24} md={8}>
              <Title level={4} className="!text-gray-100">
                Về LOGOSHOP
              </Title>
              <ul className="list-none p-0">
                <li>
                  <Link to="#" className="text-gray-400 hover:text-white">
                    Giới thiệu
                  </Link>
                </li>
                <li>
                  <Link to="#" className="text-gray-400 hover:text-white">
                    Tuyển dụng
                  </Link>
                </li>
                <li>
                  <Link to="#" className="text-gray-400 hover:text-white">
                    Liên hệ
                  </Link>
                </li>
              </ul>
            </Col>
            <Col xs={24} md={8}>
              <Title level={4} className="!text-gray-100">
                Hỗ Trợ Khách Hàng
              </Title>
              <ul className="list-none p-0">
                <li>
                  <Link to="#" className="text-gray-400 hover:text-white">
                    Chính sách bảo hành
                  </Link>
                </li>
                <li>
                  <Link to="#" className="text-gray-400 hover:text-white">
                    Chính sách đổi trả
                  </Link>
                </li>
                <li>
                  <Link to="#" className="text-gray-400 hover:text-white">
                    Hướng dẫn mua hàng
                  </Link>
                </li>
              </ul>
            </Col>
            <Col xs={24} md={8}>
              <Title level={4} className="!text-gray-100">
                Kết Nối Với Chúng Tôi
              </Title>
              {/* Add social media icons here */}
              <Text className="text-gray-400">
                Địa chỉ: 123 Đường ABC, Quận XYZ, TP. HCM
              </Text>
              <br />
              <Text className="text-gray-400">Email: support@logoshop.com</Text>
            </Col>
          </Row>
          <div className="mt-8 pt-8 border-t border-gray-700">
            SHOP ©{new Date().getFullYear()} - All Rights Reserved.
          </div>
        </div>
      </Footer>
    </Layout>
  );
};

export default MainLayout;
