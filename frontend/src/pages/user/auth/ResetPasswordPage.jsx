import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Form, Input, Button, message } from 'antd';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [loading, setLoading] = useState(false);
  const [isResetSuccess, setIsResetSuccess] = useState(false); // Trạng thái để hiển thị thông báo thành công
  const navigate = useNavigate();

  const onFinish = async ({ password, confirmPassword }) => {
    if (password !== confirmPassword) {
      message.error('Passwords do not match!', 3);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setIsResetSuccess(true); // Đặt trạng thái để hiển thị "Reset thành công"
        setTimeout(() => {
          navigate('/auth/login'); // Redirect về trang đăng nhập sau 3 giây
        }, 3000);
      } else {
        message.error(data.message || 'Failed to reset password. Please try again.', 3);
      }
    } catch (error) {
      message.error('Network error. Please check your connection.', 3);
    }
    setLoading(false);
  };

  if (!token) {
    return <div>Invalid or missing token.</div>;
  }

  // Nếu reset thành công, hiển thị dòng chữ
  if (isResetSuccess) {
    return (
      <div className="max-w-md mx-auto mt-24 p-6 bg-white shadow-lg rounded-lg text-center">
        <h2 className="text-2xl font-bold text-green-600">Reset Successfully</h2>
        <p className="mt-4">You will be redirected to the login page momentarily...</p>
      </div>
    );
  }

  // Giao diện form reset password
  return (
    <div className="max-w-md mx-auto mt-24 p-6 bg-white shadow-lg rounded-lg">
      <h2>Reset Password</h2>
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="password"
          label="New Password"
          rules={[
            { required: true, message: 'Please input your new password!' },
            { min: 6, message: 'Password must be at least 6 characters.' },
          ]}
          hasFeedback
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label="Confirm New Password"
          dependencies={['password']}
          hasFeedback
          rules={[
            { required: true, message: 'Please confirm your new password!' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Passwords do not match!'));
              },
            }),
          ]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} block>
            Reset Password
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ResetPasswordPage;