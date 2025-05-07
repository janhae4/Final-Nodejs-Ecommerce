import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Card, Image, Select, Rate, List, Divider, Tag, Spin, message } from 'antd';
import { Button } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;

const ProductDetail = () => {
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [previewVisible, setPreviewVisible] = useState(false);
    const navigate = useNavigate();

    const handleDelete = async () => {
        try {
            await axios.delete(`http://localhost:3000/api/products/${productId}`);
            message.success('Product deleted successfully!');
            navigate('/admin/products');
        } catch (error) {
            console.error('Error deleting product:', error);
            message.error('Failed to delete product!');
        }
    };

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`http://localhost:3000/api/products/${productId}`);
                setProduct(res.data.product);
                setSelectedVariant(res.data.product.variants[0]?._id);
            } catch (error) {
                console.error('Error loading product:', error);
                message.error('Cannot load product!');
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [productId]);

    if (loading) return <Spin tip="Loading..." style={{ marginTop: 100 }} />;
    if (!product) return <div>No products found.</div>;

    const avgRating = product.comments?.length
        ? product.comments.reduce((acc, c) => acc + c.rating, 0) / product.comments.length
        : 0;

    const totalStock = product.variants?.reduce((acc, v) => acc + v.inventory, 0);

    return (
        <div style={{ padding: 20 }}>
            <Card title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{product.nameProduct}</span>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <Button type="primary" onClick={() => navigate(`/admin/products/edit/${productId}`)}>
                            Edit Product
                        </Button>
                        <Button danger onClick={handleDelete}>
                            Delete Product
                        </Button>
                    </div>
                </div>
            }>
                <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', maxWidth: 400 }}>
                        {product.images.length > 0 ? (
                            <>
                                {/* Main image*/}
                                <Image
                                    src={product.images[selectedImageIndex]}
                                    width={300}
                                    height={300}
                                    style={{ objectFit: 'contain', marginBottom: 16, cursor: 'pointer' }}
                                    alt={`main-${selectedImageIndex}`}
                                    preview={false}
                                    onClick={() => setPreviewVisible(true)} // click image, open preview
                                />

                                {/* Image preview group (hidden) */}
                                <Image.PreviewGroup
                                    preview={{
                                        visible: previewVisible,
                                        onVisibleChange: (vis) => setPreviewVisible(vis),
                                        current: selectedImageIndex,
                                        onChange: (index) => setSelectedImageIndex(index),
                                    }}
                                >
                                    {product.images.map((img, idx) => (
                                        <Image
                                            key={idx}
                                            src={img}
                                            style={{ display: 'none' }}
                                        />
                                    ))}
                                </Image.PreviewGroup>

                                {/* Thumbnail image */}
                                <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
                                    {product.images.map((img, idx) => (
                                        <div
                                            key={idx}
                                            style={{
                                                border: idx === selectedImageIndex ? '2px solid red' : '1px solid #ccc',
                                                padding: 2,
                                                cursor: 'pointer',
                                            }}
                                            onClick={() => setSelectedImageIndex(idx)}
                                        >
                                            <Image
                                                src={img}
                                                width={60}
                                                height={60}
                                                style={{ objectFit: 'cover' }}
                                                preview={false}
                                                alt={`thumb-${idx}`}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div style={{ textAlign: 'center', color: '#aaa', padding: 20 }}>
                                <p>No product images</p>
                            </div>
                        )}
                    </div>

                    <div style={{ maxWidth: 500 }}>
                        <p><strong>Brand:</strong> {product.brand}</p>
                        <p><strong>Category:</strong> {product.category}</p>
                        <p><strong>Price:</strong> {product.price.toLocaleString()} VNĐ</p>
                        <p><strong>Product Description:</strong><br />{product.shortDescription}</p>

                        {/* Tags */}
                        <div style={{ marginTop: 10 }}>
                            <strong>Tags:</strong>
                            <div style={{ marginTop: 5 }}>
                                {product.tags.map((tag, index) => (
                                    <Tag color="blue" key={index}>{tag}</Tag>
                                ))}
                            </div>
                        </div>

                        <div style={{ marginTop: 10 }}>
                            <strong>Total inventory:</strong> {totalStock} product
                        </div>

                        <div style={{ marginTop: 10 }}>
                            <strong>Select variant:</strong>
                            <Select
                                style={{ width: '100%', marginTop: 5 }}
                                value={selectedVariant}
                                onChange={setSelectedVariant}
                            >
                                {product.variants.map(v => (
                                    <Option key={v._id} value={v._id}>
                                        {v.name} - {v.price.toLocaleString()} VNĐ ({v.inventory} left)
                                    </Option>
                                ))}
                            </Select>
                        </div>

                        <div style={{ marginTop: 15 }}>
                            <strong>Average rating: </strong>
                            <Rate allowHalf disabled value={avgRating} />
                            <span style={{ marginLeft: 8 }}>{avgRating.toFixed(1)} / 5</span>
                        </div>
                    </div>
                </div>

                <Divider />

                <div>
                    <h3>Comment:</h3>
                    <List
                        dataSource={product.comments}
                        renderItem={(item) => (
                            <List.Item>
                                <List.Item.Meta
                                    title={<strong>{item.user}</strong>}
                                    description={
                                        <>
                                            <Rate disabled value={item.rating} />
                                            <p>{item.content}</p>
                                        </>
                                    }
                                />
                            </List.Item>
                        )}
                    />
                </div>
            </Card>
        </div>
    );
};

export default ProductDetail;
