import React, { useState, useEffect, useRef } from "react";
import {
  Layout,
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  message,
  Space,
  Popconfirm,
  Card,
  Typography,
  Tag,
  Statistic,
  Row,
  Col,
  Divider,
  Breadcrumb,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  SearchOutlined,
  TagOutlined,
  CodeOutlined,
  PercentageOutlined,
  DashboardOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import axios from "axios";
import debounce from "debounce";
import dayjs from "dayjs";

import ModalOrder from "../../../../components/admin/order/ModalOrder";
const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

const OrderAdmin = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const API_URL = import.meta.env.VITE_API_URL;

  const fetchAllData = async (page = 1, pageSize = 20) => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${API_URL}/orders/all?page=${page}&limit=${pageSize}`
      );
      setOrders(response.data.data);
      console.log(response.data.data)
      setPagination({
        current: orders.currentPage,
        pageSize: 20,
        total: orders.totalCount,
      });
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      messageApi.error("Failed to fetch data");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const showModal = (record = null) => {
    if (record) {
      setEditingId(record._id);

      form.setFieldsValue({
        ...record,
        purchaseDate: dayjs(record.purchaseDate),
      });

      console.log(form.getFieldsValue());
    } else {
      setEditingId(null);
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleRowClick = (record) => {
    setSelectedDiscount(record);
    setOrderModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      if (editingId) {
        await axios.patch(`${API_URL}/orders/${editingId}`, values);
        setOrders((prev) =>
          prev.map((item) =>
            item._id === editingId ? { ...item, ...values } : item
          )
        );
        messageApi.success("Order updated successfully");
      } else {
        await axios.post(`${API_URL}/orders`, values);
        const newCode = {
          _id: String(discountCodes.length + 1),
          ...values,
          usedCount: 0,
        };
        setOrders((prev) => [...prev, newCode]);
        messageApi.success("Order created successfully");
      }
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error("Error submitting form:", error);
      messageApi.error(error.response.data.message || "Failed to submit form");
    }
  };

  const handleDelete = async (id) => {
    try {
      console.log(id);
      await axios.delete(`${API_URL}/orders/${id}`);
      setOrders((prev) => prev.filter((item) => item._id !== id));
      messageApi.success("Order deleted successfully");

      const updatedCodes = discountCodes.filter((item) => item._id !== id);
      const total = updatedCodes.length;
      const active = updatedCodes.filter(
        (code) => code.status === "active"
      ).length;
      const inactive = total - active;
      const mostUsed =
        updatedCodes.length > 0
          ? [...updatedCodes].sort((a, b) => b.usedCount - a.usedCount)[0]
          : null;

      setStats({
        total,
        active,
        inactive,
        mostUsed,
      });
    } catch (error) {
      console.error("Error deleting Order:", error);
      messageApi.error(
        error.response.data.message || "Failed to delete Order"
      );
    }
  };

  const debouncedFetchRef = useRef(
    debounce((value, page, pageSize) => {
      fetchDiscountCodes(page, pageSize, value);
    }, 500)
  );

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchText(value);
    debouncedFetchRef.current(value, page, pageSize);
  };

  const columns = [
    {
      title: "Code",
      dataIndex: "orderCode",
      key: "orderCode",
      render: (text) => <Text strong># {text}</Text>,
      sorter: (a, b) => a.code.localeCompare(b.code),
    },
    {
      title: "Amount",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (value, record) => <Text strong>${value}</Text>,
      sorter: (a, b) => a.value - b.value,
    },
    {
      title: "Shipping address",
      dataIndex: "shippingAddress",
      key: "shippingAddress",
      sorter: (a, b) => a.shippingAddress.localeCompare(b.shippingAddress),
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Purchase date",
      dataIndex: "purchaseDate",
      key: "purchaseDate",
      sorter: (a, b) => new Date(a.purchaseDate) - new Date(b.purchaseDate),
      render: (text) => dayjs(text).format("DD/MM/YYYY - HH:mm:ss"),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        switch (status) {
          case "pending":
            return <Tag color="processing">Pending</Tag>;
          case "confirmed":
            return <Tag color="processing">Confirmed</Tag>;
          case "shipping":
            return <Tag color="processing">Shipping</Tag>;
          case "delivered":
            return <Tag color="success">Delivered</Tag>;
          case "cancelled":
            return <Tag color="error">Cancelled</Tag>;
          default:
            return null;
        }
      },
      filters: [
        { text: "Pending", value: "pending" },
        { text: "Confirmed", value: "confirmed" },
        { text: "Shipping", value: "shipping" },
        { text: "Delivered", value: "delivered" },
        { text: "Cancelled", value: "cancelled" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => showModal(record)}
            className="bg-blue-500"
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure you want to delete this code?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger icon={<DeleteOutlined />} size="small">
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Layout className="min-h-screen">
      {contextHolder}
      <Content className="p-4 md:p-6 bg-white">
        <Breadcrumb className="mb-4">
          <Breadcrumb.Item href="#">
            <DashboardOutlined /> Dashboard
          </Breadcrumb.Item>
          <Breadcrumb.Item>Orders</Breadcrumb.Item>
        </Breadcrumb>

        <Title level={2} className="mb-6">
          Orders Management
        </Title>

        {/* Statistics Cards */}

        <Card className="mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start mb-4">
            <Title level={4} className="mb-4 md:mb-0">
              Orders List
            </Title>
            <div className="w-full md:w-auto flex flex-col md:flex-row gap-4 items-start">
              <Input
                placeholder="Search by code"
                value={searchText}
                onChange={handleSearchChange}
                prefix={<SearchOutlined />}
                className="w-full md:w-64"
              />
              <div className="flex gap-2">
                <Button
                  type="primary"
                  icon={<ReloadOutlined />}
                  onClick={fetchAllData}
                  className="bg-blue-500"
                >
                  Refresh
                </Button>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => showModal()}
                  className="bg-green-500"
                >
                  Add New
                </Button>
              </div>
            </div>
          </div>

          <Table
            columns={columns}
            dataSource={orders}
            rowKey="_id"
            loading={loading}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} items`,
              onChange: (page, pageSize) => {
                setPage(page);
                setPageSize(pageSize);
                fetchDiscountCodes(page, pageSize, searchText);
              },
              showTotal: (total) => `Total ${total} items`,
            }}
            scroll={{ x: "max-content" }}
            className="overflow-x-auto"
            onRow={(record) => ({
              onClick: () => handleRowClick(record),
            })}
          />
        </Card>
      </Content>
      <ModalOrder
        editingId={editingId}
        isModalVisible={isModalVisible}
        handleCancel={handleCancel}
        form={form}
        handleSubmit={handleSubmit}
      />
    </Layout>
  );
};

export default OrderAdmin;
