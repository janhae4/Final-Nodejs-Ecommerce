import React, { useState } from "react";
import { Form, Select, Button, Divider, Col, Row, Space } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import AddressForm from "./AddressForm";

const { Option } = Select;

const AddressSelector = ({
  form,
  addresses,
  loading,
  onSelect,
  onAddNew,
  onEdit,
  onDelete,
}) => {
  const [editingAddress, setEditingAddress] = useState(null);

  const handleEdit = (address) => {
    onEdit(address);
  };

  const handleCancelEdit = () => {
    setEditingAddress(null);
  };

  return (
    <>
      {editingAddress ? (
        <Col span={24} className="mb-4">
          <AddressForm
            initialValues={editingAddress}
            onCancel={handleCancelEdit}
            onSubmit={(values) => {
              onEdit(values);
              setEditingAddress(null);
            }}
          />
        </Col>
      ) : (
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <Form.Item
              name="address"
              label="Saved Addresses"
              rules={[{ required: true, message: "Please select an address" }]}
            >
              <Select
                showSearch
                placeholder="Select a saved address"
                onChange={onSelect}
                value={form.getFieldValue("address")}
                loading={loading}
                dropdownRender={(menu) => (
                  <>
                    {menu}
                    <Divider className="my-2" />
                    <div className="p-2 cursor-pointer" onClick={onAddNew}>
                      <Button type="link">+ Add new address</Button>
                    </div>
                  </>
                )}
              >
                {addresses.filter(Boolean).map((address) => (
                  <Option key={address._id} value={address._id}>
                    {address.fullAddress}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col flex="none">
            <Space>
              <Button
                onClick={() =>
                  handleEdit(
                    addresses.find(
                      (a) => a._id === form.getFieldValue("address")
                    )
                  )
                }
                icon={<EditOutlined />}
              />
              <Button
                icon={<DeleteOutlined />}
                danger
                onClick={() => onDelete(form.getFieldValue("address"))}
              />
            </Space>
          </Col>
        </Row>
      )}
    </>
  );
};

export default AddressSelector;
