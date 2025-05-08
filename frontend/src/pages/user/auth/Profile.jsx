import React, { useEffect, useState } from 'react';
import { Form, Input, Button, message, Typography, Card, Space, List, Modal } from 'antd';
import axios from 'axios';

const { Title } = Typography;

const ProfilePage = () => {
  const [form] = Form.useForm();
  const [user, setUser] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [newAddress, setNewAddress] = useState('');
  const [editingAddress, setEditingAddress] = useState('');
  const [editingItem, setEditingItem] = useState(null); // { id, index }

  const token = localStorage.getItem('authToken');

  // Lấy thông tin người dùng
  const fetchUser = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/users/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
      console.log(res.data)
      form.setFieldsValue({ fullName: res.data.fullName, email: res.data.email });
      setAddresses(res.data.addresses || []);
    } catch (err) {
      message.error('Không thể tải thông tin người dùng.');
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  // Cập nhật thông tin cá nhân
  const handleUpdateProfile = async (values) => {
    try {
      await axios.put('http://localhost:3000/api/users/profile', values, {
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success('Cập nhật thông tin thành công.');
      fetchUser();
    } catch (err) {
      message.error('Cập nhật thất bại.');
    }
  };

  // Thêm địa chỉ mới
  const handleAddAddress = async () => {
    if (!newAddress.trim()) return;
    try {
      const res = await axios.post('http://localhost:3000/api/users/shipping-addresses', {
        address: newAddress.trim(),
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success('Thêm địa chỉ thành công.');
      setNewAddress('');
      fetchUser();
    } catch (err) {
      message.error('Thêm địa chỉ thất bại.');
    }
  };

  // Bắt đầu chỉnh sửa địa chỉ
  const startEdit = (addressId, index, value) => {
    setEditingItem({ id: addressId, index });
    setEditingAddress(value);
  };

  // Xác nhận chỉnh sửa
  const confirmEdit = async () => {
    if (!editingItem?.id || !editingAddress.trim()) return;
    try {
      await axios.put(`http://localhost:3000/api/users/shipping-addresses/${editingItem.id}`, {
        address: editingAddress.trim(),
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success('Cập nhật địa chỉ thành công.');
      setEditingItem(null);
      setEditingAddress('');
      fetchUser();
    } catch (err) {
      message.error('Cập nhật địa chỉ thất bại.');
    }
  };

  // Xóa địa chỉ
  const handleDeleteAddress = async (addressId) => {
    try {
      await axios.delete(`http://localhost:3000/api/users/shipping-addresses/${addressId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success('Xoá địa chỉ thành công.');
      fetchUser();
    } catch (err) {
      message.error('Xoá địa chỉ thất bại.');
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
      <Title level={3}>Quản lý tài khoản cá nhân</Title>

      <Card title="Thông tin cá nhân" style={{ marginBottom: 24 }}>
        <Form form={form} layout="vertical" onFinish={handleUpdateProfile}>
          <Form.Item label="Họ tên" name="fullName" rules={[{ required: true }]}>
            {console.log(form.getFieldsValue())}
            <Input />
          </Form.Item>
          <Form.Item label="Email" name="email" rules={[{ required: true, type: 'email' }]}>
            <Input disabled />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">Cập nhật</Button>
          </Form.Item>
        </Form>
      </Card>

      <Card title="Địa chỉ giao hàng">
        <Space style={{ marginBottom: 16 }}>
          <Input
            placeholder="Nhập địa chỉ mới"
            value={newAddress}
            onChange={(e) => setNewAddress(e.target.value)}
          />
          <Button type="primary" onClick={handleAddAddress}>Thêm</Button>
        </Space>

        <List
  bordered
  dataSource={addresses.filter(item => item && item.address)}
  renderItem={(item, index) => (
    <List.Item
      key={item._id || `address-${index}`}
      actions={[
        <Button type="link" onClick={() => startEdit(index)}>Sửa</Button>,
        <Button danger type="link" onClick={() => handleDeleteAddress(index)}>Xoá</Button>
      ]}
    >
      {item.address}
    </List.Item>
  )}
/>


      </Card>

      <Modal
        open={editingItem !== null}
        title="Chỉnh sửa địa chỉ"
        onOk={confirmEdit}
        onCancel={() => setEditingItem(null)}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Input
          value={editingAddress}
          onChange={(e) => setEditingAddress(e.target.value)}
        />
      </Modal>
    </div>
  );
};

export default ProfilePage;
