import React from 'react';
import { Form, Input, Button } from 'antd';

const ProfileUpdateForm = ({ initialValues, onFinish, loading }) => {
  return (
    <Form initialValues={initialValues} onFinish={onFinish} layout="vertical">
      <Form.Item name="fullName" label="Full Name" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
        <Input />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} className="bg-blue-500 hover:bg-blue-600">
          Update Profile
        </Button>
      </Form.Item>
    </Form>
  );
};
export default ProfileUpdateForm;