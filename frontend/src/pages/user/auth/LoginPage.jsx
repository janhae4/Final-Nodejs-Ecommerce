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

const handleSocialLogin = async (response) => {
  console.log(`Login with ${response}`);
  const { tokenId } = response;
  login(tokenId);
  message.info(`Attempting login with ${response}...`);

  if (response === 'google') {
    try {
      const res = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
          Authorization: `Bearer ${tokenId}`,
        },
      });
      console.log('User info from Google:', res.data);
    } catch (err) {
      console.error('Error fetching Google user info:', err);
    }
  }

  window.location.href = `http://localhost:3000/api/auth/${response}`;
};


  return (
    <Layout
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
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
          <Link to="/auth/register" className="text-blue-500 hover:text-blue-700">
            Sign up
          </Link>
        </Paragraph>
      </div>
    </Layout>
  );
};

export default LoginPage;
