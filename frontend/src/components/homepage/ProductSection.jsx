import React from "react";
import { Row, Col, Card, Typography, Tag, Button, message } from "antd";
import { Link } from "react-router-dom";
import ProductCard from "./ProductCard";
const { Title, Text } = Typography;
const ProductSection = ({ action, title, products, icon, description, isNew=false, isBestSeller=false}) => {
  return (
    <div className="mb-12 p-6 bg-white rounded-xl">
      <div className="flex flex-col md:flex-row md:items-center mb-6">
        <div className="flex items-center">
          {icon &&
            React.cloneElement(icon, {
              className: "text-2xl mr-3 text-brand-primary",
            })}
          <Title level={2} className="!mb-0 !text-2xl font-bold text-gray-800">
            {title}
          </Title>
        </div>
        {description && (
          <Text className="text-gray-600 mt-1 md:mt-0 md:ml-4">
            {description}
          </Text>
        )}
        <Link
          href="/products"
          className="ml-auto text-brand-primary hover:text-red-700 font-medium mt-2 md:mt-0"
        >
          View All <span aria-hidden="true">→</span>
        </Link>
      </div>
      <Row gutter={[16, 16]}>
        {products.map((product) => (
          <ProductCard key={product._id} product={product} action={action} isNew={isNew} isBestSeller={isBestSeller} />
        ))}
      </Row>
    </div>
  );
};

export default ProductSection;
