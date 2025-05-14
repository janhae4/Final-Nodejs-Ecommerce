import React, { useState, useEffect, useRef } from "react";
import {
  Layout,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Space,
  Popconfirm,
  Card,
  Typography,
  Tag,
  Row,
  Col,
  Breadcrumb,
  Divider,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  SearchOutlined,
  DashboardOutlined,
  UserOutlined,
  LockOutlined,
  UnlockOutlined,
} from "@ant-design/icons";
import axios from "axios";
import debounce from "debounce";

const { Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();

  // Debounced search function
  const debouncedFetchRef = useRef(
    debounce((value, page, pageSize) => {
      fetchUsers(page, pageSize, value);
    }, 500)
  );

  // Fetch users from backend with pagination and search
  const fetchUsers = async (page = 1, pageSize = 20, search = "") => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken");

      console.log("Token đang được gửi:", token); // Log token để kiểm tra giá trị

      let url = `http://localhost:3000/api/admin/users?page=${page}&limit=${pageSize}`;

      if (search && search.trim() !== "") {
        url += `&search=${encodeURIComponent(search)}`;
      }

      const res = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });

      setUsers(res.data || []);
      setPagination({
        current: page,
        pageSize: pageSize,
        total: res.data.totalCount || 0,
      });

      setLoading(false);
    } catch (err) {
      console.error("Lỗi fetch:", err.response?.data || err);
      messageApi.error("Failed to fetch users");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(page, pageSize, searchText);
  }, [page, pageSize]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchText(value);
    debouncedFetchRef.current(value, page, pageSize);
  };

  const showModal = (record = null) => {
    if (record) {
      setEditingUser(record);
      form.setFieldsValue({
        fullName: record.fullName,
        email: record.email,
        role: record.role,
      });
    } else {
      setEditingUser(null);
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  // Update user
  const handleUpdate = async () => {
    try {
      const values = await form.validateFields();
      const token = localStorage.getItem("authToken");

      await axios.put(
        `http://localhost:3000/api/admin/users/${editingUser._id}`,
        values,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === editingUser._id ? { ...user, ...values } : user
        )
      );
      messageApi.success("User updated successfully");
      setIsModalVisible(false);
    } catch (err) {
      messageApi.error(err.response?.data?.message || "Failed to update user");
    }
  };

  // Delete user
  const handleDelete = async (userId) => {
    try {
      const token = localStorage.getItem("authToken");

      await axios.delete(`http://localhost:3000/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      messageApi.success("User deleted successfully");
      setUsers((prevUsers) => prevUsers.filter((user) => user._id !== userId));
    } catch (err) {
      messageApi.error("Unable to delete user");
    }
  };

  // Ban user
  const handleBan = async (userId) => {
    try {
      const token = localStorage.getItem("authToken");

      await axios.put(
        `http://localhost:3000/api/admin/users/${userId}/ban`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      messageApi.success("User has been banned");
      fetchUsers(page, pageSize, searchText);
    } catch (err) {
      messageApi.error("Unable to ban user");
    }
  };

  // Unban user
  const handleUnban = async (userId) => {
    try {
      const token = localStorage.getItem("authToken");

      await axios.put(
        `http://localhost:3000/api/admin/users/${userId}/unban`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      messageApi.success("User has been unbanned");
      fetchUsers(page, pageSize, searchText);
    } catch (err) {
      messageApi.error("Unable to unban user");
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "fullName",
      key: "fullName",
      render: (text) => <Text strong>{text}</Text>,
      sorter: (a, b) => a.fullName.localeCompare(b.fullName),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      sorter: (a, b) => a.email.localeCompare(b.email),
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role) => {
        switch (role) {
          case "admin":
            return <Tag color="red">Admin</Tag>;
          case "moderator":
            return <Tag color="blue">Moderator</Tag>;
          case "user":
            return <Tag color="green">User</Tag>;
          default:
            return <Tag color="default">{role}</Tag>;
        }
      },
      filters: [
        { text: "Admin", value: "admin" },
        { text: "Moderator", value: "moderator" },
        { text: "User", value: "user" },
      ],
      onFilter: (value, record) => record.role === value,
    },
    {
      title: "Status",
      dataIndex: "isBanned",
      key: "status",
      render: (isBanned) =>
        isBanned ? (
          <Tag color="error">Banned</Tag>
        ) : (
          <Tag color="success">Active</Tag>
        ),
      filters: [
        { text: "Active", value: false },
        { text: "Banned", value: true },
      ],
      onFilter: (value, record) => record.isBanned === value,
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
            title="Are you sure you want to delete this user?"
            description="This action cannot be undone."
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger icon={<DeleteOutlined />} size="small">
              Delete
            </Button>
          </Popconfirm>
          {record.isBanned ? (
            <Button
              type="primary"
              icon={<UnlockOutlined />}
              size="small"
              onClick={() => handleUnban(record._id)}
              className="bg-green-500"
            >
              Unban
            </Button>
          ) : (
            <Button
              danger
              icon={<LockOutlined />}
              size="small"
              onClick={() => handleBan(record._id)}
            >
              Ban
            </Button>
          )}
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
          <Breadcrumb.Item>Users</Breadcrumb.Item>
        </Breadcrumb>

        <Title level={2} className="mb-6">
          User Management
        </Title>

        <Card className="mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start mb-4">
            <Title level={4} className="mb-4 md:mb-0">
              Users List
            </Title>

            <div className="w-full md:w-auto flex flex-col mt-4 md:mt-0 md:flex-row gap-4 items-start">
              <Input
                placeholder="Search by name or email"
                value={searchText}
                onChange={handleSearchChange}
                prefix={<SearchOutlined />}
                className="w-full md:w-64"
              />
              <Button
                type="primary"
                icon={<ReloadOutlined />}
                onClick={() => fetchUsers(page, pageSize, searchText)}
                className="bg-blue-500"
              >
                Refresh
              </Button>
            </div>
          </div>

          <Table
            columns={columns}
            dataSource={users}
            rowKey="_id"
            loading={loading}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} users`,
              onChange: (page, pageSize) => {
                setPage(page);
                setPageSize(pageSize);
                fetchUsers(page, pageSize, searchText);
              },
            }}
            scroll={{ x: "max-content" }}
            className="overflow-x-auto"
          />
        </Card>
      </Content>

      {/* Edit User Modal */}
      <Modal
        title={"Edit User"}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={handleUpdate}
            className="bg-blue-500"
          >
            {editingUser ? "Update" : "Add"}
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="fullName"
            label="Full Name"
            rules={[
              { required: true, message: "Please enter the user's name" },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="Full Name" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: "Please enter an email" },
              { type: "email", message: "Please enter a valid email" },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="Email" />
          </Form.Item>

          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: "Please select a role" }]}
          >
            <Select placeholder="Select a role">
              <Option value="admin">Admin</Option>
              <Option value="moderator">Moderator</Option>
              <Option value="user">User</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  );
};

export default ManageUsers;
