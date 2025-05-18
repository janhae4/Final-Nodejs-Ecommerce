import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  Button,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Table,
  Space,
  Divider,
  Typography,
  Row,
  Col,
  message,
} from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import axios from "axios";
import debounce from "debounce";

const modalStyles = {
  modalBody: {
    maxHeight: "calc(100vh - 200px)",
    overflowY: "auto",
    paddingRight: "8px",
    scrollbarWidth: "thin",
  },
};

const { Option } = Select;
const { Text, Title } = Typography;

const ModalOrder = ({
  isModalVisible,
  handleCancel,
  form,
  handleSubmit,
  editingId,
}) => {
  const [products, setProducts] = useState([]);
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [variantsProduct, setVariantsProduct] = useState([]);
  const [maxQuantity, setMaxQuantity] = useState(100);
  const [messageApi, contextHolder] = message.useMessage();
  const [error, setError] = useState("");
  const [variantsSelected, setVariantsSelected] = useState({});
  const API_URL = import.meta.env.VITE_API_URL;
  const currentStatus = Form.useWatch("status", form);
  useEffect(() => {
    if (form && form.getFieldValue("products")) {
      setProducts(form.getFieldValue("products") || []);
    } else {
      setProducts([]);
    }
  }, [form, isModalVisible]);

  const debounceFetchRef = useRef(null);

  useEffect(() => {
    debounceFetchRef.current = debounce(async (input) => {
      try {
        const res = await axios.get(`${API_URL}/products?nameProduct=${input}`);
        setAvailableProducts(res.data.products);
      } catch (err) {
        console.error(err);
      }
    }, 500);
  }, []);

  const getVariantsProduct = async (id) => {
    try {
      console.log(form.getFieldsValue(true));
      const res = await axios.get(`${API_URL}/products/variants/${id}`);
      return res.data;
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const getV = async () => {
      const products = form.getFieldValue("products") || [];

      const variantsArray = await Promise.all(
        products.map(async (product) => {
          const variants = await getVariantsProduct(product.productId);
          console.log(variants);
          return {
          _id: `${product.productId}-${Date.now()}`, // unique id
            productId: product.productId,
            productName: product.productName,
            variantId: product.variantId,
            quantity: product.quantity,
            price: product.price,
            variants,
          };
        })
      );

      setVariantsSelected(variantsArray);
    };

    getV();
  }, [editingId]);

  const handleProductSelect = (productId) => {
    const selectedProductData = availableProducts.find(
      (p) => p._id === productId
    );

    getVariantsProduct(selectedProductData._id);

    if (selectedProductData) {
      const newProduct = {
        key: selectedProductData._id,
        productId: selectedProductData._id,
        productName: selectedProductData.nameProduct,
        quantity: 1,
        price: selectedProductData.price,
      };
      const updatedProducts = [...products, newProduct];
      setProducts(updatedProducts);
      form.setFieldsValue({ products: updatedProducts });
      setShowProductSelector(false);
      setSelectedProduct(null);
    }
  };

  const handleRemoveProduct = (productId) => {
    const updatedProducts = products.filter(
      (product) => product._id !== productId
    );
    setProducts(updatedProducts);
    form.setFieldsValue({ products: updatedProducts });
  };

  const handleProductChange = (key, field, value) => {
    const updatedProducts = products.map((product) => {
      if (product._id === key) {
        return { ...product, [field]: value };
      }
      return product;
    });
    setProducts(updatedProducts);
    form.setFieldsValue({ products: updatedProducts });
  };

  const _handleSubmit = (e) => {
    e.preventDefault();
    if (error) return;
    handleSubmit(e);
  };

  const calculateTotal = () => {
    return products.reduce(
      (sum, product) => sum + product.price * product.quantity,
      0
    );
  };

  useEffect(() => {
    form.setFieldsValue({ totalAmount: calculateTotal() });
  }, [products]);

  const orderStatusOptions = {
    pending: ["confirmed", "cancelled"],
    confirmed: ["shipping", "cancelled"],
    shipping: ["delivered", "cancelled"],
    delivered: [],
    cancelled: [],
  };

  const paymentMethodOptions = [
    { label: "COD", value: "cod" },
    { label: "Credit card", value: "credit_card" },
    { label: "Cash on delivery", value: "cash" },
  ];

  const columns = [
    {
      title: "Product",
      dataIndex: "productId",
      key: "productId",
      render: (text, record) => (
        <div>
          <div className="break-words whitespace-normal max-w-[200px]">
            <strong>{record.productName}</strong>
          </div>
          <div>
            <small>ID: {record.productId}</small>
          </div>
        </div>
      ),
    },
    {
      title: "Variant",
      dataIndex: "variants",
      key: "variants",
      render: (_, record) => (
        <Select
          placeholder="Select a variant"
          style={{ width: 250 }}
          value={record.variantId}
          onChange={(value) => {
            setVariantsSelected((prev) =>
              prev.map((item) =>
                item._id === record._id
                  ? {
                      ...item,
                      variantId: value,
                      // cập nhật giá theo variant mới
                      price:
                        item.variants.find((v) => v._id === value)?.price || 0,
                    }
                  : item
              )
            );
          }}
        >
          {record.variants.map((variant) => (
            <Option key={variant._id} value={variant._id}>
              {variant.name}
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      render: (text, record) => {
        const variant = record.variants.find((v) => v._id === record.variantId);
        const max = (variant?.inventory || 0) - (variant?.used || 0) || 100;

        return (
          <InputNumber
            min={1}
            max={max}
            value={record.quantity}
            onChange={(value) => {
              if (value > max) {
                messageApi.warning(`Maximum is ${max}`);
                setError(`Maximum is ${max}`);
              } else {
                setError(null);
                // Cập nhật lại quantity trong state
                setVariantsSelected((prev) =>
                  prev.map((item) =>
                    item._id === record._id
                      ? { ...item, quantity: value }
                      : item
                  )
                );
              }
            }}
          />
        );
      },
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (text, record) => (
        <InputNumber
          min={0}
          step={1000}
          value={text}
          onChange={(value) => handleProductChange(record._id, "price", value)}
          formatter={(value) =>
            `${Number(value).toLocaleString("vi-VN", {
              style: "currency",
              currency: "VND",
            })}`
          }
          parser={(value) => value.replace(/[₫,.\s]/g, "").replace(/\D/g, "")}
        />
      ),
    },
    {
      title: "Subtotal",
      key: "subtotal",
      render: (_, record) => (
        <Text>{(record.price * record.quantity).toLocaleString("vi-VN", { style: "currency", currency: "VND" })}</Text>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveProduct(record._id)}
        />
      ),
    },
  ];

  const tableFooter = () => (
    <Space direction="vertical" style={{ width: "100%" }}>
      <Row justify="space-between">
        <Col>
          <Text strong>
            Total:{" "}
            {calculateTotal().toLocaleString("vi-VN", {
              style: "currency",
              currency: "VND",
            })}
          </Text>
        </Col>
      </Row>
    </Space>
  );

  return (
    <Modal
      title={editingId ? "Edit Order" : "Create New Order"}
      open={isModalVisible}
      onCancel={handleCancel}
      width={900}
      styles={{ body: modalStyles.modalBody }}
      className="modal-with-internal-scroll"
      footer={[
        <Button key="back" onClick={handleCancel}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={_handleSubmit}
          className="bg-blue-500"
        >
          {editingId ? "Update" : "Create"}
        </Button>,
      ]}
      centered
    >
      {contextHolder}
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          status: "pending",
          purchaseDate: dayjs(Date.now()),
          loyaltyPointsEarned: 0,
          loyaltyPointsUsed: 0,
          products: [],
        }}
      >
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              name={["userInfo", "userId"]}
              label="User ID"
              rules={[{ required: true, message: "Please enter user ID" }]}
            >
              <Input placeholder="Enter user ID" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="orderCode"
              label="Order Code"
              rules={[{ required: true, message: "Please enter order code" }]}
            >
              <Input placeholder="Enter order code" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="purchaseDate"
              label="Purchase Date"
              rules={[
                { required: true, message: "Please select purchase date" },
              ]}
            >
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              name="status"
              label="Status"
              rules={[{ required: true, message: "Please select status" }]}
            >
              <Select placeholder="Select status">
                {(orderStatusOptions[currentStatus] || []).map((status) => (
                  <Option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="paymentMethod"
              label="Payment Method"
              rules={[{ required: true, message: "Please enter payment ID" }]}
            >
              <Select>
                {paymentMethodOptions.map((p) => (
                  <Option key={p.value} value={p.value}>
                    {p.label}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name={["discountInfo", "code"]} label="Discount Code">
              <Input placeholder="Enter discount code" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="shippingAddress"
          label="Shipping Address"
          rules={[{ required: true, message: "Please enter shipping address" }]}
        >
          <Input.TextArea rows={2} placeholder="Enter shipping address" />
        </Form.Item>

        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item name="loyaltyPointsEarned" label="Loyalty Points Earned">
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="loyaltyPointsUsed" label="Loyalty Points Used">
              <InputNumber min={0} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>

        <Divider orientation="left">Products</Divider>

        <Form.Item name="products" noStyle>
          <Input type="hidden" />
        </Form.Item>

        <Form.Item name="totalAmount" hidden>
          <InputNumber />
        </Form.Item>

        <Table
          columns={columns}
          dataSource={variantsSelected}
          rowKey="_id"
          pagination={false}
          footer={tableFooter}
          scroll={{ x: "max-content" }}
          size="small"
        />
      </Form>
    </Modal>
  );
};

export default ModalOrder;
