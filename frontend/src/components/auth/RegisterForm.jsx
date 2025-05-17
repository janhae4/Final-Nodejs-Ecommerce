import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import provinces from "hanhchinhvn/dist/tinh_tp.json";
import districts from "hanhchinhvn/dist/quan_huyen.json";
import wards from "hanhchinhvn/dist/xa_phuong.json";
import { Form, Input, Button, Select, Col, Row } from "antd";

const RegisterForm = ({ onFinish, setLoading, loading }) => {
  const { userInfo } = useAuth();
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedWard, setSelectedWard] = useState(null);
  const [street, setStreet] = useState(null);
  const [form] = Form.useForm();

  const provinceList = Object.values(provinces);
  const districtList = Object.values(districts);
  const wardList = Object.values(wards);
  const filteredDistricts = selectedProvince
    ? districtList
        .filter((d) => d.parent_code === selectedProvince)
        .sort((a, b) => a.name.localeCompare(b.name))
    : [];

  const filteredWards = selectedDistrict
    ? wardList
        .filter((w) => w.parent_code === selectedDistrict)
        .sort((a, b) => a.code.localeCompare(b.code))
    : [];

  const handleSubmit = async () => {
    try {
      await form.validateFields();
      setLoading(true);

      const province = provinces[selectedProvince];
      const district = districts[selectedDistrict];
      const ward = wards[selectedWard];
      const fieldsValue = form.getFieldsValue();
      const fullAddress = {
        address: {
          street: street,
          ward: ward.name_with_type,
          wardCode: selectedWard,
          district: district.name_with_type,
          districtCode: selectedDistrict,
          province: province.name_with_type,
          provinceCode: selectedProvince,
          fullAddress: `${street}, ${ward.name_with_type}, ${district.name_with_type}, ${province.name_with_type}`,
          // _id: Date.now(),
        },
        userInfo: {
          userId: userInfo._id || userInfo.id,
          fullName: fieldsValue.fullName,
          email: fieldsValue.email,
        },
      };
      await onFinish(fullAddress);
      setLoading(false);
    } catch (error) {
      console.error("Error submitting address:", error);
      message.error("Failed to save address");
    }
  };

  return (
    <Form name="register" form={form} onFinish={onFinish} layout="vertical">
      <Form.Item
        name="fullName"
        label="Full Name"
        rules={[{ required: true, message: "Please input your full name!" }]}
      >
        <Input placeholder="John Doe" />
      </Form.Item>

      <Form.Item
        name="email"
        label="Email"
        rules={[
          { required: true, message: "Please input your email!" },
          { type: "email", message: "The input is not valid E-mail!" },
        ]}
      >
        <Input placeholder="you@example.com" />
      </Form.Item>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8} md={8}>
          <Form.Item
            name="province"
            label="Province"
            rules={[{ required: true, message: "Please select a province" }]}
          >
            <Select
              showSearch
              placeholder="Select a province"
              optionFilterProp="children"
              onChange={(value) => {
                setSelectedProvince(value);
                setSelectedDistrict(null);
                form.setFieldsValue({
                  district: null,
                  ward: null,
                });
              }}
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {provinceList.map((province) => (
                <Option key={province.code} value={province.code}>
                  {province.name_with_type}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>

        <Col xs={24} sm={8} md={8}>
          <Form.Item
            name="district"
            label="District"
            rules={[{ required: true, message: "Please select a district" }]}
          >
            <Select
              showSearch
              placeholder="Select a district"
              optionFilterProp="children"
              disabled={!selectedProvince}
              onChange={(value) => {
                setSelectedDistrict(value);
                // Sửa setFieldValue thành setFieldsValue
                form.setFieldsValue({ ward: null });
              }}
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {filteredDistricts.map((district) => (
                <Option key={district.code} value={district.code}>
                  {district.name_with_type}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>

        <Col xs={24} sm={8} md={8}>
          <Form.Item
            name="ward"
            label="Ward"
            rules={[{ required: true, message: "Please select a ward" }]}
          >
            <Select
              showSearch
              placeholder="Select a ward"
              optionFilterProp="children"
              disabled={!selectedDistrict}
              value={selectedWard}
              onChange={(value) => setSelectedWard(value)}
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {filteredWards.map((ward) => (
                <Option key={ward.code} value={ward.code}>
                  {ward.name_with_type}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>
      <Col xs={24} sm={24} md={24}>
        <Form.Item
          name="street"
          label="Address street"
          rules={[{ required: true, message: "Please enter your address" }]}
        >
          <Input
            type="text"
            value={street}
            onChange={(e) => {
              setStreet(e.target.value);
              form.setFieldsValue({ street: e.target.value });
            }}
            placeholder="Enter your full address"
          />
        </Form.Item>
      </Col>
      <Form.Item>
        <Button
          type="primary"
          onClick={handleSubmit}
          loading={loading}
          block
          className="bg-blue-500 hover:bg-blue-600"
        >
          Create Account
        </Button>
      </Form.Item>
    </Form>
  );
};

export default RegisterForm;
