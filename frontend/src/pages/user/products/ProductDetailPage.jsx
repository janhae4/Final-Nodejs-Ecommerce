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
  InputNumber,
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

const { Panel } = Collapse;
const { Option } = Select;
const { Title, Text, Paragraph } = Typography;
const { confirm } = Modal;
dayjs.extend(relativeTime);
const ProductDetailPage = () => {
  const { addItemToCart } = useCart();
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(
    product?.variants[0]?._id
  );
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [maxQuantity, setMaxQuantity] = useState(1000);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const carouselRef = useRef();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (product) {
      setMaxQuantity(
        product.variants.find((v) => v._id === selectedVariant).inventory
      );
      console.log(maxQuantity);
    }
  }, [selectedVariant, product]);

  useEffect(() => {
    console.log(selectedQuantity, maxQuantity)
  }, [selectedQuantity])

  const handleSubmit = async () => {
    await form.validateFields();
    console.log(form.getFieldsValue());
  };

  useEffect(() => { 
    console.log(selectedVariant)
  }, [selectedVariant])

  const handleAddCart = async () => {
    try {
      if (selectedQuantity > maxQuantity) {
        message.error("Out of stock!");
        return;
      }
      const res = await axios.get(`${API_URL}/products/${slug}`);
      const productVariant = res.data.product.variants.find(
        (v) => v._id === selectedVariant
      )
      addItemToCart(res.data.product, productVariant, selectedQuantity);
    } catch (err) {
      console.error(err);
      message.error("Cannot add product to cart!");
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `http://localhost:3000/api/products/${slug}`
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
  }, []);

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
        <Button type="primary" onClick={() => navigate("/products")}>
          Back to catalog
        </Button>
      </div>
    );

  const ratedComments = product.comments?.filter(
    (c) => c.rating !== undefined && c.rating !== null
  );

  const avgRating =
    ratedComments && ratedComments.length > 0
      ? ratedComments.reduce((acc, c) => acc + c.rating, 0) /
        ratedComments.length
      : 0;

  const numRatedComments = ratedComments ? ratedComments.length : 0;

  const totalStock = product.variants?.reduce((acc, v) => acc +( v.inventory - v.used), 0);

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
                              {avgRating.toFixed(1)}/5 ({numRatedComments}{" "}
                              reviews)
                            </Text>
                          </span>
                        </Title>

                        <Title level={4}>Product Variants</Title>

                        <Select
                          className="w-full"
                          placeholder="Select variant"
                          value={selectedVariant}
                          onChange={(e) => {
                            console.log(e)
                            setSelectedVariant(e);
                            setMaxQuantity(
                              product.variants.find((v) => v._id === e)
                                .inventory
                            );
                          }}
                          optionLabelProp="label"
                        >
                          {product.variants.map((v) => (
                            <Option key={v._id} value={v._id} label={v.name}>
                              <div className="flex-col md:flex-row flex justify-between">
                                <span>{v.name}</span>
                                <span>
                                  <Text
                                    className={
                                      v.inventory > v.used
                                        ? "text-green-500"
                                        : "text-red-500"
                                    }
                                  >
                                    {v.inventory > v.used
                                      ? `${v.inventory - v.used} in stock`
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
                        <Title level={4}>Product Quantity</Title>
                        {selectedQuantity > maxQuantity && (
                          <Text type="danger">
                            Quantity exceeds available stock
                          </Text>
                        )}
                        <InputNumber
                          min={1}
                          value={selectedQuantity}
                          onChange={setSelectedQuantity}
                          className="w-full"
                        />
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
          <div className="mt-12">
            <ReviewsSection slug={product._id} />
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
