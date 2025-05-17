import React, { useState, useEffect } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Layout,
  Menu,
  Avatar,
  Dropdown,
  Typography,
  Button,
  Drawer,
  Input,
  Space,
  theme,
} from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  DashboardOutlined,
  TagOutlined,
  UserOutlined,
  ShoppingCartOutlined,
  LogoutOutlined,
  SearchOutlined,
  ShopOutlined,
} from "@ant-design/icons";

const { Header, Sider, Content, Footer } = Layout;
const {  Text } = Typography;

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerVisible, setMobileDrawerVisible] = useState(false);
  const [breadcrumbItems, setBreadcrumbItems] = useState(["Dashboard"]);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const location = useLocation();
  const navigate = useNavigate();


  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth > 768) {
        setMobileDrawerVisible(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Update breadcrumb based on location
  useEffect(() => {
    const pathSnippets = location.pathname.split("/").filter((i) => i);
    const breadcrumbArray = ["Dashboard"];

    pathSnippets.forEach((snippet, index) => {
      if (snippet !== "admin") {
        breadcrumbArray.push(
          snippet.charAt(0).toUpperCase() + snippet.slice(1)
        );
      }
    });

    setBreadcrumbItems(breadcrumbArray);
  }, [location]);

  // User menu dropdown items
  const userMenuItems = [
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Logout",
      danger: true,
    },
  ];

  // Side menu items
  const menuItems = [
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: "Dashboard",
      path: "/admin/",
    },
    {
      key: "discount",
      icon: <TagOutlined />,
      label: "Discount Codes",
      path: "/admin/discounts",
    },
    {
      key: "users",
      icon: <UserOutlined />,
      label: "User",
      path: "/admin/users",
    },
    {
      key: "products",
      icon: <ShopOutlined />,
      label: "Products",
      path: "/admin/products",
    },
    {
      key: "orders",
      icon: <ShoppingCartOutlined />,
      label: "Orders",
      path: "/admin/orders",
    },
  ];

  // Handle menu item click
  const handleMenuClick = ({ key }) => {
    const menuItem = findMenuItemByKey(key, menuItems);
    if (menuItem && menuItem.path) {
      navigate(menuItem.path);
      if (windowWidth <= 768) {
        setMobileDrawerVisible(false);
      }
    }
  };

  // Helper function to find menu item by key
  const findMenuItemByKey = (key, items) => {
    for (const item of items) {
      if (item.key === key) return item;
      if (item.children) {
        const found = findMenuItemByKey(key, item.children);
        if (found) return found;
      }
    }
    return null;
  };

  // Get current selected menu keys
  const getSelectedKeys = () => {
    const path = location.pathname;

    for (const item of menuItems) {
      if (item.path === path) return [item.key];
      if (item.children) {
        for (const child of item.children) {
          if (child.path === path) return [item.key, child.key];
        }
      }
    }

    // Default to dashboard if no match found
    return ["dashboard"];
  };

  // Handle user dropdown menu
  const { logout } = useAuth();

  const handleUserMenuClick = ({ key }) => {
    if (key === "logout") {
      logout(); // Reset trạng thái và xóa phiên
      navigate("/"); // Chuyển về trang đăng nhập
    } else if (key === "profile") {
      navigate("/admin/profile");
    } else if (key === "settings") {
      navigate("/admin/settings");
    }
  };

  return (
    <Layout className="min-h-screen">
      {/* Sidebar for desktop */}
      {windowWidth > 768 && (
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          width={250}
          className="overflow-auto h-screen fixed left-0 top-0 z-20 bg-white border-r border-gray-200"
          theme="light"
          style={{
            position: "fixed",
            height: "100vh",
            overflowY: "auto",
          }}
        >
          <div className="h-16 flex items-center justify-center p-4 border-b border-gray-100 sticky top-0 bg-white z-10">
            <Link to="/admin/" className="flex items-center">
              <div className="flex-shrink-0 text-xl font-bold text-blue-600">
                {collapsed ? "AD" : "Admin Panel"}
              </div>
            </Link>
          </div>
          <Menu
            mode="inline"
            selectedKeys={getSelectedKeys()}
            defaultOpenKeys={["catalog", "marketing", "content"]}
            style={{ borderRight: 0 }}
            items={menuItems}
            onClick={handleMenuClick}
            className="mt-2"
          />
        </Sider>
      )}
      <Layout
        className={`transition-all duration-300 ${
          windowWidth > 768 ? (collapsed ? "ml-[80px]" : "ml-[250px]") : "ml-0"
        }`}
        style={{
          marginLeft: windowWidth > 768 ? (collapsed ? 80 : 250) : 0,
          transition: "margin-left 0.2s",
        }}
      >
        <Layout className={`transition-all duration-300`}>
          {/* Header */}
          <Header className="p-0 bg-white shadow-sm flex items-center justify-between h-16 sticky top-0 z-10">
            <div className="flex items-center h-full">
              {windowWidth > 768 ? (
                <Button
                  type="text"
                  icon={
                    collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />
                  }
                  onClick={() => setCollapsed(!collapsed)}
                  className="w-16 h-16 flex items-center justify-center"
                  style={{ color: "black", fontSize: "1.2rem" }}
                />
              ) : (
                <Button
                  type="text"
                  icon={<MenuUnfoldOutlined />}
                  onClick={() => setMobileDrawerVisible(true)}
                  className="w-16 h-16 flex items-center justify-center"
                  style={{ color: "black", fontSize: "1.2rem" }}
                />
              )}
              <div className="block md:hidden">
                <Text strong className="text-lg">
                  Admin Panel
                </Text>
              </div>
            </div>

            <div className="flex items-center mr-4 space-x-4">
              <div className="max-w-3xl hidden sm:block">
                <Input
                  prefix={<SearchOutlined className="text-gray-400" />}
                  placeholder="Search..."
                  className="rounded-full border-gray-200"
                />
              </div>
              <div>
                <Dropdown
                  menu={{
                    items: userMenuItems,
                    onClick: handleUserMenuClick,
                  }}
                  trigger={["click"]}
                  placement="bottomRight"
                >
                  <Space className="cursor-pointer">
                    <Avatar icon={<UserOutlined />} className="bg-blue-500" />
                    <Text
                      className="hidden md:inline-block"
                      style={{ color: "white", fontWeight: "bold" }}
                    >
                      Admin User
                    </Text>
                  </Space>
                </Dropdown>
              </div>
            </div>
          </Header>

          {/* Mobile drawer for sidebar */}
          <Drawer
            title="Admin Panel"
            placement="left"
            onClose={() => setMobileDrawerVisible(false)}
            open={mobileDrawerVisible}
            width={280}
            className="block md:hidden"
            bodyStyle={{ padding: 0 }}
          >
            <Menu
              mode="inline"
              selectedKeys={getSelectedKeys()}
              defaultOpenKeys={["catalog", "marketing", "content"]}
              items={menuItems}
              onClick={handleMenuClick}
            />
          </Drawer>

          {/* Main content */}
          <Content className="p-4 md:p-6 min-h-[calc(100vh-130px)]">
            <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm min-h-[calc(100vh-200px)]">
              <Outlet />
            </div>
          </Content>

          {/* Footer */}
          <Footer className="text-center bg-white border-t border-gray-200 py-4">
            Admin Panel ©{new Date().getFullYear()} Created by Your Company
          </Footer>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
