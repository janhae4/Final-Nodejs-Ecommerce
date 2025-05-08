import { Routes, Route } from "react-router-dom";
// Admin pages
import DiscountCodeAdmin from "../pages/admin/discount/Discount";
import OrderAdmin from "../pages/admin/order/Order";
import CreateProduct from "../pages/admin/product/CreateProduct";
import ProductCatalog from "../pages/admin/product/ProductCatalog";
import ProductDetail from "../pages/admin/product/ProductDetail";
import EditProduct from "../pages/admin/product/ProductEdit";
import Login from "../pages/user/auth/Login";
import Register from "../pages/user/auth/Register";
import Home from "../pages/user/HomePage";
import Profile from "../pages/user/auth/Profile";
import ManageUsers from "../pages/admin/user/ManageUser";
import AdminLayout from "../pages/admin/AdminLayout";
import Dashboard from "../pages/admin/Dashboard";

import "../App.css";

export default function AppRoutes() {
  return (
    <Routes>
      {/* User layout */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/profile" element={<Profile />} />
      {/* Admin layout */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="discounts" element={<DiscountCodeAdmin />} />
        <Route path="orders" element={<OrderAdmin />} />
        <Route path="products" element={<ProductCatalog />} />
        <Route path="products/detail/:productId" element={<ProductDetail />} />
        <Route path="products/create" element={<CreateProduct />} />
        <Route path="products/edit/:id" element={<EditProduct />} />
        <Route path="users" element={<ManageUsers />} />
      </Route>
    </Routes>
  );
}
