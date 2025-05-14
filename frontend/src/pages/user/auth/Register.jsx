import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext.jsx'; 

const Register = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login,setIsLoggedIn } = useAuth(); // <-- Lấy login & setIsLoggedIn từ context

  const handleRegister = async (values) => {
    setLoading(true);
    try {
      const response = await axios.post(
        'http://localhost:3000/api/auth/register',
        {
          fullName: values.fullName,
          email: values.email,
          shippingAddress: values.address,
        },
        { withCredentials: true }
      );
      const token = response.data.token;
      const userInfo = response.data.user; // Giả sử thông tin người dùng từ backend

      login(token, userInfo); // Lưu token và user vào cookie và localStorage

      setIsLoggedIn(true); // Đặt lại trạng thái đăng nhập

      message.success('Đăng ký thành công!');
      navigate('/'); // hoặc điều hướng sang /login
    } catch (error) {
      console.error(error.response?.data || error.message);
      message.error('Đăng ký thất bại. Vui lòng kiểm tra lại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '100px auto' }}>
      <h2>Đăng ký tài khoản</h2>
      <Form onFinish={handleRegister} layout="vertical">
        <Form.Item
          label="Họ và tên"
          name="fullName"
          rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Email"
          name="email"
          rules={[{ required: true, type: 'email', message: 'Vui lòng nhập email hợp lệ!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Địa chỉ giao hàng"
          name="address"
          rules={[{ required: true, message: 'Vui lòng nhập địa chỉ giao hàng!' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Đăng ký
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Register;
