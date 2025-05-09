// src/components/products/ProductCard.jsx
import React from "react";
import { Card, Typography, Tag, Button, message } from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom"; // Assuming React Router
import { useCart } from "../../context/CartContext";

const { Title, Paragraph, Text } = Typography;

const ProductCard = ({ product, viewMode = "grid" }) => {
  const [messageApi, contextHolder] = message.useMessage();
  const { addItemToCart } = useCart();
  const handleDirectAddToCart = () => {
    // Assuming product has variants and we pick the first one for simplicity
    // Or if product has no variants (you'd need to adjust data structure)
    const defaultVariant =
      product.variants && product.variants.length > 0
        ? product.variants.find((v) => v.stock > 0) || product.variants[0]
        : null;
    if (product.variants && !defaultVariant) {
      messageApi.warn("This product is currently out of stock.");
      return;
    }
    if (product.variants && defaultVariant && defaultVariant.stock === 0) {
      messageApi.warn(
        `${defaultVariant.name} is out of stock. Please check other variants on product page.`
      );
      // Optionally, navigate to product page: navigate(`/products/${product.id}`);
      return;
    }
    addItemToCart(product, defaultVariant, 1);
  };

  // viewMode can be 'grid' or 'list'
  const cardStyles =
    viewMode === "grid"
      ? "w-full" // Tailwind handles grid layout in parent
      : "w-full flex mb-4"; // For list view

  const imageContainerStyles =
    viewMode === "grid" ? "h-48 w-full" : "w-1/4 h-auto flex-shrink-0"; // Adjust for list view

  const contentStyles = viewMode === "grid" ? "p-4" : "p-4 flex-grow";

  return (
    <>
      {contextHolder}
      <Card
        hoverable
        className={`shadow-lg rounded-lg overflow-hidden ${cardStyles}`}
        cover={
          viewMode === "grid" && (
            <Link to={`/products/${product.id}`}>
              <img
                alt={product.name}
                src={
                  product.images[0]?.url ||
                  "https://via.placeholder.com/300x200?text=No+Image"
                }
                className="object-cover h-48 w-full" // Grid view image
              />
            </Link>
          )
        }
      >
        <div className={viewMode === "list" ? "flex" : ""}>
          {viewMode === "list" && (
            <div className={imageContainerStyles}>
              <Link to={`/products/${product.id}`}>
                <img
                  alt={product.name}
                  src={
                    product.images[0]?.url ||
                    "https://via.placeholder.com/200x150?text=No+Image"
                  }
                  className="object-cover w-full h-full rounded-l-lg" // List view image
                />
              </Link>
            </div>
          )}
          <div className={contentStyles}>
            <Link to={`/products/${product.id}`}>
              <Title level={5} className="mb-1 truncate" title={product.name}>
                {product.name}
              </Title>
            </Link>
            <Paragraph type="secondary" className="text-sm mb-2">
              {product.brand?.name || "Generic Brand"}
            </Paragraph>
            <Paragraph
              className="mb-2 text-sm text-gray-600 h-12 overflow-hidden"
              ellipsis={{ rows: 2, expandable: false }}
            >
              {product.shortDescription}
            </Paragraph>
            <div className="flex justify-between items-center mb-3">
              <Text strong className="text-lg text-blue-600">
                ${product.price.toFixed(2)}
              </Text>
              {product.tags && product.tags.length > 0 && (
                <Tag color="blue">{product.tags[0]}</Tag>
              )}
            </div>
            <Link to={`/products/${product.id}`}>
              <Button
                type="primary"
                block
                className="bg-blue-500 hover:bg-blue-600"
              >
                View Details
              </Button>
            </Link>
            <Button
              type="default"
              onClick={handleDirectAddToCart}
              icon={<ShoppingCartOutlined />}
              block
              className="mt-2"
              disabled={
                !product.variants ||
                product.variants.every((v) => v.stock === 0)
              } // Disable if all variants OOS
            >
              Add to Cart
            </Button>
          </div>
        </div>
      </Card>
    </>
  );
};

export default ProductCard;
