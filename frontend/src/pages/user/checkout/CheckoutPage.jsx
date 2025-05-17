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
import AddressSelector from "../../../components/checkout/AddressSelector";
import provinces from "hanhchinhvn/dist/tinh_tp.json";
import districts from "hanhchinhvn/dist/quan_huyen.json";
import wards from "hanhchinhvn/dist/xa_phuong.json";
const { Step } = Steps;
const { Title } = Typography;
const { Option } = Select;

const paymentMethods = [
  { value: "credit_card", label: "Credit/Debit Card" },
  { value: "paypal", label: "PayPal" },
  { value: "cod", label: "Cash on Delivery" },
];

const CheckoutPage = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [shippingForm] = Form.useForm();
  const [addressForm] = Form.useForm();
  const [paymentForm] = Form.useForm();
  const { cartItems, total, cartItemCount, discountInfo, placeOrder } =
    useCart();
  const { isLoggedIn, userInfo, addresses } = useAuth();
  const navigate = useNavigate();
  const [orderProcessing, setOrderProcessing] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [addressMode, setAddressMode] = useState("select");
  const [fullName, setFullName] = useState(null);
  const [email, setEmail] = useState(null);

  // Load cart and address data
  useEffect(() => {
    if (cartItemCount === 0 && currentStep < 2) {
      message.info("Your cart is empty. Add items to proceed to checkout.");
      navigate("/cart");
    }
  }, [isLoggedIn, cartItemCount, currentStep, navigate]);

  const [selectedProvince, setSelectedProvince] = useState();
  const [selectedDistrict, setSelectedDistrict] = useState();
  const [selectedWard, setSelectedWard] = useState();
  const [street, setStreet] = useState();

  const provinceList = Object.values(provinces);
  const districtList = Object.values(districts);
  const wardList = Object.values(wards);

  const filteredDistricts = selectedProvince
    ? districtList
        .filter((d) => d.parent_code === selectedProvince)
        .sort((a, b) => a.name.localeCompare(b.name))
    : [];

  const filteredWards = selectedDistrict
    ? wardList
        .filter((w) => w.parent_code === selectedDistrict)
        .sort((a, b) => a.code.localeCompare(b.code))
    : [];

  useEffect(() => {
    if (userInfo.id) {
      shippingForm.setFieldsValue({
        fullName: userInfo?.fullName,
        email: userInfo?.email,
        address: userInfo?.addresses?.[0]?._id,
      });
    }
  }, []);
  const handleSubmit = async () => {
    await shippingForm.validateFields();

    const province = provinces[selectedProvince];
    const district = districts[selectedDistrict];
    const ward = wards[selectedWard];

    console.log(province, district, ward);

    addressForm.setFieldsValue({
      street: street,
      ward: ward?.name_with_type,
      wardCode: selectedWard,
      district: district?.name_with_type,
      districtCode: selectedDistrict,
      province: province?.name_with_type,
      provinceCode: selectedProvince,
      fullAddress: `${street}, ${ward?.name_with_type}, ${district?.name_with_type}, ${province?.name_with_type}`,
      userId: userInfo?._id || userInfo?.id,
      fullName: shippingForm.getFieldValue("fullName"),
      email: shippingForm.getFieldValue("email"),
    });
    
    console.log("Address form data:", addressForm.getFieldValue("fullAddress"));
  };

  const renderAddressSelector = () => {
    if (!isLoggedIn) {
      return (
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8} md={8}>
            <Form.Item
              name="province"
              label="Province"
              rules={[{ required: true, message: "Please select a province" }]}
            >
              <Select
                showSearch
                placeholder="Select a province"
                optionFilterProp="children"
                onChange={(value) => {
                  setSelectedProvince(value);
                  setSelectedDistrict(null);
                  shippingForm.setFieldsValue({
                    district: null,
                    ward: null,
                  });
                }}
                filterOption={(input, option) =>
                  option.children.toLowerCase().includes(input.toLowerCase())
                }
              >
                {provinceList.map((province) => (
                  <Option key={province.code} value={province.code}>
                    {province.name_with_type}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} sm={8} md={8}>
            <Form.Item
              name="district"
              label="District"
              rules={[{ required: true, message: "Please select a district" }]}
            >
              <Select
                showSearch
                placeholder="Select a district"
                optionFilterProp="children"
                disabled={!selectedProvince}
                onChange={(value) => {
                  setSelectedDistrict(value);
                  shippingForm.setFieldsValue({ ward: null });
                }}
                filterOption={(input, option) =>
                  option.children.toLowerCase().includes(input.toLowerCase())
                }
              >
                {filteredDistricts.map((district) => (
                  <Option key={district.code} value={district.code}>
                    {district.name_with_type}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} sm={8} md={8}>
            <Form.Item
              name="ward"
              label="Ward"
              rules={[{ required: true, message: "Please select a ward" }]}
            >
              <Select
                showSearch
                placeholder="Select a ward"
                optionFilterProp="children"
                disabled={!selectedDistrict}
                value={selectedWard}
                onChange={(value) => setSelectedWard(value)}
                filterOption={(input, option) =>
                  option.children.toLowerCase().includes(input.toLowerCase())
                }
              >
                {filteredWards.map((ward) => (
                  <Option key={ward.code} value={ward.code}>
                    {ward.name_with_type}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} sm={24} md={24}>
            <Form.Item
              name="street"
              label="Address street"
              rules={[{ required: true, message: "Please enter your address" }]}
            >
              <Input
                type="text"
                value={street}
                onChange={(e) => {
                  setStreet(e.target.value);
                  // Cập nhật giá trị form
                  addressForm.setFieldsValue({ street: e.target.value });
                }}
                placeholder="Enter your full address"
              />
            </Form.Item>
          </Col>
        </Row>
      );
    } else {
      return (
        <AddressSelector
          form={shippingForm}
          addresses={addresses}
          loading={loadingAddresses}
        />
      );
    }
  };

  const handleNext = async () => {
    if (currentStep === 0) {
      await handleSubmit();
      setEmail(shippingForm.getFieldValue("email"));
      setFullName(shippingForm.getFieldValue("fullName"));
      setCurrentStep(currentStep + 1);
    } else if (currentStep === 1) {
      try {
        setOrderProcessing(true);

        const shippingValues = shippingForm.getFieldsValue();

        let shippingAddress;

        if (addressMode === "select") {
          const selectedAddress = addresses?.find(
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
            address: addressForm.getFieldsValue(true),
          },
          products: cartItems,
          totalAmount: Number(total),
          shippingAddress:
            addressForm.getFieldValue("fullAddress") || shippingAddress,
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
        message.error(
          error.response?.data?.message || error.response?.message || "Error"
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
