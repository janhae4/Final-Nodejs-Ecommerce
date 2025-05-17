import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Form, Input, Button, message, Typography, Spin } from "antd";
import { LockOutlined } from "@ant-design/icons";
import axios from "axios";

const { Title } = Typography;

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [loading, setLoading] = useState(false);
  const [isResetSuccess, setIsResetSuccess] = useState(false);
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const onFinish = async ({ password, confirmPassword }) => {
    if (password !== confirmPassword) {
      message.error("Passwords do not match!");
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        "http://localhost:3000/api/auth/reset-password",
        {
          token,
          password,
        }
      );
      message.success("Password reset successfully!");
      setIsResetSuccess(true);
      form.resetFields();

      setTimeout(() => {
        navigate("/auth/login");
      }, 3000);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Network error. Please check your connection.";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="max-w-md mx-auto mt-24 p-6 bg-white shadow-lg rounded-lg text-center">
        <Title level={4} className="text-red-600">
          Invalid or missing token
        </Title>
      </div>
    );
  }

  if (isResetSuccess) {
    return (
      <div className="max-w-md mx-auto mt-24 p-6 bg-white shadow-lg rounded-lg text-center">
        <Title level={3} className="text-green-600">
          Reset Successfully
        </Title>
        <p className="mt-4 text-gray-600">
          You will be redirected to the login page momentarily...
        </p>
        <Spin className="mt-4" />
      </div>
    );
  }

  return (
    <div className="w-2xl mb-20 mx-auto mt-24 p-10 bg-white shadow-lg rounded-lg">
      <Title level={3} className="text-center mb-6">
        Reset Password
      </Title>

      <Form
        form={form}
        name="reset_password"
        onFinish={onFinish}
        layout="vertical"
        autoComplete="off"
      >
        <Form.Item
          name="password"
          label="New Password"
          rules={[
            { required: true, message: "Please input your new password!" },
            { min: 6, message: "Password must be at least 6 characters!" },
          ]}
          hasFeedback
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="New password"
            className="p-4"
          />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label="Confirm New Password"
          dependencies={["password"]}
          hasFeedback
          rules={[
            { required: true, message: "Please confirm your new password!" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("password") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error("The two passwords do not match!")
                );
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Confirm new password"
            className="p-4"
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            block
            loading={loading}
            icon={loading ? <Spin indicator={<LockOutlined spin />} /> : null}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ResetPasswordPage;
