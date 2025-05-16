import React from "react";
import { Form, Input, Button } from "antd";

const PasswordChangeForm = ({
  onFinish,
  loading,
  isDefaultPassword = false,
}) => {
  return (
    <Form onFinish={onFinish} layout="vertical">
      {!isDefaultPassword && (
        <Form.Item
          name="oldPassword"
          label="Old Password"
          rules={[{ required: true }]}
        >
          <Input.Password />
        </Form.Item>
      )}
      <Form.Item
        name="newPassword"
        label="New Password"
        rules={[{ required: true }]}
        hasFeedback
      >
        <Input.Password />
      </Form.Item>
      <Form.Item
        name="confirmNewPassword"
        label="Confirm New Password"
        dependencies={["newPassword"]}
        hasFeedback
        rules={[
          { required: true },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue("newPassword") === value) {
                return Promise.resolve();
              }
              return Promise.reject(
                new Error("The new passwords do not match!")
              );
            },
          }),
        ]}
      >
        <Input.Password />
      </Form.Item>
      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          loading={loading}
          className="bg-orange-500 hover:bg-orange-600"
        >
          Change Password
        </Button>
      </Form.Item>
    </Form>
  );
};
export default PasswordChangeForm;
