import React, { useState, useEffect } from 'react';
import { Typography, Tabs, Card, Button, Modal, message, Spin, Layout } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import ProfileUpdateForm from '../../../components/profile/ProfileUpdateForm';
import PasswordChangeForm from '../../../components/profile/PasswordChangeForm';
import AddressList from '../../../components/profile/AddressList';
import AddressForm from '../../../components/profile/AddressForm';
// import { fetchUserProfile, updateUserProfile, changePassword, fetchAddresses, addAddress, updateAddress, deleteAddress, setDefaultAddress } from '../services/userService'; // API service calls

const { Title } = Typography;
const { TabPane } = Tabs;

const ProfilePage = () => {
  const [userData, setUserData] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddressModalVisible, setIsAddressModalVisible] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Dummy data - replace with API calls
  const mockUser = { id: 1, fullName: 'Jane Doe', email: 'jane.doe@example.com' };
  const mockAddresses = [
    { id: 'addr1', label: 'Home', fullAddress: '123 Willow Creek, Springfield, IL', contactNumber: '555-0101', isDefault: true },
    { id: 'addr2', label: 'Work', fullAddress: '456 Business Rd, Commerce City, IL', contactNumber: '555-0102', isDefault: false },
  ];

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // const user = await fetchUserProfile();
        // const userAddresses = await fetchAddresses();
        // setUserData(user);
        // setAddresses(userAddresses);
        setUserData(mockUser);
        setAddresses(mockAddresses);
      } catch (error) {
        message.error("Failed to load profile data.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleProfileUpdate = async (values) => {
    setFormLoading(true);
    try {
      // const updatedUser = await updateUserProfile(values);
      // setUserData(updatedUser);
      setUserData(prev => ({ ...prev, ...values })); // Optimistic update
      message.success("Profile updated successfully!");
    } catch (error) {
      message.error("Failed to update profile.");
    } finally {
      setFormLoading(false);
    }
  };

  const handlePasswordChange = async (values) => {
    setFormLoading(true);
    try {
      // await changePassword(values);
      message.success("Password changed successfully!");
      // Optionally, log out user or clear password form
    } catch (error) {
      message.error(error.message || "Failed to change password.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleAddAddress = () => {
    setEditingAddress(null);
    setIsAddressModalVisible(true);
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setIsAddressModalVisible(true);
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      // await deleteAddress(addressId);
      setAddresses(prev => prev.filter(addr => addr.id !== addressId));
      message.success("Address deleted successfully!");
    } catch (error) {
      message.error("Failed to delete address.");
    }
  };
  
  const handleSetDefaultAddress = async (addressId) => {
    try {
      // await setDefaultAddress(addressId);
      setAddresses(prev => prev.map(addr => ({ ...addr, isDefault: addr.id === addressId })));
      message.success("Default address updated!");
    } catch (error) {
      message.error("Failed to set default address.");
    }
  };

  const handleAddressFormSubmit = async (values) => {
    setFormLoading(true);
    try {
      if (editingAddress) {
        // const updated = await updateAddress(editingAddress.id, values);
        // setAddresses(prev => prev.map(addr => addr.id === editingAddress.id ? updated : addr));
        setAddresses(prev => prev.map(addr => addr.id === editingAddress.id ? { ...addr, ...values } : addr));
        message.success("Address updated successfully!");
      } else {
        // const newAddress = await addAddress(values);
        // setAddresses(prev => [...prev, newAddress]);
        const newAddr = { id: `addr${Date.now()}`, ...values };
        setAddresses(prev => [...prev, newAddr]);
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
           {/* Add more tabs as needed, e.g., Order History */}
        </Tabs>

        <Modal
          title={editingAddress ? "Edit Address" : "Add New Address"}
          visible={isAddressModalVisible}
          onCancel={() => setIsAddressModalVisible(false)}
          footer={null}
          destroyOnClose
        >
          <AddressForm 
            initialValues={editingAddress || { isDefault: addresses.length === 0}}
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