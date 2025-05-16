import { useState, useEffect } from "react";
import {
  Typography,
  Tabs,
  Button,
  Modal,
  message,
  Spin,
  Layout,
  Avatar,
  Divider,
  Badge,
} from "antd";
import {
  PlusOutlined,
  UserOutlined,
  HomeOutlined,
  LockOutlined,
  EditOutlined,
  StarOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import ProfileUpdateForm from "../../../components/profile/ProfileUpdateForm";
import PasswordChangeForm from "../../../components/profile/PasswordChangeForm";
import AddressList from "../../../components/profile/AddressList";
import AddressForm from "../../../components/profile/AddressForm";
import { useAuth } from "../../../context/AuthContext";
import axios from "axios";

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Content } = Layout;

const ProfilePage = () => {
  const {
    userInfo,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    addInfo,
    updateInfo,
    changePassword,
  } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isAddressModalVisible, setIsAddressModalVisible] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("1");

  useEffect(() => {
    if (userInfo?.id) {
      setLoading(false);
    }
  }, [userInfo?.id]);

  const handleProfileUpdate = async (values) => {
    setFormLoading(true);
    try {
      await updateInfo(values);
    } catch (err) {
      setFormLoading(false);
    } finally {
      setFormLoading(false);
    }
  };

  const handlePasswordChange = async (values) => {
    setFormLoading(true);
    try {
      await changePassword(values);
    } catch (err) {
      setFormLoading(false);
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

  const handleAddressFormSubmit = async (values) => {
    setFormLoading(true);
    try {
      if (editingAddress) {
        await updateAddress(values);
      } else {
        await addAddress(values);
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
    return (
      <Layout className="min-h-screen bg-gray-50">
        <Content className="flex justify-center items-center h-screen">
          <div className="flex flex-col items-center">
            <Spin size="large" />
            <Text className="mt-4 text-gray-500">Loading your profile...</Text>
          </div>
        </Content>
      </Layout>
    );
  }

  if (!userInfo) {
    return (
      <Layout className="min-h-screen bg-gray-50">
        <Content className="p-8">
          <div className="text-center p-8 bg-white rounded-lg shadow-md">
            <Title level={4} className="text-gray-700">
              Failed to load profile data
            </Title>
            <Text className="text-gray-500">
              Please try again later or contact support
            </Text>
            <Button
              type="primary"
              className="mt-4 bg-blue-500 hover:bg-blue-600"
            >
              Refresh Page
            </Button>
          </div>
        </Content>
      </Layout>
    );
  }

  const formatLoyaltyPoints = (points) => {
    return new Intl.NumberFormat().format(points);
  };

  return (
    <Layout className="min-h-screen bg-gray-50">
      <Content className="py-8 px-4 md:px-0">
        <div className="max-w-6xl mx-auto">
          {/* Profile Header */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex flex-col md:flex-row items-center md:items-start">
              <div className="mb-4 md:mb-0 md:mr-6">
                <Avatar
                  size={96}
                  icon={<UserOutlined />}
                  className="bg-blue-500"
                />
              </div>
              <div className="flex-1 text-center md:text-left">
                <Title level={2} className="mb-1">
                  {userInfo.fullName}
                </Title>
                <Text className="text-gray-500 block mb-2">
                  {userInfo.email}
                </Text>

                <div className="mt-3 flex flex-wrap justify-center items-center md:justify-start gap-4">
                  <div className="flex items-center bg-blue-50 text-blue-700 px-4 py-2 rounded-full">
                    <EnvironmentOutlined className="mr-1" />
                    <span>
                      {userInfo?.addresses.length} Saved Address
                      {userInfo?.addresses.length !== 1 ? "es" : ""}
                    </span>
                  </div>
                  <Badge
                    count={formatLoyaltyPoints(userInfo.loyaltyPoints)}
                    overflowCount={9999999}
                    showZero
                  >
                    <div className="flex items-center bg-amber-50 text-amber-700 px-4 py-3 rounded-full">
                      <StarOutlined className="mr-1" />
                      <span>Loyalty Points</span>
                    </div>
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs Section */}
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            type="card"
            className="bg-white rounded-lg shadow-md profile-tabs"
          >
            <TabPane
              tab={
                <span className="px-1">
                  <UserOutlined className="mr-2" />
                  Personal Information
                </span>
              }
              key="1"
            >
              <div className="p-6">
                <Title level={4} className="mb-4 justify-center flex">
                  Edit Your Information
                </Title>
                <Divider className="my-4" />
                <div className="max-wl-lg justify-center flex">
                  <ProfileUpdateForm
                    initialValues={{
                      fullName: userInfo.fullName,
                      email: userInfo.email,
                    }}
                    onFinish={handleProfileUpdate}
                    loading={formLoading}
                  />
                </div>
              </div>
            </TabPane>

            <TabPane
              tab={
                <span className="px-1">
                  <HomeOutlined className="mr-2" />
                  Delivery Addresses
                </span>
              }
              key="2"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <Title level={4} className="mb-0">
                    Manage Your Addresses
                  </Title>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAddAddress}
                    className="bg-blue-500 hover:bg-blue-600 border-blue-500 flex items-center"
                  >
                    Add New Address
                  </Button>
                </div>
                <Divider className="my-4" />
                {userInfo.addresses.length > 0 ? (
                  <AddressList
                    addresses={userInfo.addresses}
                    onEdit={handleEditAddress}
                    onDelete={deleteAddress}
                    onSetDefault={setDefaultAddress}
                  />
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <EnvironmentOutlined className="text-4xl text-gray-400 mb-3" />
                    <Title level={5} className="text-gray-500">
                      No addresses saved yet
                    </Title>
                    <Text className="text-gray-500 block mb-4">
                      Add your first delivery address to make checkout faster
                    </Text>
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={handleAddAddress}
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      Add New Address
                    </Button>
                  </div>
                )}
              </div>
            </TabPane>

            <TabPane
              tab={
                <span className="px-1">
                  <LockOutlined className="mr-2" />
                  Security
                </span>
              }
              key="3"
            >
              <div className="p-6">
                <Title level={4} className="mb-4 flex justify-center">
                  Update Your Password
                </Title>
                <Divider className="my-4" />
                <div className="max-w-lg mx-auto">
                  <PasswordChangeForm
                    onFinish={handlePasswordChange}
                    loading={formLoading}
                    isDefaultPassword={userInfo.isDefaultPassword}
                  />
                </div>
              </div>
            </TabPane>
          </Tabs>
        </div>
      </Content>

      <Modal
        title={
          <div className="flex items-center">
            {editingAddress ? (
              <EditOutlined className="mr-2" />
            ) : (
              <PlusOutlined className="mr-2" />
            )}
            {editingAddress ? "Edit Address" : "Add New Address"}
          </div>
        }
        open={isAddressModalVisible}
        onCancel={() => setIsAddressModalVisible(false)}
        footer={null}
        destroyOnHidden
        width={600}
        className="top-0 mt-7"
      >
        <AddressForm
          initialValues={editingAddress}
          onSubmit={handleAddressFormSubmit}
          onCancel={() => setIsAddressModalVisible(false)}
          loading={formLoading}
        />
      </Modal>
    </Layout>
  );
};

export default ProfilePage;
