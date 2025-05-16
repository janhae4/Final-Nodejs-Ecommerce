import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Form, Input, Button, message } from 'antd';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [loading, setLoading] = useState(false);

  const onFinish = async ({ password, confirmPassword }) => {
    if (password !== confirmPassword) {
      message.error('Passwords do not match!');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:3000/api/users/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (res.ok) {
        message.success('Password reset successfully!');
        // TODO: Redirect to login page nếu muốn
      } else {
        message.error(data.message || 'Reset password failed');
      }
    } catch (error) {
      message.error('Network error');
    }
    setLoading(false);
  };

  if (!token) {
    return <div>Invalid or missing token.</div>;
  }

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
