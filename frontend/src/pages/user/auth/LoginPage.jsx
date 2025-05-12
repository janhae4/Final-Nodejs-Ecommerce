// src/pages/LoginPage.jsx
import React, { useState } from "react";
import { Typography, Divider, message, Layout } from "antd";
import { Link, useNavigate } from "react-router-dom"; // Assuming React Router
import LoginForm from "../../../components/auth/LoginForm";
import SocialAuthButtons from "../../../components/auth/SocialAuthButton";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
const { Title, Paragraph } = Typography;

const LoginPage = () => {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  // const { login } = useAuth(); // From your context
  const navigate = useNavigate();

  const handleLogin = async (values) => {
    try {
      setLoading(true);
      await login(values);
    } catch (error) {
      console.error("Login error:", error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    // Implement social login logic
    console.log(`Login with ${provider}`);
    message.info(`Attempting login with ${provider}...`);
    // Example: window.location.href = `/api/auth/${provider}`;
  };

  return (
    <Layout>
      <div className="p-8 bg-white shadow-lg rounded-lg w-full max-w-md">
        <Title level={2} className="text-center mb-6">
          Welcome Back!
        </Title>
        <LoginForm onFinish={handleLogin} loading={loading} />
        <Divider>Or login with</Divider>
        <SocialAuthButtons
          onGoogleLogin={() => handleSocialLogin("google")}
          onFacebookLogin={() => handleSocialLogin("facebook")}
        />
        <Paragraph className="mt-6 text-center">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-500 hover:text-blue-700">
            Sign up
          </Link>
        </Paragraph>
      </div>
    </Layout>
  );
};

export default LoginPage;
