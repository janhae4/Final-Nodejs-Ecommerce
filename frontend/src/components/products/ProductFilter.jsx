// src/components/products/ProductFilter.jsx
import React, { useState, useEffect } from 'react';
import { Form, Select, InputNumber, Button, Slider, Checkbox, Rate, Typography } from 'antd';
// import { fetchCategories, fetchBrands } from '../../services/productService'; // API calls

const { Option } = Select;
const { Title } = Typography;

const ProductFilter = ({ onFilterChange, initialFilters }) => {
  const [form] = Form.useForm();
  const [categories, setCategories] = useState([]); // [{id: 'cat1', name: 'Electronics'}]
  const [brands, setBrands] = useState([]); // [{id: 'brand1', name: 'Sony'}]
  
  // Dummy data - replace with API calls
  useEffect(() => {
    // Simulating API calls
    // fetchCategories().then(setCategories);
    // fetchBrands().then(setBrands);
    setCategories([
      { id: 'electronics', name: 'Electronics' },
      { id: 'books', name: 'Books' },
      { id: 'clothing', name: 'Clothing' },
    ]);
    setBrands([
      { id: 'sony', name: 'Sony' },
      { id: 'apple', name: 'Apple' },
      { id: 'samsung', name: 'Samsung' },
      { id: 'levi_s', name: 'Levi\'s' },
    ]);
  }, []);

  useEffect(() => {
    form.setFieldsValue(initialFilters);
  }, [initialFilters, form]);

  const handleFinish = (values) => {
    // AntD Slider for price range might return an array [min, max]
    const filtersToApply = {
      ...values,
      minPrice: values.priceRange ? values.priceRange[0] : undefined,
      maxPrice: values.priceRange ? values.priceRange[1] : undefined,
    };
    delete filtersToApply.priceRange; // Remove the combined field
    onFilterChange(filtersToApply);
  };

  const handleReset = () => {
    form.resetFields();
    onFilterChange({}); // Clear filters
  }

  return (
    <div className="p-4 bg-gray-50 rounded-lg shadow">
      <Title level={4} className="mb-4">Filter Products</Title>
      <Form form={form} layout="vertical" onFinish={handleFinish} initialValues={initialFilters}>
        <Form.Item name="category" label="Category">
          <Select placeholder="Select a category" allowClear>
            {categories.map(cat => <Option key={cat.id} value={cat.id}>{cat.name}</Option>)}
          </Select>
        </Form.Item>

        <Form.Item name="brand" label="Brand">
          <Select placeholder="Select a brand" mode="multiple" allowClear>
             {brands.map(brand => <Option key={brand.id} value={brand.id}>{brand.name}</Option>)}
          </Select>
        </Form.Item>

        <Form.Item label="Price Range">
          <Form.Item name="priceRange" noStyle>
            <Slider range defaultValue={[0, 1000]} max={5000} step={10} />
          </Form.Item>
          <div className="flex justify-between mt-1">
            <Form.Item name={["priceRange", 0]} noStyle>
                <InputNumber min={0} max={5000} step={10} style={{ width: '48%' }} formatter={value => `$ ${value}`} parser={value => value.replace(/\$\s?|(,*)/g, '')}/>
            </Form.Item>
            <Form.Item name={["priceRange", 1]} noStyle>
                <InputNumber min={0} max={5000} step={10} style={{ width: '48%' }} formatter={value => `$ ${value}`} parser={value => value.replace(/\$\s?|(,*)/g, '')}/>
            </Form.Item>
          </div>
        </Form.Item>
        
        <Form.Item name="rating" label="Minimum Rating">
          <Rate allowHalf allowClear />
        </Form.Item>

        {/* Add more filters like 'tags' if needed */}
        {/* <Form.Item name="tags" label="Tags">
          <Select mode="tags" placeholder="Enter tags" allowClear>
             Pre-populate with common tags or allow free text 
          </Select>
        </Form.Item> */}

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