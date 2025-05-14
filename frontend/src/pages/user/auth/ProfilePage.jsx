import React, { useState, useEffect } from 'react';
import { Typography, Tabs, Card, Button, Modal, message, Spin, Layout } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import ProfileUpdateForm from '../../../components/profile/ProfileUpdateForm';
import PasswordChangeForm from '../../../components/profile/PasswordChangeForm';
import AddressList from '../../../components/profile/AddressList';
import AddressForm from '../../../components/profile/AddressForm';
import axios from 'axios';
import Cookies from 'js-cookie'
const { Title } = Typography;
const { TabPane } = Tabs;
const API_URL = import.meta.env.VITE_API_URL;

const ProfilePage = () => {
  const [userData, setUserData] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddressModalVisible, setIsAddressModalVisible] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  // Fetch user profile
  const fetchUserProfile = async () => {
  try {
    const response = await axios.get(`${API_URL}/users/profile`, {
      withCredentials: true, 
    });

    setUserData(response.data);
    return response.data; // <-- Thêm dòng này
  } catch (error) {
    console.error("Error fetching user profile:", error);
  }
};


  // Fetch user addresses
const fetchAddresses = async () => {
  try {
    const response = await axios.get(`${API_URL}/users/shipping-addresses`,{
      withCredentials: true, 
    });

    // Kiểm tra nếu có dữ liệu trả về
    if (response.status === 200 && response.data && response.data.length > 0) {
      return response.data;
    } else {
      console.log('No shipping addresses found or user has not provided any.');
      return [];  // Trả về mảng rỗng nếu không có địa chỉ
    }
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.log('Endpoint for shipping addresses not found.');
    } else {
      console.error('Failed to fetch addresses:', error);
    }
    return [];  // Trả về mảng rỗng nếu có lỗi
  }
};

  // Load user profile and addresses
  useEffect(() => {
    const loadData = async () => {
  setLoading(true);
  try {
    await fetchUserProfile(); // chỉ cần gọi để nó tự setUserData
    const userAddresses = await fetchAddresses();
    setAddresses(userAddresses);
  } catch (error) {
    console.error("Error loading user data:", error);
    message.error("Failed to load user data.");
  } finally {
    setLoading(false);
  }
};
    loadData();
  }, []);

  // Handle profile update
  const handleProfileUpdate = async (values) => {
    setFormLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.put(`${API_URL}/users/profile`, values, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setUserData(response.data); // Update the userData state with the updated info
      message.success("Profile updated successfully!");
    } catch (error) {
      message.error("Failed to update profile.");
    } finally {
      setFormLoading(false);
    }
  };

  // Handle password change
 const handlePasswordChange = async (values) => {
  setFormLoading(true);
  // console.log(values);

  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      message.error('You need to log in first.');
      return;
    }

    const { oldPassword, newPassword } = values;

    if (!oldPassword || !newPassword) {
      message.error('Please fill in all required fields.');
      return;
    }

    // Gửi PUT request KHÔNG GỬI confirmNewPassword
    const response = await axios.put(
      `${API_URL}/users/change-password`,
      { oldPassword, newPassword },  // loại bỏ confirmNewPassword
      {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      }
    );

    if (response.status === 200) {
      message.success('Password changed successfully!');
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to change password.';
    message.error(errorMessage);
  } finally {
    setFormLoading(false);
  }
};



  // Open address modal for adding new address
  const handleAddAddress = () => {
    setEditingAddress(null);
    setIsAddressModalVisible(true);
  };

  // Open address modal for editing an existing address
  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setIsAddressModalVisible(true);
  };

  // Handle address deletion
  const handleDeleteAddress = async (addressId) => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.delete(`${API_URL}/users/shipping-addresses/${addressId}`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setAddresses(prev => prev.filter(addr => addr._id !== addressId));
      message.success("Address deleted successfully!");
    } catch (error) {
      message.error("Failed to delete address.");
    }
  };

  // Handle setting default address
  const handleSetDefaultAddress = async (addressId) => {
    try {
      const token = localStorage.getItem('authToken');
      await axios.put(`${API_URL}/users/shipping-addresses/${addressId}/set-default`, null, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setAddresses(prev => prev.map(addr => ({ ...addr, isDefault: addr.id === addressId })));
      message.success("Default address updated!");
    } catch (error) {
      message.error("Failed to set default address.");
    }
  };

  // Handle address form submit
  const handleAddressFormSubmit = async (values) => {
    setFormLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      if (editingAddress) {
        const response = await axios.put(`${API_URL}/users/shipping-addresses/${editingAddress.id}`, values, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        const updatedAddress = response.data.address;
        setAddresses(prev => prev.map(addr => addr.id === updatedAddress.id ? updatedAddress : addr));
        message.success("Address updated successfully!");
      } else {
        const response = await axios.post(`${API_URL}/users/shipping-addresses`, values, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        const newAddress = response.data.address;
        setAddresses(prev => [...prev, newAddress]);
        message.success("Address added successfully!");
      }
      setIsAddressModalVisible(false);
      setEditingAddress(null);
    } catch (error) {
      message.error("Failed to save address.");
    } finally {
      setFormLoading(false);
    }
  };

  // Loading spinner while data is being fetched
  if (loading) {
    return <Layout><div className="flex justify-center items-center h-64"><Spin size="large" /></div></Layout>;
  }

  if (!userData) {
    return <Layout><div className="text-center p-8">Failed to load user data.</div></Layout>;
  }

  return (
    <Layout>
      <div className="container mx-auto p-4 md:p-8">
        <Title level={2} className="mb-6">My Profile</Title>
        <Tabs defaultActiveKey="1" tabPosition="top">
          <TabPane tab="Personal Information" key="1">
            <Card title="Edit Your Information" className="shadow-md">
              <ProfileUpdateForm 
                initialValues={{ fullName: userData.fullName, email: userData.email }} 
                onFinish={handleProfileUpdate}
                loading={formLoading}
              />
            </Card>
          </TabPane>
          <TabPane tab="Delivery Addresses" key="2">
            <Card title="Manage Your Addresses" className="shadow-md">
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={handleAddAddress} 
                className="mb-4 bg-green-500 hover:bg-green-600"
              >
                Add New Address
              </Button>
              <AddressList 
                addresses={addresses} 
                onEdit={handleEditAddress} 
                onDelete={handleDeleteAddress}
                onSetDefault={handleSetDefaultAddress}
              />
            </Card>
          </TabPane>
          <TabPane tab="Change Password" key="3">
            <Card title="Update Your Password" className="shadow-md">
              <PasswordChangeForm onFinish={handlePasswordChange} loading={formLoading} />
            </Card>
          </TabPane>
        </Tabs>

        <Modal
          title={editingAddress ? "Edit Address" : "Add New Address"}
          visible={isAddressModalVisible}
          onCancel={() => setIsAddressModalVisible(false)}
          footer={null}
          destroyOnClose
        >
          <AddressForm 
            initialValues={editingAddress || { isDefault: addresses.length === 0 }}
            onFinish={handleAddressFormSubmit}
            onCancel={() => setIsAddressModalVisible(false)}
            loading={formLoading}
          />
        </Modal>
      </div>
    </Layout>
  );
};

export default ProfilePage;
