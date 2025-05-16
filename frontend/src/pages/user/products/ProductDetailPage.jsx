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

  const avgRating = product.comments?.length
    ? product.comments.reduce((acc, c) => acc + c.rating, 0) /
      product.comments.length
    : 0;

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
                        className={`p-0.5 cursor-pointer rounded bg-white transition-all duration-300 transform ${
                          idx === selectedImageIndex
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
                              {avgRating.toFixed(1)}/5 (
                              {product.comments?.length || 0} reviews)
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
                          className={`description-panel overflow-hidden transition-all duration-500 ease-in-out bg-gray-50 rounded-lg mt-4 ${
                            showDescription
                              ? "max-h-96 opacity-100"
                              : "max-h-0 opacity-0"
                          }`}
                        >
                          <div
                            className={`p-4 transform transition-all duration-500 ${
                              showDescription
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
          <Card className="bg-gray-50 rounded-lg mb-6">
            <Form form={form} onFinish={handleSubmit}>
              <Form.Item
                name="comment"
                rules={[
                  { required: true, message: "Please write your comment" },
                ]}
              >
                <TextArea
                  rows={4}
                  placeholder="Share your experience with this product..."
                  className="rounded-lg"
                />
              </Form.Item>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Your rating:</span>
                  <Rate value={rating} onChange={setRating} />
                </div>
                <Form.Item className="mb-0">
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={submitting}
                    className="rounded-lg px-6"
                  >
                    Post Review
                  </Button>
                </Form.Item>
              </div>
            </Form>
          </Card>

          <Divider className="my-4" />

          {/* Comments list */}
          <div className="space-y-4">
            {product.comments && product.comments.length > 0 ? (
              product.comments.map((comment, index) => (
                <Card
                  key={index}
                  className="rounded-xl bg-white border border-gray-100 hover:border-blue-100 transition-all"
                >
                  <Comment
                    author={
                      <span className="font-medium text-gray-900">
                        {comment.userFullName}
                      </span>
                    }
                    content={
                      <div className="mt-2">
                        <Rate
                          disabled
                          value={comment.rating}
                          className="text-sm"
                        />
                        <p className="mt-2 text-gray-700">{comment.content}</p>
                      </div>
                    }
                    datetime={
                      <Tooltip
                        title={dayjs(comment.createdAt).format(
                          "YYYY-MM-DD HH:mm:ss"
                        )}
                      >
                        <span className="text-gray-500 text-sm">
                          {dayjs(comment.createdAt).fromNow()}
                        </span>
                      </Tooltip>
                    }
                  />
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No reviews yet. Be the first to share your experience!
              </div>
            )}
          </div>
        </Card>
      </Card>
      {/* Description - Removed since it's now in General Info */}
    </Layout>
  );
};

export default ProductDetailPage;
