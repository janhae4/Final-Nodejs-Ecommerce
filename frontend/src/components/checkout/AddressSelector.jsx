import { useState } from "react";
import { Form, Select, Button, Col, Row, Space } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useAuth } from "../../context/AuthContext";

const { Option } = Select;

const AddressSelector = ({
  form,
  addresses,
  loading,
  onSelect,
  onEdit,
  onDelete,
}) => {
  const [editingAddress, setEditingAddress] = useState(null);
  const { userInfo } = useAuth();
  const handleEdit = (address) => {
    onEdit(address);
  };


  return (
    <Row gutter={[16, 16]} align="middle">
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
          >
            {addresses?.map((address) => (
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
                addresses.find((a) => a._id === form.getFieldValue("address"))
              )
            }
            icon={<EditOutlined />}
          />
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={() => onDelete(userInfo.id, form.getFieldValue("address"))}
          />
        </Space>
      </Col>
    </Row>
  );
};

export default AddressSelector;
