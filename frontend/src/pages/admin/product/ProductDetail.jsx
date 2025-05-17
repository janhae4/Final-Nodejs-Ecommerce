import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Card,
    Image,
    Select,
    Rate,
    List,
    Divider,
    Tag,
    Spin,
    message,
    Collapse,
    Button,
} from 'antd';

const { Panel } = Collapse;
const { Option } = Select;

const ProductDetail = () => {
    const { productId } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [previewVisible, setPreviewVisible] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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

    const ratedComments = product.comments?.filter(c => c.rating !== undefined && c.rating !== null);

    const avgRating = ratedComments && ratedComments.length > 0
        ? ratedComments.reduce((acc, c) => acc + c.rating, 0) / ratedComments.length
        : 0;

    const totalStock = product.variants?.reduce((acc, v) => acc + v.inventory, 0);

    return (
        <div style={{ padding: 20 }}>
            <Card
                title={
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        flexDirection: isMobile ? 'column' : 'row',
                        gap: 10
                    }}>
                        <span style={{ fontSize: 20 }}>{product.nameProduct}</span>
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                            <Button type="primary" onClick={() => navigate(`/admin/products/edit/${productId}`)}>
                                Edit Product
                            </Button>
                            <Button danger onClick={handleDelete}>
                                Delete Product
                            </Button>
                        </div>
                    </div>
                }
            >
                <div style={{
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    gap: 30
                }}>
                    {/* Image Section */}
                    <div style={{
                        width: '100%',
                        maxWidth: 500,
                        textAlign: 'center'
                    }}>
                        {product.images.length > 0 ? (
                            <>
                                <Image
                                    src={product.images[selectedImageIndex]}
                                    style={{
                                        width: '100%',
                                        maxWidth: 300,
                                        height: 'auto',
                                        objectFit: 'contain',
                                        marginBottom: 16,
                                        cursor: 'pointer',
                                        borderRadius: 8
                                    }}
                                    alt={`main-${selectedImageIndex}`}
                                    preview={false}
                                    onClick={() => setPreviewVisible(true)}
                                />

                                <Image.PreviewGroup
                                    preview={{
                                        visible: previewVisible,
                                        onVisibleChange: (vis) => setPreviewVisible(vis),
                                        current: selectedImageIndex,
                                        onChange: (index) => setSelectedImageIndex(index),
                                    }}
                                >
                                    {product.images.map((img, idx) => (
                                        <Image key={idx} src={img} style={{ display: 'none' }} />
                                    ))}
                                </Image.PreviewGroup>

                                <div style={{
                                    display: 'flex',
                                    overflowX: 'auto',
                                    paddingBottom: 10,
                                    gap: 10
                                }}>
                                    {product.images.map((img, idx) => (
                                        <div
                                            key={idx}
                                            style={{
                                                border: idx === selectedImageIndex ? '2px solid green' : '1px solid #ccc',
                                                padding: 2,
                                                cursor: 'pointer',
                                                borderRadius: 4
                                            }}
                                            onClick={() => setSelectedImageIndex(idx)}
                                        >
                                            <Image
                                                src={img}
                                                width={60}
                                                height={60}
                                                style={{ objectFit: 'cover', borderRadius: 4 }}
                                                preview={false}
                                                alt={`thumb-${idx}`}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <p style={{ color: '#aaa', padding: 20 }}>No product images</p>
                        )}
                    </div>

                    {/* Product Info */}
                    <div style={{ width: '100%', maxWidth: 500 }}>
                        <p><strong>Brand:</strong> {product.brand}</p>
                        <p><strong>Category:</strong> {product.category}</p>
                        <p><strong>Price:</strong> {product.price.toLocaleString()} VNĐ</p>

                        <div>
                            <strong>Tags:</strong>
                            <div style={{ marginTop: 5 }}>
                                {product.tags.map((tag, index) => (
                                    <Tag color="blue" key={index}>{tag}</Tag>
                                ))}
                            </div>
                        </div>

                        <div style={{ marginTop: 10 }}>
                            <strong>Total inventory:</strong> {totalStock} products
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
                                        {v.name} - {v.price.toLocaleString()} VNĐ ({v.inventory} in stock)
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

                <Collapse ghost>
                    <Panel
                        header={<strong style={{ fontSize: 20 }}>Description</strong>}
                        key="1"
                        style={{ fontSize: 16 }}
                    >
                        <div style={{ whiteSpace: 'pre-line' }}>
                            {product.shortDescription}
                        </div>
                    </Panel>
                </Collapse>

                <Divider />

                <div>
                    <h3>Comment:</h3>
                    <List
                        dataSource={product.comments}
                        renderItem={(item) => (
                            <List.Item>
                                <List.Item.Meta
                                    title={<strong>{item.userFullName}</strong>}
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
