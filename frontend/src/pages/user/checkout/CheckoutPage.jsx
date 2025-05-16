import React, { useState, useEffect } from "react";
import {
  Steps,
  Button,
  message,
  Row,
  Col,
  Card,
  Typography,
  Form,
  Input,
  Radio,
  Result,
  Spin,
  Layout,
  Select,
  Divider,
} from "antd";
import { Link, useNavigate } from "react-router-dom";
import CartSummary from "../../../components/cart/CartSummary";
import { useCart } from "../../../context/CartContext";
import { useAuth } from "../../../context/AuthContext";
import AddressForm from "../../../components/checkout/AddressForm";
import AddressSelector from "../../../components/checkout/AddressSelector";
const { Step } = Steps;
const { Title } = Typography;
const { Option } = Select;

const paymentMethods = [
  { value: "credit_card", label: "Credit/Debit Card" },
  { value: "paypal", label: "PayPal" },
  { value: "cod", label: "Cash on Delivery" },
];

const CheckoutPage = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [currentStep, setCurrentStep] = useState(0);
  const [shippingForm] = Form.useForm();
  const [paymentForm] = Form.useForm();
  const { cartItems, total, cartItemCount, discountInfo, placeOrder } =
    useCart();
  const {
    isLoggedIn,
    userInfo,
    updateAddress,
    addAddress,
    deleteAddress,
    addresses,
  } = useAuth();
  const navigate = useNavigate();
  const [orderProcessing, setOrderProcessing] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [addressMode, setAddressMode] = useState("select");
  const [editingAddress, setEditingAddress] = useState(null);
  const [fullName, setFullName] = useState(null);
  const [email, setEmail] = useState(null);

  // Load cart and address data
  useEffect(() => {
    if (cartItemCount === 0 && currentStep < 2) {
      messageApi.info("Your cart is empty. Add items to proceed to checkout.");
      navigate("/cart");
    }
  }, [isLoggedIn, cartItemCount, currentStep, navigate]);

  useEffect(() => {
    shippingForm.setFieldsValue({
      fullName: userInfo?.fullName,
      email: userInfo?.email,
    });
  }, [userInfo?.id]);

  const handleAddNewAddress = () => {
    setAddressMode("new");
    const currentValues = shippingForm.getFieldsValue(true);
    shippingForm.setFieldsValue({
      ...currentValues,
      address: undefined,
    });
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
    setAddressMode("edit");
  };

  const handleSaveAddress = async (newAddress) => {
    try {
      if (addressMode === "edit") {
        await updateAddress(newAddress);
      } else {
        console.log("CHECKOUT", newAddress);
        await addAddress(newAddress);
      }

      setAddressMode("select");
      setEditingAddress(null);

      const savedAddress = addresses.find(
        (a) => a.fullAddress === newAddress.fullAddress
      );
      if (savedAddress) {
        shippingForm.setFieldValue("address", savedAddress._id);
      }
    } catch (error) {
      messageApi.error("Failed to save address");
    }
  };

  const handleDeleteAddress = async (userId, addressId) => {
    try {
      await deleteAddress(userId, addressId);
    } catch (error) {
      messageApi.error("Failed to delete address");
    }
  };

  const renderAddressSelector = () => {
    switch (addressMode) {
      case "new": {
        return (
          <AddressForm
            form={shippingForm}
            onSubmit={handleSaveAddress}
            onCancel={() => setAddressMode("select")}
            loadingAddresses={loadingAddresses}
            setLoadingAddresses={setLoadingAddresses}
          />
        );
      }
      case "edit": {
        return (
          <AddressForm
            form={shippingForm}
            initialValues={editingAddress}
            onSubmit={handleSaveAddress}
            onCancel={() => setAddressMode("select")}
            loadingAddresses={loadingAddresses}
            setLoadingAddresses={setLoadingAddresses}
          />
        );
      }
      default:
        return (
          <AddressSelector
            form={shippingForm}
            addresses={addresses}
            loading={loadingAddresses}
            onSelect={(value) =>
              shippingForm.setFieldsValue({ address: value })
            }
            onAddNew={handleAddNewAddress}
            onEdit={handleEditAddress}
            onDelete={handleDeleteAddress}
          />
        );
    }
  };

  const handleNext = async () => {
    if (currentStep === 0) {
      setEmail(shippingForm.getFieldValue("email"));
      setFullName(shippingForm.getFieldValue("fullName"));
      setCurrentStep(currentStep + 1);
    } else if (currentStep === 1) {
      try {
        setOrderProcessing(true);

        const shippingValues = shippingForm.getFieldsValue();

        let shippingAddress;

        if (addressMode === "select") {
          const selectedAddress = addresses.find(
            (addr) => addr.id === shippingValues.address
          );
          shippingAddress = selectedAddress;
        } else {
          shippingAddress = shippingValues;
        }

        const mockOrder = {
          userInfo: {
            userId: userInfo._id || userInfo.id,
            fullName: fullName,
            email: email,
          },
          products: cartItems,
          totalAmount: Number(total),
          shippingAddress,
          paymentMethod: paymentForm.getFieldValue("paymentMethod"),
          discountInfo: discountInfo && {
            discountId: discountInfo._id,
            code: discountInfo.code,
            value: discountInfo.value,
            type: discountInfo.type,
          },
          date: new Date().toLocaleDateString(),
        };
        
        console.log(mockOrder);
        const ordersData = await placeOrder(mockOrder);

        setOrderDetails(ordersData);
        setCurrentStep(currentStep + 1);
        console.log(23, ordersData);
      } catch (error) {
        console.log("Validation Failed:", error);
        messageApi.error(
          error.response.data?.message || error.response.message
        );
        setOrderProcessing(false);
      } finally {
        setOrderProcessing(false);
      }
    }
  };

  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
  };

  const steps = [
    {
      title: "Shipping",
      content: (
        <Card
          title="Shipping Details"
          variant="borderless"
          className="shadow-none"
        >
          <Form
            form={shippingForm}
            layout="vertical"
            initialValues={{ address: addresses || null }}
          >
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Form.Item
                  name="fullName"
                  label="Full Name"
                  rules={[
                    { required: true, message: "Please enter your full name" },
                  ]}
                >
                  <Input placeholder="Your full name" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    { required: true, message: "Please enter your email" },
                    { type: "email", message: "Please enter a valid email" },
                  ]}
                >
                  <Input placeholder="your.email@example.com" />
                </Form.Item>
              </Col>
              <Col span={24}>{renderAddressSelector()}</Col>
            </Row>
          </Form>
          <Divider />
        </Card>
      ),
    },
    {
      title: "Payment",
      content: (
        <Card
          title="Payment Method"
          variant="borderless"
          className="shadow-none"
        >
          <Form
            form={paymentForm}
            layout="vertical"
            initialValues={{ paymentMethod: "credit_card" }}
          >
            <Form.Item
              name="paymentMethod"
              label="Select Payment Method"
              rules={[
                { required: true, message: "Please select payment method" },
              ]}
            >
              <Radio.Group
                value={paymentForm.getFieldValue("paymentMethod")}
                onChange={(e) => {
                  paymentForm.setFieldsValue({ paymentMethod: e.target.value });
                }}
              >
                {paymentMethods.map((method) => (
                  <Radio
                    key={method.value}
                    value={method.value}
                    style={{ display: "block", marginBottom: 8 }}
                  >
                    {method.label}
                  </Radio>
                ))}
              </Radio.Group>
            </Form.Item>
            <Divider />
          </Form>
        </Card>
      ),
    },
    {
      title: "Confirmation",
      content: orderProcessing ? (
        <div className="text-center py-10">
          <Spin size="large" tip="Processing your order..." />
        </div>
      ) : orderDetails ? (
        <Result
          status="success"
          title="Order Placed Successfully!"
          subTitle={`Order number: ${orderDetails.orderCode}. We've sent a confirmation to ${orderDetails.userInfo.email}.`}
          extra={[
            <Link to="/products" key="continue">
              <Button type="primary">Continue Shopping</Button>
            </Link>,
            <Link to="/myorder" key="orders">
              <Button>View Orders</Button>
            </Link>,
          ]}
        />
      ) : (
        <Result
          status="error"
          title="Order Failed"
          subTitle="Sorry, something went wrong during checkout. Please try again."
          extra={
            <Button type="primary" onClick={() => setCurrentStep(1)}>
              Back to Payment
            </Button>
          }
        />
      ),
    },
  ];

  return (
    <Layout className="bg-gray-50 min-h-screen">
      {contextHolder}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Title level={2} className="text-center mb-8">
          Checkout
        </Title>

        <Steps current={currentStep} className="mb-8">
          {steps.map((step) => (
            <Step key={step.title} title={step.title} />
          ))}
        </Steps>

        <Row gutter={[24, 24]}>
          <Col xs={24} lg={currentStep < 2 ? 16 : 24}>
            <div className="bg-white rounded-lg p-6">
              {steps[currentStep].content}
              <div className="flex justify-between mt-8">
                {currentStep > 0 && currentStep < 2 && (
                  <Button onClick={handlePrev}>Back</Button>
                )}

                <div>
                  {currentStep < steps.length - 1 && (
                    <Button
                      type="primary"
                      onClick={handleNext}
                      loading={currentStep === 1 && orderProcessing}
                    >
                      {currentStep === 1 ? "Place Order" : "Continue"}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Col>

          {currentStep < 2 && (
            <Col xs={24} lg={8}>
              <CartSummary showCheckoutButton={false} />
            </Col>
          )}
        </Row>
      </div>
    </Layout>
  );
};

export default CheckoutPage;
