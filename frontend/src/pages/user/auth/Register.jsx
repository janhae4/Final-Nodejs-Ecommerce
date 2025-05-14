import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Hàm xử lý khi người dùng submit form đăng ký
  const handleRegister = async (values) => {
    setLoading(true);
    try {
      // Gửi yêu cầu đăng ký đến backend
      const response = await axios.post('http://localhost:3000/api/auth/register', {
        fullName: values.fullName,
        email: values.email,
        shippingAddress: values.address
      });

      // Hiển thị thông báo thành công
      message.success('Đăng ký thành công! Vui lòng đăng nhập.');

      // Chuyển hướng đến trang đăng nhập sau khi đăng ký thành công
      navigate('/');
    } catch (error) {
      // Nếu có lỗi xảy ra
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
