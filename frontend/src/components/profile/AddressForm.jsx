import React from 'react';
import { Form, Input, Button, Checkbox } from 'antd';

const AddressForm = ({ initialValues, onFinish, onCancel, loading }) => {
  return (
    <Form initialValues={initialValues} onFinish={onFinish} layout="vertical">
      <Form.Item name="label" label="Address Label (e.g., Home, Work)" rules={[{ required: true }]}>
        <Input placeholder="Home"/>
      </Form.Item>
      <Form.Item name="fullAddress" label="Full Address" rules={[{ required: true }]}>
        <Input.TextArea rows={3} placeholder="123 Main St, Anytown, CA 90210"/>
      </Form.Item>
      <Form.Item name="contactNumber" label="Contact Number (Optional)">
        <Input placeholder="+1 555-123-4567"/>
      </Form.Item>
      <Form.Item name="isDefault" valuePropName="checked">
        <Checkbox>Set as default shipping address</Checkbox>
      </Form.Item>
      <div className="flex justify-end space-x-2">
        <Button onClick={onCancel}>Cancel</Button>
        <Button type="primary" htmlType="submit" loading={loading} className="bg-blue-500 hover:bg-blue-600">
          Save Address
        </Button>
      </div>
    </Form>
  );
};
export default AddressForm;
