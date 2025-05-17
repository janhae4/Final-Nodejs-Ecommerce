import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { userInfo, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>; // Chỉ hiển thị trong khi đang gọi API / lấy cookie
  }

  // Nếu chưa đăng nhập hoặc không phải admin → từ chối truy cập
  if (!userInfo || userInfo.role !== "admin") {
    return <Navigate to="/access-denied" replace />;
  }

  return children;
}
