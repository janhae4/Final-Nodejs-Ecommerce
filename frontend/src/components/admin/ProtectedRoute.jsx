import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute({ adminOnly = false, children }) {
  const { userInfo, isLoading } = useAuth();
    console.log(userInfo.data)
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!userInfo) {
    // Chưa đăng nhập → về trang chủ
    return <Navigate to="/access-denied" replace />;
  }

  if (adminOnly && userInfo.role !== "admin") {
    // Đã đăng nhập nhưng không phải admin → chuyển đến trang báo lỗi quyền truy cập
    return <Navigate to="/access-denied" replace />;
  }

  return children;
}
