import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Form,
    Input,
    InputNumber,
    Button,
    Space,
    message,
    Spin,
    Select,
    Upload,
    Typography,
} from 'antd';
import { MinusCircleOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Title } = Typography;

const EditProduct = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(true);
    const [fileList, setFileList] = useState([]);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`http://localhost:3000/api/products/${id}`);
                const product = res.data.product;

                // Load form fields
                form.setFieldsValue({
                    nameProduct: product.nameProduct,
                    brand: product.brand,
                    category: product.category,
                    price: product.price,
                    shortDescription: product.shortDescription,
                    variants: product.variants,
                    tags: product.tags,
                });

                // Convert image URLs to Upload format
                const initialImages = product.images || [];
                const formattedImages = initialImages.map((url, index) => ({
                    uid: String(-index - 1),
                    name: `image-${index}.jpg`,
                    status: 'done',
                    url,
                }));
                setFileList(formattedImages);
            } catch (err) {
                console.error(err);
                message.error('Unable to load product information');
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [id, form]);

    const handleChange = ({ fileList: newFileList }) => {
        setFileList(newFileList);
    };

    const handlePreview = async (file) => {
        let src = file.url;
        if (!src && file.originFileObj) {
            src = await new Promise(resolve => {
                const reader = new FileReader();
                reader.readAsDataURL(file.originFileObj);
                reader.onload = () => resolve(reader.result);
            });
        }
        const img = new Image();
        img.src = src;
        const imgWindow = window.open(src);
        imgWindow?.document.write(img.outerHTML);
    };

    const onFinish = async (values) => {
        try {
            const formData = new FormData();

            for (const key in values) {
                if (key !== 'variants' && key !== 'tags') {
                    formData.append(key, values[key]);
                }
            }

            (values.variants || []).forEach((variant, index) => {
                for (const key in variant) {
                    formData.append(`variants[${index}][${key}]`, variant[key]);
                }
            });

            (values.tags || []).forEach((tag) => {
                formData.append('tags[]', tag);
            });

            // Send old photos (keep)
            fileList.forEach(file => {
                if (file.url) {
                    formData.append('oldImages', file.url);
                }
            });

            // Send new photos (add)
            fileList.forEach(file => {
                if (!file.url && file.originFileObj) {
                    formData.append('images', file.originFileObj);
                }
            });

            await axios.patch(`http://localhost:3000/api/products/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            message.success('Product updated successful!');
            navigate('/admin/products');
        } catch (error) {
            console.error(error);
            message.error('Update failed!');
        }
    };


    if (loading) return <Spin tip="Loading..." style={{ marginTop: 100 }} />;

    return (
        <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
            <Title level={3}>Edit Product</Title>
            <Form form={form} layout="vertical" onFinish={onFinish}>
                <Form.Item
                    label="Product Name"
                    name="nameProduct"
                    rules={[{ required: true, message: 'Please enter product name!' }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Brand"
                    name="brand"
                    rules={[{ required: true, message: 'Please enter brand!' }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Category"
                    name="category"
                    rules={[{ required: true, message: 'Please enter category!' }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Price"
                    name="price"
                    rules={[{ required: true, message: 'Please enter price!' }]}
                >
                    <InputNumber
                        min={0}
                        style={{ width: '100%' }}
                        formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={(value) => value.replace(/(,*)/g, '')}
                    />
                </Form.Item>

                <Form.Item
                    label="Short Description"
                    name="shortDescription"
                    rules={[{ required: true, message: 'Please enter description!' }]}
                >
                    <TextArea rows={4} />
                </Form.Item>

                {/* Variants */}
                <Form.List name="variants">
                    {(fields, { add, remove }) => (
                        <>
                            <label><strong>Variants</strong></label>
                            {fields.map(({ key, name, ...restField }) => (
                                <Space key={key} align="baseline" style={{ display: 'flex', marginBottom: 8 }}>
                                    <Form.Item {...restField} name={[name, 'name']} rules={[{ required: true, message: 'Variant Name' }]}>
                                        <Input placeholder="Variant Name" />
                                    </Form.Item>
                                    <Form.Item {...restField} name={[name, 'price']} rules={[{ required: true, message: 'Price' }]}>
                                        <Input placeholder="Price" />
                                    </Form.Item>
                                    <Form.Item {...restField} name={[name, 'inventory']} rules={[{ required: true, message: 'Inventory' }]}>
                                        <InputNumber min={0} placeholder="Inventory" />
                                    </Form.Item>
                                    <MinusCircleOutlined onClick={() => remove(name)} />
                                </Space>
                            ))}
                            <Form.Item>
                                <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />}>
                                    Add variant
                                </Button>
                            </Form.Item>
                        </>
                    )}
                </Form.List>

                {/* Images */}
                <Form.Item label="Product Images">
                    <Upload
                        listType="picture-card"
                        fileList={fileList}
                        onPreview={handlePreview}
                        onChange={handleChange}
                        beforeUpload={() => false}
                    >
                        {fileList.length < 8 && '+ Upload images'}
                    </Upload>
                </Form.Item>

                {/* Tags */}
                <Form.Item name="tags" label="Tags (separated by comma)">
                    <Select mode="tags" placeholder="Nhập tags" style={{ width: '100%' }} />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit">
                        Save change
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default EditProduct;
