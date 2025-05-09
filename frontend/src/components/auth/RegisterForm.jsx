// src/components/auth/RegisterForm.jsx
import React from 'react';
import { Form, Input, Button } from 'antd';

const RegisterForm = ({ onFinish, loading }) => {
  return (
    <Form name="register" onFinish={onFinish} layout="vertical" className="w-full max-w-md">
      <Form.Item
        name="fullName"
        label="Full Name"
        rules={[{ required: true, message: 'Please input your full name!' }]}
      >
        <Input placeholder="John Doe" />
      </Form.Item>

      <Form.Item
        name="email"
        label="Email"
        rules={[
          { required: true, message: 'Please input your email!' },
          { type: 'email', message: 'The input is not valid E-mail!' },
        ]}
      >
        <Input placeholder="you@example.com" />
      </Form.Item>

      <Form.Item
        name="shippingAddress"
        label="Default Shipping Address"
        rules={[{ required: true, message: 'Please input your shipping address!' }]}
      >
        <Input.TextArea rows={3} placeholder="123 Main St, Anytown, USA" />
      </Form.Item>
      
      {/* Password will be set via recovery or social login initially, or add password fields if needed */}
      {/* For simplicity, initial password might be auto-generated and sent via email,
           or user sets it after first social login / email confirmation.
           If direct password creation:
      <Form.Item
        name="password"
        label="Password"
        rules={[{ required: true, message: 'Please input your password!' }]}
        hasFeedback
      >
        <Input.Password />
      </Form.Item>

      <Form.Item
        name="confirm"
        label="Confirm Password"
        dependencies={['password']}
        hasFeedback
        rules={[
          { required: true, message: 'Please confirm your password!' },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('password') === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error('The two passwords that you entered do not match!'));
            },
          }),
        ]}
      >
        <Input.Password />
      </Form.Item>
      */}


      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} block className="bg-blue-500 hover:bg-blue-600">
          Create Account
        </Button>
      </Form.Item>
    </Form>
  );
};

export default RegisterForm;