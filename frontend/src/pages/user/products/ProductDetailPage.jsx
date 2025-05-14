import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  Row,
  Col,
  Typography,
  Tag,
  Button,
  Spin,
  message,
  Descriptions,
  Breadcrumb,
  Layout,
  InputNumber,
  Collapse,
  Divider,
} from "antd";
import {
  HomeOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";

import ImageGallery from "../../../components/ImageGallery";
import VariantSelector from "../../../components/products/VariantSelector";
import ReviewsSection from "../../../components/products/ReviewSections";
import StarRatingDisplay from "../../../components/StartRatingDisplay";
import { fetchProductById } from "../../../services/productService"; // ✅ Gọi API thật
import { useCart } from "../../../context/CartContext"; // ✅ Hook cho giỏ hàng

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;

const ProductDetailPage = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [messageApi, contextHolder] = message.useMessage();

  const { addItemToCart } = useCart(); // ✅ hook từ context

  useEffect(() => {
    setLoading(true);
    fetchProductById(slug)
      .then((data) => {
        setProduct(data);
        console.log(data);
        if (data && data.variants && data.variants.length > 0) {
          const firstAvailable = data.variants.find((v) => v.inventory > 0);
          setSelectedVariant(firstAvailable || data.variants[0]);
        }
        setLoading(false);
      })
      .catch((err) => {
        messageApi.error("Failed to load product details.");
        console.error(err);
        setLoading(false);
      });
  }, [slug]);

  const handleVariantSelect = (variantId) => {
    const variant = product.variants.find((v) => v._id === variantId);
    setSelectedVariant(variant);
    setQuantity(1);
    console.log('Selected variant:', variant);
  };

  const handleAddToCart = () => {
    if (!selectedVariant) {
      messageApi.error("Please select a variant.");
      return;
    }
    if (selectedVariant.inventory === 0) {
      messageApi.warn("This variant is currently out of stock.");
      return;
    }
    if (quantity > selectedVariant.inventory) {
      messageApi.warn(
        `Only ${selectedVariant.inventory} items available for this variant.`
      );
      return;
    }

    addItemToCart(product, selectedVariant, quantity);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <Spin size="large" />
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="text-center p-10">
          Product not found or failed to load.{" "}
          <Link to="/products">Go to Catalog</Link>
        </div>
      </Layout>
    );
  }

  const currentPrice = product.price + (selectedVariant?.priceModifier || 0);

  return (
    <Layout>
      {contextHolder}
      <div className="container mx-auto p-4 md:p-8">
        <Breadcrumb className="mb-6">
          <Breadcrumb.Item href="/">
            <HomeOutlined />
          </Breadcrumb.Item>
          <Breadcrumb.Item href="/products">
            <span>Products</span>
          </Breadcrumb.Item>
          <Breadcrumb.Item>{product.name}</Breadcrumb.Item>
        </Breadcrumb>

        <Row gutter={[24, 24]}>
          <Col xs={24} md={12} lg={14}>
            <ImageGallery images={product.images} />
          </Col>
          <Col xs={24} md={12} lg={10}>
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <Text strong className="block text-base">
                Category: <span className="text-blue-600 font-bold">{product.category}</span>
              </Text>
              <div>
                <Title level={2} className="mb-2">
                  {product.nameProduct}
                </Title>
              </div>

              <div className="mb-3">
                <StarRatingDisplay
                  rating={product.averageRating}
                  count={product.totalReviews}
                  size="medium"
                />
              </div>

              <Text strong className="block text-base text-blue-600 mb-1">
                {new Intl.NumberFormat("vi-VN").format(currentPrice)} VNĐ
              </Text>

              <div className="mb-2">
                <Text strong className="block mb-2">
                  Brand: <span className="text-blue-600 font-bold">{product.brand}</span>
                </Text>
                {product.tags && product.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 max-h-12 overflow-hidden">
                    {product.tags.map((tag, index) => (
                      <Tag color="blue" key={index} className="text-xs">
                        {tag}
                      </Tag>
                    ))}
                  </div>
                )}
              </div>

              <VariantSelector
                variants={product.variants}
                selectedVariantId={selectedVariant?._id}
                onSelectVariant={handleVariantSelect}
              />

              <div className="my-4">
                <Text strong className="block mb-2">Quantity:</Text>
                <InputNumber
                  min={1}
                  max={selectedVariant?.inventory || 1}
                  value={quantity}
                  onChange={(value) => setQuantity(value)}
                />
              </div>

              <Button
                type="primary"
                icon={<ShoppingCartOutlined />}
                block
                size="large"
                onClick={handleAddToCart}
                disabled={!selectedVariant || selectedVariant.inventory === 0}
              >
                Add to Cart
              </Button>
            </div>
          </Col>
        </Row>
        <Divider />
        <Collapse ghost>
          <Panel
            header={<strong style={{ fontSize: 20 }}>Description</strong>}
            key="1"
            style={{ fontFamily: 'inherit', fontSize: 16 }}
          >
            <div style={{ whiteSpace: 'pre-line' }}>
              {product.shortDescription}
            </div>
          </Panel>
        </Collapse>
        <Divider />

        <div className="mt-12">
          <ReviewsSection
            productId={product._id}
            reviews={product.reviews}
            averageRating={product.averageRating}
          />
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetailPage;
