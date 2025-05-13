import React, { useState } from "react";
import { Typography, Divider, message, Layout } from "antd";
import { Link, useNavigate } from "react-router-dom"; // Assuming React Router
import LoginForm from "../../../components/auth/LoginForm";
import SocialAuthButtons from "../../../components/auth/SocialAuthButton";
import axios from "axios";
// import { useAuth } from '../../../contexts/AuthContext'; // Your auth context

const { Title, Paragraph } = Typography;

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  // const { login } = useAuth(); // From your context
  const navigate = useNavigate();

  const handleLogin = async (values) => {
    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:3000/api/auth/login",
        {
          email: values.email,
          password: values.password,
        },
        {
          withCredentials: true, 
        }
      );
      const user = response.data.user;
      if (user.isBanned) {
        console.log("User is banned:", user.isBanned);
        alert("Tài khoản của bạn đã bị cấm.");
        setLoading(false);
        return; // Dừng xử lý nếu tài khoản bị cấm
      }
      localStorage.setItem("user", JSON.stringify(user));
      message.success("Đăng nhập thành công!");

      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Login error:", error); // Log chi tiết lỗi
      message.error("Đăng nhập thất bại. Vui lòng kiểm tra lại!");
    } finally {
      setLoading(false);
    }
  };



  const handleSocialLogin = (provider) => {
    console.log(`Login with ${provider}`);
    message.info(`Attempting login with ${provider}...`);
    window.location.href = `http://localhost:3000/api/auth/${provider}`;
  };

  return (
    <Layout
      style={{
        height: "100vh", // Chiều cao toàn màn hình
        display: "flex",
        justifyContent: "center", // Canh giữa theo chiều ngang
        alignItems: "center", // Canh giữa theo chiều dọc
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
