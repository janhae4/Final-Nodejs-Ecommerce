import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
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
  Typography,
  Row,
  Col,
  Breadcrumb,
  Space,
  Statistic,
  Carousel,
  Layout,
  Tooltip,
  Form,
} from "antd";
import { Button, Modal } from "antd";
import { useNavigate } from "react-router-dom";

import { Comment } from "@ant-design/compatible";

import {
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  ShoppingOutlined,
  TagOutlined,
  StarOutlined,
  HomeOutlined,
  AppstoreOutlined,
  LeftOutlined,
  RightOutlined,
  InfoCircleOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import TextArea from "antd/es/input/TextArea";
import { useCart } from "../../../context/CartContext";
import ReviewsSection from "../../../components/products/ReviewSections";
<<<<<<< HEAD
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
=======
>>>>>>> origin/khuong/comment

const { Panel } = Collapse;
const { Option } = Select;
const { Title, Text, Paragraph } = Typography;
const { confirm } = Modal;
dayjs.extend(relativeTime);
const ProductDetailPage = () => {
  const { addItemToCart } = useCart();
  const { slug: productId } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const carouselRef = useRef();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL
  const handleSubmit = async () => {
    await form.validateFields();
    console.log(form.getFieldsValue());
  };

  const handleAddCart = async () => {
    try {
      const res = await axios.get(`${API_URL}/products/${productId}`);
      addItemToCart(res.data.product, selectedVariant);
    } catch (err) {
      console.error(err);
      message.error("Cannot add product to cart!");
    }
  }

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `http://localhost:3000/api/products/${productId}`
        );
        setProduct(res.data.product);
        setSelectedVariant(res.data.product.variants[0]?._id);
      } catch (error) {
        console.error("Error fetching data:", error);
        message.error("Cannot get product!");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" tip="Loading..." />
      </div>
    );

  if (!product)
    return (
      <div className="text-center mt-24">
        <Title level={3}>Product not found!</Title>
        <Button type="primary" onClick={() => navigate("/admin/products")}>
          Back to catalog
        </Button>
      </div>
    );

  const ratedComments = product.comments?.filter(c => c.rating !== undefined && c.rating !== null);

  const avgRating = ratedComments && ratedComments.length > 0
    ? ratedComments.reduce((acc, c) => acc + c.rating, 0) / ratedComments.length
    : 0;

  const numRatedComments = ratedComments ? ratedComments.length : 0;

  const totalStock = product.variants?.reduce((acc, v) => acc + v.inventory, 0);

  return (
    <Layout className="site-content px-6 pb-6 mt-5">
      <Card
        variant="borderless"
        className="card-shadow shadow-none rounded-2xl"
        title={
          <div className="flex justify-between items-center">
            <Title level={3} className="m-0">
              {product.nameProduct}
            </Title>
          </div>
        }
      >
        <Row gutter={[32, 24]}>
          {/* Product Images */}
          <Col xs={24} md={12}>
            <Card
              variant="borderless"
              className="inner-card shadow-none bg-gray-50 rounded-lg"
            >
              {product.images.length > 0 ? (
                <>
                  <div className="relative mb-4">
                    <Carousel
                      ref={carouselRef}
                      afterChange={(current) => setSelectedImageIndex(current)}
                      dots={false}
                      className="product-carousel"
                    >
                      {product.images.map((img, idx) => (
                        <div key={idx} className="carousel-item-container">
                          <Image
                            src={img}
                            width="100%"
                            height={400}
                            className="object-contain cursor-pointer rounded-lg bg-white p-3 shadow-sm transition-all duration-500"
                            alt={`main-${idx}`}
                            preview={false}
                            onClick={() => setPreviewVisible(true)}
                          />
                        </div>
                      ))}
                    </Carousel>

                    {/* Carousel Navigation Buttons */}
                    <Button
                      icon={<LeftOutlined />}
                      className="absolute left-2 top-1/2 z-10 transform -translate-y-1/2 bg-white bg-opacity-70 hover:bg-opacity-100 border-0 shadow-md rounded-full flex items-center justify-center"
                      onClick={() => carouselRef.current.prev()}
                      size="large"
                    />
                    <Button
                      icon={<RightOutlined />}
                      className="absolute right-2 top-1/2 z-10 transform -translate-y-1/2 bg-white bg-opacity-70 hover:bg-opacity-100 border-0 shadow-md rounded-full flex items-center justify-center"
                      onClick={() => carouselRef.current.next()}
                      size="large"
                    />
                  </div>

                  {/* Preview group (hidden) */}
                  <Image.PreviewGroup
                    preview={{
                      visible: previewVisible,
                      onVisibleChange: (vis) => setPreviewVisible(vis),
                      current: selectedImageIndex,
                      onChange: (index) => setSelectedImageIndex(index),
                    }}
                  >
                    {product.images.map((img, idx) => (
                      <Image key={idx} src={img} className="hidden" />
                    ))}
                  </Image.PreviewGroup>

                  {/* Thumbnail image group */}
                  <div className="flex overflow-x-auto py-2 gap-2 justify-center">
                    {product.images.map((img, idx) => (
                      <div
                        key={idx}
                        className={`p-0.5 cursor-pointer rounded bg-white transition-all duration-300 transform ${idx === selectedImageIndex
                          ? "border-2 border-blue-500 shadow-md scale-110"
                          : "border border-gray-200 hover:scale-105"
                          }`}
                        onClick={() => {
                          setSelectedImageIndex(idx);
                          carouselRef.current.goTo(idx);
                        }}
                      >
                        <Image
                          src={img}
                          width={60}
                          height={60}
                          className="object-cover rounded"
                          preview={false}
                          alt={`thumb-${idx}`}
                        />
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center text-gray-400 p-10 bg-white rounded-lg border border-dashed border-gray-300">
                  <p>No product images available</p>
                </div>
              )}
            </Card>
          </Col>

          {/* Product Information */}
          <Col xs={24} md={12}>
            <Card
              variant="borderless"
              className="inner-card shadow-none rounded-lg"
            >
              <Row gutter={[16, 24]}>
                {/* Main Details */}
                <Col span={24}>
                  <Card
                    variant="borderless"
                    className="detail-section shadow-none rounded-lg"
                  >
                    <Title level={4}>General Information</Title>

                    <Row gutter={[16, 16]}>
                      <Col span={12}>
                        <Statistic
                          title="Brand"
                          value={product.brand || "Not specified"}
                          valueStyle={{ fontSize: "16px" }}
                        />
                      </Col>
                      <Col span={12}>
                        <Statistic
                          title="Category"
                          value={product.category || "Uncategorized"}
                          valueStyle={{ fontSize: "16px" }}
                        />
                      </Col>
                      <Col span={12}>
                        <Statistic
                          title="Base Price"
                          value={`${product.price.toLocaleString()} VNĐ`}
                          valueStyle={{
                            color: "#cf1322",
                            fontSize: "16px",
                            fontWeight: "bold",
                          }}
                        />
                      </Col>
                      <Col span={12}>
                        <Statistic
                          title="Total Stock"
                          value={totalStock}
                          suffix="items"
                          valueStyle={{ fontSize: "16px" }}
                          prefix={<ShoppingOutlined />}
                        />
                      </Col>
                      <Col span={24}>
                        <div>
                          <Title level={5} className="mb-2">
                            <TagOutlined /> Tags:
                          </Title>
                          <div>
                            {product.tags.length > 0 ? (
                              product.tags.map((tag, index) => (
                                <Tag color="blue" key={index} className="m-1">
                                  {tag}
                                </Tag>
                              ))
                            ) : (
                              <Text type="secondary">No tags</Text>
                            )}
                          </div>
                        </div>
                      </Col>
                      <Col span={24}>
                        <Title level={5} className="mb-2">
                          <StarOutlined /> Rating:
                          <span className="ml-2">
                            <Rate
                              allowHalf
                              disabled
                              value={avgRating}
                              className="text-base"
                            />
                            <Text className="ml-2">
                              {avgRating.toFixed(1)}/5 ({numRatedComments} reviews)
                            </Text>
                          </span>
                        </Title>

                        <Title level={4}>Product Variants</Title>

                        <Select
                          className="w-full"
                          placeholder="Select variant"
                          value={selectedVariant}
                          onChange={setSelectedVariant}
                          optionLabelProp="label"
                        >
                          {product.variants.map((v) => (
                            <Option key={v._id} value={v._id} label={v.name}>
                              <div className="flex justify-between">
                                <span>{v.name}</span>
                                <span>
                                  <Text
                                    className={
                                      v.inventory > 0
                                        ? "text-green-500"
                                        : "text-red-500"
                                    }
                                  >
                                    {v.inventory > 0
                                      ? `${v.inventory} in stock`
                                      : "Out of stock"}
                                  </Text>
                                  <Text strong className="ml-2">
                                    {v.price.toLocaleString()} VNĐ
                                  </Text>
                                </span>
                              </div>
                            </Option>
                          ))}
                        </Select>
                      </Col>

                      <Col span={24}>
                        <Button
                          className="w-full mx-auto bg-red-500 hover:bg-red-600 py-4 px-3 text-white font-semibold"
                          onClick={() => handleAddCart()}
                        >
                          <ShoppingCartOutlined className="font-bold" /> Add to
                          Cart
                        </Button>
                      </Col>

                      {/* Product Description Button */}
                      <Col span={24}>
                        <Button
                          type="primary"
                          icon={<InfoCircleOutlined />}
                          onClick={() => setShowDescription(!showDescription)}
                          className="w-full"
                        >
                          {showDescription
                            ? "Hide Description"
                            : "Show Description"}
                        </Button>

                        {/* Description Panel with Animation */}
                        <div
                          className={`description-panel overflow-hidden transition-all duration-500 ease-in-out bg-gray-50 rounded-lg mt-4 ${showDescription
                            ? "max-h-96 opacity-100"
                            : "max-h-0 opacity-0"
                            }`}
                        >
                          <div
                            className={`p-4 transform transition-all duration-500 ${showDescription
                              ? "translate-y-0"
                              : "-translate-y-4"
                              }`}
                          >
                            <Paragraph className="text-base whitespace-pre-line">
                              {product.shortDescription ||
                                "No description available for this product."}
                            </Paragraph>
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </Card>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
        {/* Comments */}
        <Card variant="borderless" className="rounded-2xl shadow-none">
          <h3 className="text-xl font-semibold mb-6">Customer Reviews</h3>

          {/* New comment form */}
          <div className="mt-12">
            <ReviewsSection
              productId={product._id}
            />
          </div>

          <Divider className="my-4" />

          {/* Comments list */}

        </Card>
      </Card>
      {/* Description - Removed since it's now in General Info */}
    </Layout>
  );
};

export default ProductDetailPage;
