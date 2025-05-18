import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Form,
    Input,
    Button,
    InputNumber,
    Upload,
    message as antdMessage,
    Space,
    Typography,
} from 'antd';
import { PlusOutlined, MinusCircleOutlined, UploadOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title } = Typography;

const CreateProduct = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [fileList, setFileList] = useState([]);
    const [submitting, setSubmitting] = useState(false);

    const handleUploadChange = ({ fileList: newFileList }) => {
        setFileList(newFileList);
    };

    const onFinish = async (values) => {
        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('nameProduct', values.nameProduct);
            formData.append('price', values.price);
            formData.append('brand', values.brand || '');
            formData.append('category', values.category || '');
            formData.append('shortDescription', values.shortDescription || '');
            formData.append('tags', values.tags || '');

            // Make sure variants are JSON strings
            formData.append('variants', JSON.stringify(values.variants || []));

            // Send each real image to FormData
            fileList.forEach((file) => {
                if (file.originFileObj) {
                    formData.append('images', file.originFileObj);
                }
            });

            const res = await axios.post('http://localhost:3000/api/products/create', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            antdMessage.success(res.data.message || 'Create a successful product!');
            form.resetFields();
            setFileList([]);
            navigate('/admin/products');
        } catch (error) {
            console.error(error);
            antdMessage.error(error.response?.data?.error || 'An error occurred. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
            <Title level={3}>Create New Product</Title>
            <Form form={form} layout="vertical" onFinish={onFinish}>
                <Form.Item label="Product name" name="nameProduct" rules={[{ required: true }]}>
                    <Input />
                </Form.Item>

                <Form.Item
                  label="Price"
                  name="price"
                  rules={[{ required: true, message: "Please enter a price" }]}
                >
                  <InputNumber
                    min={0}
                    style={{ width: "100%" }}
                    formatter={(value) =>
                      `${Number(value).toLocaleString("vi-VN")} ₫`
                    }
                    parser={(value) =>
                      value.replace(/[₫\s,.]/g, "")
                    }
                  />
                </Form.Item>


                <Form.Item label="Brand" name="brand">
                    <Input />
                </Form.Item>

                <Form.Item label="Category" name="category">
                    <Input />
                </Form.Item>

                <Form.Item label="Product Description" name="shortDescription">
                    <Input.TextArea rows={3} />
                </Form.Item>

                <Form.Item label="Tags (separated by commas)" name="tags">
                    <Input />
                </Form.Item>

                <Form.List name="variants">
                    {(fields, { add, remove }) => (
                        <>
                            <Title level={5}>Variants</Title>
                            {fields.map(({ key, name, ...restField }) => (
                                <Space key={key} align="baseline" style={{ display: 'flex', marginBottom: 8 }}>
                                    <Form.Item {...restField} name={[name, 'name']} rules={[{ required: true, message: 'Variant name?' }]}>
                                        <Input placeholder="Variant name" />
                                    </Form.Item>
                                    <Form.Item {...restField} name={[name, 'price']} rules={[{ required: true, message: 'Price?' }]}>
                                        <InputNumber placeholder="Price" min={0} />
                                    </Form.Item>
                                    <Form.Item {...restField} name={[name, 'inventory']} rules={[{ required: true, message: 'Inventory?' }]}>
                                        <InputNumber placeholder="Inventory" min={0} />
                                    </Form.Item>
                                    <MinusCircleOutlined onClick={() => remove(name)} />
                                </Space>
                            ))}
                            <Form.Item>
                                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                    Add variant
                                </Button>
                            </Form.Item>
                        </>
                    )}
                </Form.List>

                <Form.Item label="Product photos">
                    <Upload
                        multiple
                        beforeUpload={() => false}
                        onChange={handleUploadChange}
                        fileList={fileList}
                        listType="picture"
                    >
                        <Button icon={<UploadOutlined />}>Choose images</Button>
                    </Upload>
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={submitting}>
                        Create product
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default CreateProduct;
