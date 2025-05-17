import React from "react";
import { Button, Result } from "antd";
import { useNavigate } from "react-router-dom";

export default function AccessDeniedPage() {
  const navigate = useNavigate();

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <Result
        status="403"
        title="403"
        subTitle="Bạn không đủ thẩm quyền để truy cập trang này."
        extra={
          <Button type="primary" onClick={() => navigate("/")}>
            Về trang chủ
          </Button>
        }
        className="bg-white p-6 rounded-lg shadow-lg"
      />
    </div>
  );
}
