// src/pages/ProductDetailPage.jsx
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom"; // React Router for product ID
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
} from "antd";
import { HomeOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import ImageGallery from "../../../components/ImageGallery";
import VariantSelector from "../../../components/products/VariantSelector";
import ReviewsSection from "../../../components/products/ReviewSections";
import StarRatingDisplay from "../../../components/StartRatingDisplay";
// import { fetchProductById } from '../../../services/productService'; // API call

const { Title, Paragraph, Text } = Typography;

// MOCK DATA (replace with API call)
const getMockProductById = (id) => {
  const baseId = parseInt(id.replace("prod", ""), 10);
  if (isNaN(baseId) || baseId < 1 || baseId > 50) return null;

  const i = baseId - 1; //
  return {
    id: `prod${baseId}`,
    name: `Detailed Product ${baseId}: The Ultimate Gadget`,
    price: parseFloat((Math.random() * 200 + 50).toFixed(2)),
    brand: {
      id: `brand${(i % 3) + 1}`,
      name: ["Innovatech", "QuantumLeap", "Evergreen Co."][i % 3],
    },
    images: [
      // Minimum 3 images
      {
        url: `https://picsum.photos/seed/detail${baseId}_1/800/600`,
        alt: `Product ${baseId} view 1`,
      },
      {
        url: `https://picsum.photos/seed/detail${baseId}_2/800/600`,
        alt: `Product ${baseId} view 2`,
      },
      {
        url: `https://picsum.photos/seed/detail${baseId}_3/800/600`,
        alt: `Product ${baseId} view 3`,
      },
      {
        url: `https://picsum.photos/seed/detail${baseId}_4/800/600`,
        alt: `Product ${baseId} view 4`,
      },
    ],
    // Short description of at least 5 lines
    shortDescription: `Experience the pinnacle of innovation with the Detailed Product ${baseId}. 
    This marvel of engineering combines sleek design with powerful performance, tailored for your modern lifestyle. 
    Crafted from premium materials, it promises durability and a sophisticated aesthetic. 
    Its intuitive interface makes it a joy to use, whether you're a beginner or a seasoned pro. 
    Unlock new possibilities and elevate your daily routine with this exceptional product.`,
    category: {
      id: `cat${(i % 4) + 1}`,
      name: ["Gadgets", "Lifestyle", "Outdoor", "Productivity"][i % 4],
    },
    tags: [["Bestseller", "Eco-Friendly", "Smart Home"][i % 3]],
    averageRating: parseFloat((Math.random() * 2 + 3).toFixed(1)), // e.g. 3.0 to 5.0
    totalReviews: Math.floor(Math.random() * 100 + 5),
    variants: [
      {
        id: `var${baseId}a`,
        name: "Crimson Red / 64GB",
        stock: Math.floor(Math.random() * 8),
        priceModifier: 0,
      },
      {
        id: `var${baseId}b`,
        name: "Ocean Blue / 128GB",
        stock: Math.floor(Math.random() * 12),
        priceModifier: 20,
      },
      {
        id: `var${baseId}c`,
        name: "Midnight Black / 256GB",
        stock: 0,
        priceModifier: 50,
      }, // Example out of stock
    ],
    // Mock reviews for the product
    reviews: Array.from(
      { length: Math.floor(Math.random() * 5 + 2) },
      (_, k) => ({
        id: `rev${baseId}_${k}`,
        author: ["Alice", "Bob", "Charlie", "Diana", "Edward"][k % 5],
        avatarUrl: `https://i.pravatar.cc/40?u=user${k}`,
        content: `This is a truly fantastic product, exceeded all my expectations for product ${baseId}! Highly recommended. I've been using it for a while now and it's ${
          ["great", "okay", "decent", "superb"][k % 4]
        }.`,
        datetime: new Date(
          Date.now() - Math.random() * 1000000000
        ).toISOString(),
        rating: Math.floor(Math.random() * 3 + 3), // 3 to 5 stars
      })
    ),
  };
};

const ProductDetailPage = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    setLoading(true);
    // Simulating API call
    const fetchedProduct = getMockProductById(productId);
    setTimeout(() => {
      if (fetchedProduct) {
        setProduct(fetchedProduct);
        // Auto-select first available variant
        const firstAvailable = fetchedProduct.variants.find((v) => v.stock > 0);
        setSelectedVariant(firstAvailable || fetchedProduct.variants[0]); // fallback to first if all out of stock
      } else {
        messageApi.error("Product not found.");
        // navigate('/404') or similar
      }
      setLoading(false);
    }, 1000);

    /* // Real API Call Example:
    fetchProductById(productId)
      .then(data => {
        setProduct(data);
        if (data && data.variants && data.variants.length > 0) {
          const firstAvailable = data.variants.find(v => v.stock > 0);
          setSelectedVariant(firstAvailable || data.variants[0]);
        }
        setLoading(false);
      })
      .catch(err => {
        messageApi.error("Failed to load product details.");
        console.error(err);
        setLoading(false);
      });
    */
  }, [productId]);

  const handleVariantSelect = (variantId) => {
    const variant = product.variants.find((v) => v.id === variantId);
    setSelectedVariant(variant);
    setQuantity(1); // Reset quantity on variant change
  };

  const handleAddToCart = () => {
    if (!selectedVariant) {
      messageApi.error("Please select a variant.");
      return;
    }
    if (selectedVariant.stock === 0) {
      messageApi.warn("This variant is currently out of stock.");
      return;
    }
    if (quantity > selectedVariant.stock) {
      messageApi.warn(
        `Only ${selectedVariant.stock} items available for this variant.`
      );
      return;
    }
    // product object itself, selectedVariant object, quantity
    addItemToCart(product, selectedVariant, quantity);
    // messageApi.success is now handled in CartContext
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
              <Tag color="blue" className="mb-2">
                {product.category.name}
              </Tag>
              <Title level={2} className="mb-2">
                {product.name}
              </Title>
              <div className="mb-3">
                <StarRatingDisplay
                  rating={product.averageRating}
                  count={product.totalReviews}
                  size="medium"
                />
              </div>
              <Text strong className="block text-3xl text-blue-600 mb-4">
                ${currentPrice.toFixed(2)}
              </Text>

              <Paragraph className="text-gray-600 mb-4 whitespace-pre-line leading-relaxed">
                {product.shortDescription}
              </Paragraph>

              <Descriptions bordered column={1} size="small" className="mb-4">
                <Descriptions.Item label="Brand">
                  {product.brand.name}
                </Descriptions.Item>
                {product.tags && product.tags.length > 0 && (
                  <Descriptions.Item label="Tags">
                    {product.tags.map((tag) => (
                      <Tag key={tag} color="geekblue">
                        {tag}
                      </Tag>
                    ))}
                  </Descriptions.Item>
                )}
                {selectedVariant && (
                  <Descriptions.Item label="Availability">
                    <Text
                      type={selectedVariant.stock > 0 ? "success" : "danger"}
                    >
                      {selectedVariant.stock > 0
                        ? `${selectedVariant.stock} in stock`
                        : "Out of Stock"}
                    </Text>
                  </Descriptions.Item>
                )}
              </Descriptions>

              <VariantSelector
                variants={product.variants}
                selectedVariant={selectedVariant}
                onSelectVariant={handleVariantSelect}
              />

              {selectedVariant && selectedVariant.stock > 0 && (
                <div className="flex items-center my-4">
                  <Text className="mr-2">Quantity:</Text>
                  <Button
                    size="small"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </Button>
                  <Input
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (
                        !isNaN(val) &&
                        val > 0 &&
                        val <= selectedVariant.stock
                      )
                        setQuantity(val);
                      else if (!isNaN(val) && val > selectedVariant.stock)
                        setQuantity(selectedVariant.stock);
                      else if (e.target.value === "") setQuantity(1); // Or handle empty string better
                    }}
                    className="w-16 text-center mx-2"
                  />
                  <Button
                    size="small"
                    onClick={() =>
                      setQuantity((q) => Math.min(selectedVariant.stock, q + 1))
                    }
                    disabled={quantity >= selectedVariant.stock}
                  >
                    +
                  </Button>
                </div>
              )}

              <Button
                type="primary"
                icon={<ShoppingCartOutlined />}
                size="large"
                block
                className="bg-green-500 hover:bg-green-600 mt-4"
                onClick={handleAddToCart}
                disabled={!selectedVariant || selectedVariant.stock === 0}
              >
                {selectedVariant && selectedVariant.stock > 0
                  ? "Add to Cart"
                  : "Out of Stock"}
              </Button>
            </div>
          </Col>
        </Row>

        <div className="mt-10">
          <ReviewsSection
            productId={product.id}
            initialReviews={product.reviews}
            averageRating={product.averageRating}
            totalReviews={product.totalReviews}
          />
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetailPage;
