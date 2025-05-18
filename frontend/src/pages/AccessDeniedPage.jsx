import React from "react";
import { Button, Result } from "antd";
import { useNavigate } from "react-router-dom";

export default function AccessDeniedPage({ code = 403 }) {
  const navigate = useNavigate();

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <Result
        status={code}
        title={code}
        subTitle={code === 403 ? "Forbidden" : "Not Found"}
        extra={
          <Button type="primary" onClick={() => navigate("/")}>
            Home
          </Button>
        }
        className="bg-white p-6 rounded-lg shadow-lg"
      />
    </div>
  );
}
