// src/components/auth/LoginForm.jsx
import React from 'react';
import { Form, Input, Button, Checkbox } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

const LoginForm = ({ onFinish, loading }) => {
  return (
    <Form name="login" onFinish={onFinish} layout="vertical" className="w-full max-w-md">
      <Form.Item
        name="email"
        label="Email"
        rules={[
          { required: true, message: 'Please input your email!' },
          { type: 'email', message: 'The input is not valid E-mail!' },
        ]}
      >
        <Input prefix={<MailOutlined className="site-form-item-icon" />} placeholder="Email" />
      </Form.Item>

      <Form.Item
        name="password"
        label="Password"
        rules={[{ required: true, message: 'Please input your password!' }]}
      >
        <Input.Password prefix={<LockOutlined className="site-form-item-icon" />} placeholder="Password" />
      </Form.Item>

      <Form.Item>
        <div className="flex justify-between items-center">
          <Form.Item name="remember" valuePropName="checked" noStyle>
            <Checkbox>Remember me</Checkbox>
          </Form.Item>
          <Link className="text-blue-500 hover:text-blue-700" to="/auth/forgot-password">
            Forgot password?
          </Link>
        </div>
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} block className="bg-blue-500 hover:bg-blue-600">
          Log In
        </Button>
      </Form.Item>
    </Form>
  );
};

export default LoginForm;