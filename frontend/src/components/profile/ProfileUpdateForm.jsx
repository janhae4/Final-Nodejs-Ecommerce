import React from "react";
import { Form, Input, Button } from "antd";

const ProfileUpdateForm = ({ initialValues, onFinish, loading }) => {
  return (
    <Form
      initialValues={initialValues}
      onFinish={onFinish}
      layout="vertical"
      className="w-full max-w-lg"
    >
      <Form.Item name="fullName" label="Full Name" rules={[{ required: true }]}>
        <Input className="w-lg" />
      </Form.Item>
      <Form.Item
        name="email"
        label="Email"
        rules={[{ required: true, type: "email" }]}
      >
        <Input className="w-lg" />
      </Form.Item>
      <Button
        type="primary"
        htmlType="submit"
        loading={loading}
        className="bg-blue-500 hover:bg-blue-600 px-6 py-5"
      >
        Update Profile
      </Button>
    </Form>
  );
};
export default ProfileUpdateForm;
