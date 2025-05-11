// src/pages/CheckoutPage.jsx
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
} from "antd";
import { Link, useNavigate } from "react-router-dom";
import CartSummary from "../../../components/cart/CartSummary"; // Re-use for order review
import { useCart } from "../../../context/CartContext";
import { useAuth } from "../../../context/AuthContext";

const { Step } = Steps;
const { Title, Text, Paragraph } = Typography;

// Mock payment gateways
const paymentMethods = [
  { id: "credit_card", name: "Credit/Debit Card" },
  { id: "paypal", name: "PayPal (Mock)" },
  { id: "cod", name: "Cash on Delivery (Mock)" },
];

const CheckoutPage = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [shippingForm] = Form.useForm();
  const [paymentForm] = Form.useForm();
  const { cartItems, total, clearCart, cartItemCount, discountInfo } =
    useCart();
  const { isLoggedIn, getUserInfo, addUserInfo } = useAuth(); // Get user from AuthContext
  const navigate = useNavigate();
  const [orderProcessing, setOrderProcessing] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null); // For successful order
  const [paymentMethod, setPaymentMethod] = useState(null);

  useEffect(() => {
    if (cartItemCount === 0 && currentStep < 2) {
      // Don't allow checkout if cart is empty, unless on success step
      message.info("Your cart is empty. Add items to proceed to checkout.");
      navigate("/cart");
    }
  }, [cartItemCount, navigate, currentStep]);

  useEffect(() => {
    if (isLoggedIn) {
      const user = getUserInfo();
      shippingForm.setFieldsValue({
        fullName: user.fullName,
        email: user.email,
        address: user.defaultShippingAddress.fullAddress,
        city: user.defaultShippingAddress.city,
        postalCode: user.defaultShippingAddress.postalCode,
        country: user.defaultShippingAddress.country,
      });
    }
  }, [isLoggedIn]);

  const handleNext = async () => {
    if (currentStep === 0) {
      // Shipping Step
      try {
        const values = await shippingForm.validateFields();
        console.log("Shipping Info:", values);
        setCurrentStep(currentStep + 1);
      } catch (info) {
        console.log("Validate Failed:", info);
        message.error("Please fill in all required shipping details.");
      }
    } else if (currentStep === 1) {
      // Payment Step
      try {
        const values = await paymentForm.validateFields();
        console.log("Payment Info:", values);
        // Simulate order placement
        setOrderProcessing(true);
        // --- MOCK API CALL for order placement ---
        // In real app: await placeOrderService(shippingDetails, paymentDetails, cartItems, total, discountInfo);
        setTimeout(() => {
          const mockOrder = {
            orderId: `ORD-${Date.now()}`,
            items: cartItems,
            totalAmount: total,
            shippingAddress: shippingForm.getFieldsValue(),
            paymentMethod: paymentForm.getFieldValue("paymentMethod"),
            discountApplied: discountInfo,
            date: new Date().toLocaleDateString(),
          };
          setOrderDetails(mockOrder);
          clearCart(); // Clear cart on successful order
          setOrderProcessing(false);
          setCurrentStep(currentStep + 1); // Move to success/confirmation step
          message.success("Order placed successfully!");
        }, 2000);
        // --- END MOCK API CALL ---
      } catch (info) {
        console.log("Validate Failed:", info);
        message.error("Please complete the payment information.");
      }
    }
  };

  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
  };

  const shippingFields = [
    {
      name: "fullName",
      label: "Full Name",
      rules: [{ required: true, message: "Please enter your full name" }],
    },
    {
      name: "email",
      label: "Email Address",
      rules: [
        {
          required: true,
          type: "email",
          message: "Please enter a valid email",
        },
      ],
    },
    {
      name: "address",
      label: "Street Address",
      rules: [{ required: true, message: "Please enter your address" }],
    },
    {
      name: "city",
      label: "City",
      rules: [{ required: true, message: "Please enter your city" }],
    },
    {
      name: "postalCode",
      label: "Postal Code",
      rules: [{ required: true, message: "Please enter your postal code" }],
    },
    {
      name: "country",
      label: "Country",
      rules: [{ required: true, message: "Please enter your country" }],
    },
  ];

  const steps = [
    {
      title: "Shipping",
      content: (
        <Card title="Shipping Details" className="shadow-md">
          {!isLoggedIn && (
            <Link
              to="/login?redirect=/checkout"
              className={isLoggedIn ? "text-gray-400" : "text-blue-500"}
            >
              Login for faster checkout
            </Link>
          )}
          <Form form={shippingForm} layout="vertical">
            {shippingFields.map((field) => (
              <Form.Item
                key={field.name}
                name={field.name}
                label={field.label}
                rules={field.rules}
              >
                <Input placeholder={field.label} />
              </Form.Item>
            ))}
          </Form>
        </Card>
      ),
    },
    {
      title: "Payment",
      content: (
        <Card title="Payment Method" className="shadow-md">
          <Form form={paymentForm} layout="vertical">
            <Form.Item
              name="paymentMethod"
              label="Select Payment Method"
              rules={[
                { required: true, message: "Please select a payment method" },
              ]}
              initialValue="credit_card"
            >
              <Radio.Group>
                {paymentMethods.map((method) => (
                  <Radio
                    key={method.id}
                    value={method.id}
                    className="block mb-2"
                  >
                    {method.name}
                  </Radio>
                ))}
              </Radio.Group>
            </Form.Item>
            {paymentForm.getFieldValue("paymentMethod") === "credit_card" && (
              <>
                <Form.Item
                  name="cardNumber"
                  label="Card Number"
                  rules={[
                    { required: true, message: "Card number is required" },
                  ]}
                >
                  <Input placeholder="XXXX XXXX XXXX XXXX (Mock)" />
                </Form.Item>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="expiryDate"
                      label="Expiry Date (MM/YY)"
                      rules={[
                        { required: true, message: "Expiry date is required" },
                      ]}
                    >
                      <Input placeholder="MM/YY (Mock)" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="cvv"
                      label="CVV"
                      rules={[{ required: true, message: "CVV is required" }]}
                    >
                      <Input placeholder="XXX (Mock)" />
                    </Form.Item>
                  </Col>
                </Row>
              </>
            )}
            <Title level={5} className="mt-6 mb-2">
              Order Review
            </Title>
            <CartSummary showCheckoutButton={false} />{" "}
            {/* Don't show checkout button here */}
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
          title="Order Successfully Placed!"
          subTitle={`Order ID: ${orderDetails.orderId}. A confirmation email has been sent to ${orderDetails.shippingAddress.email}.`}
          extra={[
            <Link to="/products" key="buy">
              <Button type="primary">Continue Shopping</Button>
            </Link>,
            <Link to="/profile/orders" key="orders">
              {" "}
              {/* Assuming an orders page in profile */}
              <Button>View My Orders</Button>
            </Link>,
          ]}
        />
      ) : (
        <Result
          status="error"
          title="Order Processing Failed"
          subTitle="Something went wrong while processing your order. Please try again or contact support."
          extra={[
            <Button
              type="primary"
              key="console"
              onClick={() => setCurrentStep(1)}
            >
              Try Again
            </Button>,
          ]}
        />
      ),
    },
  ];

  return (
    <Layout>
      <div className="container mx-auto p-4 md:p-8">
        <Title level={2} className="text-center mb-8">
          Checkout
        </Title>
        <Steps current={currentStep} className="mb-8">
          {steps.map((item) => (
            <Step key={item.title} title={item.title} />
          ))}
        </Steps>

        <Row gutter={[24, 24]}>
          <Col xs={24} md={currentStep < 2 ? 16 : 24}>
            {" "}
            {/* Full width for confirmation */}
            <div className="steps-content">{steps[currentStep].content}</div>
          </Col>
          {currentStep < 2 &&
            cartItemCount > 0 && ( // Only show summary for first 2 steps
              <Col xs={24} md={8}>
                <div className="sticky top-24">
                  {" "}
                  {/* Make summary sticky */}
                  <Title level={4} className="mb-4">
                    Your Order
                  </Title>
                  <CartSummary showCheckoutButton={false} />
                </div>
              </Col>
            )}
        </Row>

        <div className="steps-action mt-8 flex justify-between">
          {currentStep > 0 && currentStep < 2 && (
            <Button style={{ margin: "0 8px" }} onClick={handlePrev}>
              Previous
            </Button>
          )}
          {currentStep < steps.length - 2 &&
            cartItemCount > 0 && ( // Hide next on payment form, use place order
              <Button
                type="primary"
                onClick={handleNext}
                className="bg-blue-500 hover:bg-blue-600"
              >
                Next
              </Button>
            )}
          {currentStep === 1 &&
            cartItemCount > 0 && ( // Payment step - "Place Order" button
              <Button
                type="primary"
                loading={orderProcessing}
                onClick={handleNext}
                className="bg-green-500 hover:bg-green-600"
              >
                {orderProcessing ? "Processing..." : "Place Order"}
              </Button>
            )}
        </div>
      </div>
    </Layout>
  );
};

export default CheckoutPage;
