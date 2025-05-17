import React from "react";
import { Typography } from "antd";
import ForgotPasswordForm from "../../../components/auth/ForgotPasswordForm";

const { Title, Text } = Typography;

const ForgotPasswordPage = () => {
  return (
    <div className="w-lg mb-10 mx-auto mt-24 p-6 bg-white shadow-lg rounded-lg">
      <Title level={3} className="text-center mb-4">
        Forgot Password
      </Title>
      <Text type="secondary">
        Enter your email address below and we'll send you a link to reset your
        password.
      </Text>
      <div className="mt-6">
        <ForgotPasswordForm />
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
