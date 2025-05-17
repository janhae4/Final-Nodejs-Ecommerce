import React, { useState } from "react";
import { Form, Input, Button, message, Alert } from "antd";
import axios from "axios";

const ForgotPasswordForm = () => {
  const [loading, setLoading] = useState(false);
  const [infoMessage, setInfoMessage] = useState(null); // để lưu thông báo

  const onFinish = async ({ email }) => {
    setLoading(true);
    setInfoMessage(null); // reset trước khi gửi
    try {
      const response = await axios.post('http://localhost:3000/api/auth/forgot-password', { email });
      // hiện popup
      message.success(response.data.message || 'Check your email for reset link!');
      // hiện text trong form
      setInfoMessage({ type: "success", text: response.data.message || 'Check your email for reset link!' });
    } catch (error) {
      if (error.response?.data?.message) {
        message.error(error.response.data.message);
        setInfoMessage({ type: "error", text: error.response.data.message });
      } else {
        message.error('Something went wrong. Please try again.');
        setInfoMessage({ type: "error", text: 'Something went wrong. Please try again.' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form layout="vertical" onFinish={onFinish}>
      <Form.Item
        name="email"
        label="Email Address"
        rules={[
          { required: true, message: "Please input your email!" },
          { type: "email", message: "Please enter a valid email!" },
        ]}
      >
        <Input placeholder="example@domain.com" className="p-4" />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" block loading={loading}>
          Send Reset Link
        </Button>
      </Form.Item>

      {infoMessage && (
        <Alert
          message={infoMessage.text}
          type={infoMessage.type}
          showIcon
          style={{ marginTop: 16 }}
        />
      )}
    </Form>
  );
};

export default ForgotPasswordForm;
