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
  ShopOutlined,
  CreditCardOutlined,
} from "@ant-design/icons";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { data, Link, Outlet, useNavigate } from "react-router-dom";
import Title from "antd/es/skeleton/Title";
import debounce from "debounce";
import SearchResult from "./main/SearchResult";
import SearchResultRender from "./main/SearchResult";
import MobileSearchDrawer from "./main/MobileSearchDrawer";
import axios from "axios";
import { useCart } from "../../context/CartContext";
import AIChatbot from "./main/AIChatbotComponent";
import Cookies from "js-cookie";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext"; 

const { Text } = Typography;

const MainLayout = () => {
  const { cartItemCount } = useCart();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const { isLoggedIn, login, logout } = useAuth();
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [open, setOpen] = useState(true);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;
  const location = useLocation();
  
  useEffect(() => {
  const params = new URLSearchParams(location.search);
  const token = params.get("token");

  if (token) {
    login(token); // Gọi login() từ AuthContext
    // ✅ Xoá token khỏi URL sau khi xử lý
    params.delete("token");
    params.delete("user");
    const newSearch = params.toString();
    navigate(location.pathname + (newSearch ? `?${newSearch}` : ""), { replace: true });
  }
}, [location, login, navigate]);


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

  const getSearchResults = async (query) => {
    try {
      const res = await axios.get(`${API_URL}/products/?nameProduct=${query}`);
      console.log(res.data);
      setSearchResults(res.data.products);
    } catch (err) {
      console.error(err);
    }
  };

  const debounceSearch = useCallback(
    debounce(async (query) => {
      if (query.trim()) {
        await getSearchResults(query);
        setIsSearching(true);
        setShowSearchResults(true);
        setIsSearching(false);
      } else {
        setShowSearchResults(false);
        setSearchResults([]);
      }
    }, 500),
    []
  );

  useEffect(() => {
    debounceSearch(searchQuery);
    return () => {
      debounceSearch.clear();
    };
  }, [searchQuery, debounceSearch]);

  const handleLogin = () => {
    login();
    navigate("/auth/login");
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const userMenu = [
    {
      key: "1",
      label: <Link to="/auth/profile">My profile</Link>,
      icon: <UserOutlined />,
    },
    {
      key: "2",
      label: <Link to="/auth/order">My order</Link>,
      icon: <ShoppingCartOutlined />,
    },
    {
      key: "3",
      label: (
        <Link to="/" onClick={handleLogout}>
          Logout
        </Link>
      ),
      icon: <LogoutOutlined />,
      danger: true,
    },
  ];

  return (
    <Layout>
      <Header className="bg-white h-auto shadow-md sticky top-0 z-40 px-2 md:px-4 py-0">
        <div className="container mx-auto">
          <div className="flex justify-between items-center h-16">
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

            <Space size="middle">
              <div className="block md:hidden">
                <Button
                  type="text"
                  icon={<SearchOutlined className="text-xl" />}
                  onClick={() => setMobileSearchOpen(true)}
                />
              </div>
              <Link to="/products" className="h-full">
                <div className="flex text-black items-center gap-2 hover:bg-gray-200 rounded-md p-2">
                  <ShopOutlined className="text-lg" />
                  <Text className="hidden md:inline" strong>
                    Products
                  </Text>
                </div>
              </Link>

              <Link to="/myorder">
                <div className="flex text-black items-center gap-2 hover:bg-gray-200 rounded-md p-2">
                  <CreditCardOutlined className="text-lg" />
                  <Text className="hidden md:inline" strong>
                    My Order
                  </Text>
                </div>
              </Link>

              <Link to="/cart">
                <div className="flex text-black items-center p-2 gap-2 hover:bg-gray-200 rounded-md">
                  <Badge count={cartItemCount} size="small" offset={[-3, 3]}>
                    <ShoppingCartOutlined className="text-lg" />
                  </Badge>
                  <Text className="hidden md:inline" strong>
                    Cart
                  </Text>
                </div>
              </Link>

              {isLoggedIn ? (
                <Dropdown menu={{ items: userMenu }}>
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

      <AIChatbot />
    </Layout>
  );
};

export default MainLayout;
