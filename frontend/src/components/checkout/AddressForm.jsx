import React, { useEffect, useState } from "react";
import { Form, Select, Input, Col, Row, Button, message, Space } from "antd";
import provinces from "hanhchinhvn/dist/tinh_tp.json";
import districts from "hanhchinhvn/dist/quan_huyen.json";
import wards from "hanhchinhvn/dist/xa_phuong.json";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const { Option } = Select;

const AddressForm = ({
  initialValues = null,
  onSubmit,
  onCancel,
  isGuest = false,
  loadingAddresses,
  setLoadingAddresses = null,
  form,
}) => {
  const { userInfo } = useAuth();
  const addressForm = form || Form.useForm()[0];

  const [selectedProvince, setSelectedProvince] = useState(
    initialValues?.provinceCode || null
  );
  const [selectedDistrict, setSelectedDistrict] = useState(
    initialValues?.districtCode || null
  );
  const [selectedWard, setSelectedWard] = useState(
    initialValues?.wardCode || null
  );
  const [street, setStreet] = useState(initialValues?.street || "");

  const provinceList = Object.values(provinces);
  const districtList = Object.values(districts);
  const wardList = Object.values(wards);

  // Thiết lập giá trị ban đầu cho form nếu có initialValues
  useEffect(() => {
    if (initialValues) {
      addressForm.setFieldsValue({
        street: initialValues.street,
        province: initialValues.provinceCode,
        district: initialValues.districtCode,
        ward: initialValues.wardCode,
      });
    }
  }, [initialValues, addressForm]);

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
      setLoadingAddresses(true);

      const province = provinces[selectedProvince];
      const district = districts[selectedDistrict];
      const ward = wards[selectedWard];
      console.log(form.getFieldsValue());
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
          _id: initialValues?._id || Date.now(),
        },
        userInfo: {
          userId: userInfo._id || userInfo.id,
          fullName: fieldsValue.fullName,
          email: fieldsValue.email,
        }
      };
      console.log(123, fullAddress);
      await onSubmit(fullAddress);
    } catch (error) {
      console.error("Error submitting address:", error);
      message.error("Failed to save address");
    } finally {
      setLoadingAddresses(false);
    }
  };

  return (
    <Form form={addressForm}>
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
                addressForm.setFieldsValue({
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
                addressForm.setFieldsValue({ ward: null });
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
                // Cập nhật giá trị form
                addressForm.setFieldsValue({ street: e.target.value });
              }}
              placeholder="Enter your full address"
            />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item>
        <Space className="flex items-center mt-8">
          <Button type="primary" onClick={handleSubmit} loading={loadingAddresses}>
            {initialValues ? "Update Address" : "Save Address"}
          </Button>
          {onCancel && <Button onClick={onCancel}>Cancel</Button>}
        </Space>
      </Form.Item>
    </Form>
  );
};

export default AddressForm;
