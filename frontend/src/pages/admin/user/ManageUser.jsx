import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  message,
  Popconfirm,
  Typography,
  Layout,
  Breadcrumb,
} from "antd";
import axios from "axios";
import { Content } from "antd/es/layout/layout";
import { DashboardOutlined } from "@ant-design/icons";

const { Title } = Typography;

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  // Lấy danh sách người dùng từ backend
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("authToken"); // Hoặc sessionStorage.getItem('token')
      const res = await axios.get("http://localhost:3000/api/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`, // Gửi token trong header
        },
      });
      console.log("Response data:", res.data);
      setUsers(res.data || []);
    } catch (err) {
      console.error(err.response?.data || err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Chỉnh sửa thông tin người dùng
  const handleEdit = (record) => {
    setEditingUser(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  // Xóa người dùng
  const handleDelete = async (userId) => {
    try {
      await axios.delete(`http://localhost:3000/api/admin/users/${userId}`);
      message.success("Xoá người dùng thành công");
      fetchUsers();
    } catch (err) {
      message.error("Không thể xoá người dùng");
    }
  };

  // Cập nhật thông tin người dùng
  const handleUpdate = async (values) => {
    try {
      await axios.put(
        `http://localhost:3000/api/admin/users/${editingUser._id}`,
        values
      );
      message.success("Cập nhật thành công");
      setIsModalVisible(false);
      fetchUsers();
    } catch (err) {
      message.error("Cập nhật thất bại");
    }
  };

  // Ban người dùng
  const handleBan = async (userId) => {
    try {
      const token = localStorage.getItem("authToken");
      await axios.put(
        `http://localhost:3000/api/admin/users/${userId}/ban`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      message.success("Người dùng đã bị cấm");
      fetchUsers();
    } catch (err) {
      message.error("Không thể ban người dùng");
    }
  };

  // Gỡ ban người dùng
  const handleUnban = async (userId) => {
    try {
      const token = localStorage.getItem("authToken");
      await axios.put(
        `http://localhost:3000/api/admin/users/${userId}/unban`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      message.success("Người dùng đã được gỡ ban");
      fetchUsers();
    } catch (err) {
      message.error("Không thể gỡ ban người dùng");
    }
  };

  const columns = [
    { title: "Name", dataIndex: "fullName", key: "fullName" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Role", dataIndex: "role", key: "role" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (text, record) => (
        <span>{record.isBanned ? "Banned" : "Active"}</span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button onClick={() => handleEdit(record)}>Chỉnh sửa</Button>
          <Popconfirm
            title="Are you sure you want to delete?"
            onConfirm={() => handleDelete(record._id)}
          >
            <Button danger>Delete</Button>
          </Popconfirm>
          {record.isBanned ? (
            <Button onClick={() => handleUnban(record._id)} type="primary">
              Gỡ Ban
            </Button>
          ) : (
            <Button onClick={() => handleBan(record._id)} danger>
              Cấm
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Layout className="min-h-screen">
      <Content className="p-4 md:p-6 bg-white">
        <Breadcrumb className="mb-4">
          <Breadcrumb.Item href="#">
            <DashboardOutlined /> Dashboard
          </Breadcrumb.Item>
          <Breadcrumb.Item>Users</Breadcrumb.Item>
        </Breadcrumb>
        <Title level={3}>User Management</Title>
        <Table rowKey="_id" dataSource={users} columns={columns} />

        <Modal
          title="Edit User"
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          onOk={() => form.submit()}
          okText="Update"
          cancelText="Cancel"
        >
          <Form form={form} layout="vertical" onFinish={handleUpdate}>
            <Form.Item
              label="Name"
              name="fullName"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
            <Form.Item label="Email" name="email" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item label="Role" name="role">
              <Input />
            </Form.Item>
          </Form>
        </Modal>
      </Content>
    </Layout>
  );
};

export default ManageUsers;
