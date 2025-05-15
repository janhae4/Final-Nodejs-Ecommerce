import React, { useState, useEffect } from 'react';
import { Form, Select, InputNumber, Button, Slider, Rate, Typography, message } from 'antd';
import { fetchCategories, fetchBrands } from '../../services/productService'; 

const { Option } = Select;
const { Title } = Typography;

const ProductFilter = ({ onFilterChange, initialFilters }) => {
  const [form] = Form.useForm();
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  // Gọi API để lấy dữ liệu thật
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoryData, brandData] = await Promise.all([
          fetchCategories(),
          fetchBrands()
        ]);
        setCategories(categoryData);
        setBrands(brandData);
      } catch (err) {
        console.error(err);
        message.error('Failed to load filter data.');
      }
    };

    fetchData();
  }, []);

  // Thiết lập giá trị ban đầu (nếu có)
  useEffect(() => {
    form.setFieldsValue(initialFilters);
  }, [initialFilters, form]);

  const handleFinish = (values) => {
    const filtersToApply = {
      ...values,
      minPrice: values.priceRange?.[0],
      maxPrice: values.priceRange?.[1],
    };
    delete filtersToApply.priceRange;
    onFilterChange(filtersToApply);
  };

  const handleReset = () => {
    form.resetFields();
    onFilterChange({});
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg shadow">
      <Title level={4} className="mb-4">Filter Products</Title>
      <Form form={form} layout="vertical" onFinish={handleFinish} initialValues={initialFilters}>
        <Form.Item name="category" label="Category">
          <Select placeholder="Select a category" allowClear>
            {categories.map(cat => (
              <Option key={cat.id || cat._id} value={cat.id || cat._id}>
                {cat.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="brand" label="Brand">
          <Select placeholder="Select a brand" mode="multiple" allowClear>
            {brands.map(brand => (
              <Option key={brand.id || brand._id} value={brand.id || brand._id}>
                {brand.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Price Range">
          <Form.Item name="priceRange" noStyle>
            <Slider range max={50000000} step={100} />
          </Form.Item>
          <div className="flex justify-between mt-1">
            <Form.Item name={["priceRange", 0]} noStyle>
              <InputNumber min={0} max={50000000} step={100} style={{ width: '48%' }} formatter={v => `${v} VNĐ`} parser={v => v.replace(/\$\s?|(,*)/g, '')}/>
            </Form.Item>
            <Form.Item name={["priceRange", 1]} noStyle>
              <InputNumber min={0} max={50000000} step={100} style={{ width: '48%' }} formatter={v => `${v} VNĐ`} parser={v => v.replace(/\$\s?|(,*)/g, '')}/>
            </Form.Item>
          </div>
        </Form.Item>

        <Form.Item name="rating" label="Minimum Rating">
          <Rate allowHalf allowClear />
        </Form.Item>

        <div className="flex space-x-2 mt-6">
          <Button type="primary" htmlType="submit" className="bg-blue-500 hover:bg-blue-600 flex-1">
            Apply Filters
          </Button>
          <Button onClick={handleReset} className="flex-1">
            Reset Filters
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default ProductFilter;
