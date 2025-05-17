import { Routes, Route } from "react-router-dom";
// Admin pages
import DiscountCodeAdmin from "../pages/admin/discount/Discount";
import OrderAdmin from "../pages/admin/order/Order";
import CreateProduct from "../pages/admin/product/CreateProduct";
import ProductCatalog from "../pages/admin/product/ProductCatalog";
import ProductDetail from "../pages/admin/product/ProductDetail";
import EditProduct from "../pages/admin/product/ProductEdit";
import Register from "../pages/user/auth/Register";
import ManageUsers from "../pages/admin/user/ManageUser";
import AdminLayout from "../components/layout/AdminLayout";
import Dashboard from "../pages/admin/dashboard/Dashboard";

import "../App.css";
import LoginPage from "../pages/user/auth/LoginPage";
import ProfilePage from "../pages/user/auth/ProfilePage";
import HomePage from "../pages/user/HomePage";
import ProductCatalogPage from "../pages/user/products/ProductCatalogPage";
import ProductDetailPage from "../pages/user/products/ProductDetailPage";
import CartPage from "../pages/user/cart/CartPage";
import CheckoutPage from "../pages/user/checkout/CheckoutPage";
import MainLayout from "../components/layout/MainLayout";
import OrderPage from "../pages/user/order/OrderPage";
import SocialLoginSuccess from "../pages/user/auth/SocialLoginSuccess";
import RegisterPage from "../pages/user/auth/Register";
import ForgotPasswordPage from "../pages/user/auth/ForgotPasswordPage";
import ResetPasswordPage from "../pages/user/auth/ResetPasswordPage";
import AdminProfilePage from "../pages/admin/user/AdminProfilePage";
import ProtectedRoute from "../components/admin/ProtectedRoute";
import AccessDeniedPage from "../pages/AccessDeniedPage"; 
export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/access-denied" element={<AccessDeniedPage />} />

      {/* Admin layout */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly={true}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="discounts" element={<DiscountCodeAdmin />} />
        <Route path="orders" element={<OrderAdmin />} />
        <Route path="products" element={<ProductCatalog />} />
        <Route path="products/detail/:productId" element={<ProductDetail />} />
        <Route path="products/create" element={<CreateProduct />} />
        <Route path="products/edit/:id" element={<EditProduct />} />
        <Route path="users" element={<ManageUsers />} />
        <Route path="profile" element={<AdminProfilePage />} />
      </Route>

      {/* User layout */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="/products" element={<ProductCatalogPage />} />
        <Route path="/products/detail/:slug" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/myorder" element={<OrderPage />} />
        <Route path="/auth">
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="oauth-success" element={<SocialLoginSuccess />} />
          <Route path="reset-password" element={<ResetPasswordPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
