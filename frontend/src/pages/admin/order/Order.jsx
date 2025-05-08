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
  DatePicker,
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
  EyeOutlined,
} from "@ant-design/icons";
import axios from "axios";
import debounce from "debounce";
import dayjs from "dayjs";

import ModalOrder from "../../../../components/admin/order/ModalOrder";
import ModalViewOrder from "../../../../components/admin/order/ModalViewOrder";
const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

const OrderAdmin = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [timeFilter, setTimeFilter] = useState("all");
  const [dateRange, setDateRange] = useState(null);
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();
  const API_URL = import.meta.env.VITE_API_URL;

  const fetchAllData = async (page = 1, pageSize = 20, search = "", timeFrame = "all", startDate = null, endDate = null) => {
    try {
      setLoading(true);

      let url = `${API_URL}/orders/all?page=${page}&limit=${pageSize}`;
      
      if (search && search.trim() !== "") {
        url += `&search=${encodeURIComponent(search)}`;
      }
      
      if (timeFrame && timeFrame !== "all") {
        url += `&timeFilter=${timeFrame}`;
      }
      
      if (startDate && endDate) {
        url += `&startDate=${startDate.format("YYYY-MM-DD")}&endDate=${endDate.format("YYYY-MM-DD")}`;
      }

      const response = await axios.get(url);
      setOrders(response.data.data);
      console.log(response.data.data);
      setPagination({
        current: page,
        pageSize: pageSize,
        total: response.data.totalCount || 0,
      });
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      messageApi.error("Failed to fetch data");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData(page, pageSize, searchText, timeFilter, 
      dateRange ? dateRange[0] : null,
      dateRange ? dateRange[1] : null);
  }, [page, pageSize, timeFilter, dateRange]);

  const handleTimeFilterChange = (value) => {
    setTimeFilter(value);
    setDateRange(null); // Reset date range when changing time filter
    setPage(1); // Reset to first page when filter changes
  };

  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
    setTimeFilter("all"); // Reset time filter when custom range is selected
    setPage(1); // Reset to first page when filter changes
  };

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

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await axios.put(`${API_URL}/orders/${editingId}`, values);
      setOrders((prev) =>
        prev.map((item) =>
          item._id === editingId ? { ...item, ...values } : item
        )
      );
      messageApi.success("Order updated successfully");

      setIsModalVisible(false);
      form.resetFields();
      
      // Refresh data after update
      fetchAllData(page, pageSize, searchText, timeFilter, 
        dateRange ? dateRange[0] : null,
        dateRange ? dateRange[1] : null);
    } catch (error) {
      console.error("Error submitting form:", error);
      messageApi.error(error.response?.data?.message || "Failed to submit form");
    }
  };

  const debouncedFetchRef = useRef(
    debounce((value, page, pageSize, timeFrame, startDate, endDate) => {
      fetchAllData(page, pageSize, value, timeFrame, startDate, endDate);
    }, 500)
  );

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchText(value);
    debouncedFetchRef.current(
      value, 
      page, 
      pageSize, 
      timeFilter,
      dateRange ? dateRange[0] : null,
      dateRange ? dateRange[1] : null
    );
  };

  const showViewModal = (record) => {
    setSelectedOrder(record);
    setIsViewModalVisible(true);
  };

  const handleViewModalCancel = () => {
    setIsViewModalVisible(false);
  };

  const handleRowClick = (record) => {
    // You can define what happens when a row is clicked
    // For example, you might want to show the view modal
    // showViewModal(record);
  };

  const columns = [
    {
      title: "Code",
      dataIndex: "orderCode",
      key: "orderCode",
      render: (text) => <Text strong># {text}</Text>,
      sorter: (a, b) => a.orderCode.localeCompare(b.orderCode),
    },
    {
      title: "Amount",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (value, record) => <Text strong>${value}</Text>,
      sorter: (a, b) => a.totalAmount - b.totalAmount,
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
            type="default"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => showViewModal(record)}
            className="bg-blue-500"
          >
            View
          </Button>
          <Button
            type="primary"
            icon={<EditOutlined />}
            size="small"
            onClick={() => showModal(record)}
            className="bg-blue-500"
          >
            Edit
          </Button>
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
          <div className="flex flex-col lg:flex-row justify-between items-start mb-4">
            <Title level={4} className="mb-4 md:mb-0">
              Orders List
            </Title>

            <div className="flex flex-col md:flex-row gap-4 items-start">
              <Select
                className="w-full lg:w-48"
                defaultValue="all"
                value={timeFilter}
                onChange={handleTimeFilterChange}
                options={[
                  { label: "All Time", value: "all" },
                  { label: "Today", value: "today" },
                  { label: "Yesterday", value: "yesterday" },
                  { label: "This Week", value: "week" },
                  { label: "This Month", value: "month" },
                ]}
              />

              <DatePicker.RangePicker
                value={dateRange}
                onChange={handleDateRangeChange}
                className="w-full md:w-auto"
                allowClear
              />
            </div>

            <div className="w-full md:w-auto flex flex-col mt-4 md:mt-0 md:flex-row gap-4 items-start">
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
                  onClick={() => fetchAllData(
                    page, 
                    pageSize, 
                    searchText,
                    timeFilter,
                    dateRange ? dateRange[0] : null,
                    dateRange ? dateRange[1] : null
                  )}
                  className="bg-blue-500"
                >
                  Refresh
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
                fetchAllData(
                  page, 
                  pageSize, 
                  searchText,
                  timeFilter,
                  dateRange ? dateRange[0] : null,
                  dateRange ? dateRange[1] : null
                );
              },
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
      <ModalViewOrder
        isModalVisible={isViewModalVisible}
        handleCancel={handleViewModalCancel}
        orderData={selectedOrder}
      />
    </Layout>
  );
};

export default OrderAdmin;