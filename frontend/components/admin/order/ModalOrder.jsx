import React, { useState, useEffect } from "react";
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
} from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

// CSS for ensuring modal scrolling works properly
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

  useEffect(() => {
    if (form && form.getFieldValue("products")) {
      setProducts(form.getFieldValue("products") || []);
    } else {
      setProducts([]);
    }
  }, [form, isModalVisible]);

  const handleAddProduct = () => {
    const newProduct = {
      productId: "",
      quantity: 1,
      price: 0,
      key: Date.now(), // Unique key for rendering
    };

    const updatedProducts = [...products, newProduct];
    setProducts(updatedProducts);
    form.setFieldsValue({ products: updatedProducts });
  };

  const handleRemoveProduct = (key) => {
    const updatedProducts = products.filter((product) => product.key !== key);
    setProducts(updatedProducts);
    form.setFieldsValue({ products: updatedProducts });
  };

  const handleProductChange = (key, field, value) => {
    const updatedProducts = products.map((product) => {
      if (product.key === key) {
        return { ...product, [field]: value };
      }
      return product;
    });

    setProducts(updatedProducts);
    form.setFieldsValue({ products: updatedProducts });
  };

  const calculateTotal = () => {
    return products.reduce(
      (sum, product) => sum + product.price * product.quantity,
      0
    );
  };

  useEffect(() => {
    // Update total amount whenever products change
    form.setFieldsValue({ totalAmount: calculateTotal() });
  }, [products]);

  const orderStatusOptions = [
    "pending",
    "confirmed",
    "shipping",
    "delivered",
    "cancelled",
  ];

  const columns = [
    {
      title: "Product ID",
      dataIndex: "productId",
      key: "productId",
      render: (text, record) => (
        <Input
          value={text}
          onChange={(e) =>
            handleProductChange(record.key, "productId", e.target.value)
          }
          placeholder="Enter product ID"
        />
      ),
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      render: (text, record) => (
        <InputNumber
          min={1}
          value={text}
          onChange={(value) =>
            handleProductChange(record.key, "quantity", value)
          }
        />
      ),
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (text, record) => (
        <InputNumber
          min={0}
          step={0.01}
          value={text}
          onChange={(value) => handleProductChange(record.key, "price", value)}
          formatter={(value) => `$${value}`}
          parser={(value) => value.replace("$", "")}
        />
      ),
    },
    {
      title: "Subtotal",
      key: "subtotal",
      render: (_, record) => (
        <Text>${(record.price * record.quantity).toFixed(2)}</Text>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Button
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemoveProduct(record.key)}
        />
      ),
    },
  ];

  const tableFooter = () => (
    <Space direction="vertical" style={{ width: "100%" }}>
      <Row justify="space-between">
        <Col>
          <Button
            type="dashed"
            icon={<PlusOutlined />}
            onClick={handleAddProduct}
          >
            Add Product
          </Button>
        </Col>
        <Col>
          <Text strong>Total: ${calculateTotal().toFixed(2)}</Text>
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
      bodyStyle={modalStyles.modalBody}
      className="modal-with-internal-scroll"
      footer={[
        <Button key="back" onClick={handleCancel}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={handleSubmit}
          className="bg-blue-500"
        >
          {editingId ? "Update" : "Create"}
        </Button>,
      ]}
      centered
    >
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
              name="userId"
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
                {orderStatusOptions.map((status) => (
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
              name="paymentId"
              label="Payment ID"
              rules={[{ required: true, message: "Please enter payment ID" }]}
            >
              <Input placeholder="Enter payment ID" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="discountCode" label="Discount Code">
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
          dataSource={products}
          rowKey="key"
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
