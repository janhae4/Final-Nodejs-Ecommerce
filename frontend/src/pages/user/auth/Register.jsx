import React, { useState } from "react";
import { Typography, Divider, message, Layout, Form, Input, Button } from "antd";
import { Link, useNavigate } from "react-router-dom";
import SocialAuthButtons from "../../../components/auth/SocialAuthButton";
import axios from "axios";
import provinces from "hanhchinhvn/dist/tinh_tp.json";
import districts from "hanhchinhvn/dist/quan_huyen.json";
import wards from "hanhchinhvn/dist/xa_phuong.json";
import { useAuth } from "../../../context/AuthContext";
const { Title, Paragraph } = Typography;

const RegisterPage = () => {
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (values) => {
    setLoading(true);
    try {
      // Send registration request to backend
      await axios.post('http://localhost:3000/api/auth/register', {
        fullName: values.fullName,
        email: values.email,
        shippingAddress: values.address
      });

      // Show success message
      message.success('Registration successful! Please log in.');

      // Redirect to login page after successful registration
      navigate('/auth/login');
    } catch (error) {
      console.error("Registration error:", error);
      message.error('Registration failed. Please check your information!');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialRegister = async (response) => {
    console.log(`Register with ${response}`);
    message.info(`Attempting registration with ${response}...`);
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
          Create Account
        </Title>
        
        <Form onFinish={handleRegister} layout="vertical">
          <Form.Item
            label="Full Name"
            name="fullName"
            rules={[{ required: true, message: 'Please enter your full name!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, type: 'email', message: 'Please enter a valid email!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Shipping Address"
            name="address"
            rules={[{ required: true, message: 'Please enter your shipping address!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              style={{ width: '100%' }}
            >
              Register
            </Button>
          </Form.Item>
        </Form>

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