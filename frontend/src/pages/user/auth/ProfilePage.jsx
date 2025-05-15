import React, { useState, useEffect } from 'react';
import { Typography, Tabs, Card, Button, Modal, message, Spin, Layout } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import ProfileUpdateForm from '../../../components/profile/ProfileUpdateForm';
import PasswordChangeForm from '../../../components/profile/PasswordChangeForm';
import AddressList from '../../../components/profile/AddressList';
import AddressForm from '../../../components/profile/AddressForm';
import { useAuth } from '../../../context/AuthContext';
import axios from 'axios';

const { Title } = Typography;
const { TabPane } = Tabs;

const ProfilePage = () => {
  const {userInfo} = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddressModalVisible, setIsAddressModalVisible] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Fetch user profile
  const fetchUserProfile = async () => {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    const response = await axios.get('http://localhost:3000/api/users/profile', {
      headers: { Authorization: `Bearer ${token}` },
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
  const token = localStorage.getItem('authToken');
  try {
    const res = await axios.get('http://localhost:3000/api/users/shipping-addresses', {
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true,
    });
    console.log("Addresses fetched:", res.data); // Log dữ liệu trả về từ API
    return res.data;
  } catch (error) {
    console.error("Failed to fetch addresses:", error);
    message.error("Failed to load addresses.");
    return [];
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
      const response = await axios.put('http://localhost:3000/api/users/profile', values, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      setUserData(response.data); // Update the userInfo state with the updated info
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
 
    try {
      const token = localStorage.getItem('authToken');
      await axios.put('http://localhost:3000/api/users/change-password', {
        currentPassword: values.oldPassword,
        newPassword: values.newPassword,
      }, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      message.success("Password changed successfully!");
    } catch (error) {
      message.error("Failed to change password.");
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
      await axios.delete(`http://localhost:3000/api/users/shipping-addresses/${addressId}`, {
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
      await axios.put(`http://localhost:3000/api/users/shipping-addresses/${addressId}/set-default`, null, {
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
        const response = await axios.put(`http://localhost:3000/api/users/shipping-addresses/${editingAddress.id}`, values, {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        });
        const updatedAddress = response.data.address;
        setAddresses(prev => prev.map(addr => addr.id === updatedAddress.id ? updatedAddress : addr));
        message.success("Address updated successfully!");
      } else {
        const response = await axios.post('http://localhost:3000/api/users/shipping-addresses', values, {
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

  if (loading) {
    return <Layout><div className="flex justify-center items-center h-64"><Spin size="large" /></div></Layout>;
  }

  if (!userInfo) {
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
                initialValues={{ fullName: userInfo.fullName, email: userInfo.email }} 
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
