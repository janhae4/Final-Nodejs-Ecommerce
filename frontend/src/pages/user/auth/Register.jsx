import React, { useState } from "react";
import {
  Typography,
  Divider,
  message,
  Layout,
  Form,
  Input,
  Button,
} from "antd";
import { Link, useNavigate } from "react-router-dom";
import SocialAuthButtons from "../../../components/auth/SocialAuthButton";
import axios from "axios";
import provinces from "hanhchinhvn/dist/tinh_tp.json";
import districts from "hanhchinhvn/dist/quan_huyen.json";
import wards from "hanhchinhvn/dist/xa_phuong.json";
import { useAuth } from "../../../context/AuthContext";
import RegisterForm from "../../../components/auth/RegisterForm";
const { Title, Paragraph } = Typography;

const RegisterPage = () => {
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();

  const handleRegister = async (values) => {
    setLoading(true);
    try {
      // Send registration request to backend
      await axios.post("http://localhost:3000/api/auth/register", values);
      messageApi.success(
        "Registration successful! Please check your email to verify your account."
      );

      setTimeout(() => {
        navigate("/auth/login");
      }, 3000);

    } catch (error) {
      console.error("Registration error:", error);
      messageApi.error(
        error.response.data.message || "Registration failed, please try again!"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSocialRegister = async (response) => {
    console.log(`Register with ${response}`);
    messageApi.info(`Attempting registration with ${response}...`);
    window.location.href = `http://localhost:3000/api/auth/${response}`;
  };

  return (
    <Layout className="flex items-center justify-center p-5 max-h-fit">
      {contextHolder}
      <div className="p-8 bg-white shadow-lg rounded-lg w-full max-w-xl ">
        <Title level={2} className="text-center">
          Create Account
        </Title>

        <RegisterForm
          onFinish={handleRegister}
          setLoading={setLoading}
          loading={loading}
        />

        <Divider>Or register with</Divider>
        <SocialAuthButtons
          onGoogleLogin={() => handleSocialRegister("google")}
          onFacebookLogin={() => handleSocialRegister("facebook")}
        />
        <Paragraph className="mt-6 text-center">
          Already have an account?{" "}
          <Link to="/auth/login" className="text-blue-500 hover:text-blue-700">
            Log in
          </Link>
        </Paragraph>
      </div>
    </Layout>
  );
};

export default RegisterPage;
