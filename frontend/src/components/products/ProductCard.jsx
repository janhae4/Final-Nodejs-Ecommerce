import React from "react";
import { Card, Typography, Tag, Button, message } from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom"; // Assuming React Router
import { useCart } from "../../context/CartContext";
import axios from "axios";

const { Title, Paragraph, Text } = Typography;

const ProductCard = ({ product, viewMode = "grid" }) => {
  const { addItemToCart } = useCart();

  console.log(product)

  const hadleAddItemtoCart = async (product) => {
    console.log(product)
    const res = await axios.get(`http://localhost:3000/api/products/${product.id}`);
    addItemToCart(res.data.product);
  }


  const cardStyles =
    viewMode === "grid"
      ? "w-full" // Tailwind handles grid layout in parent
      : "w-full flex mb-4"; // For list view

  const imageContainerStyles =
    viewMode === "grid" ? "h-48 w-full" : "w-1/4 h-auto flex-shrink-0"; // Adjust for list view

  const contentStyles = viewMode === "grid" ? "p-4" : "p-4 flex-grow";

  return (
    <>
      <Card
        hoverable
        className={`shadow-lg rounded-lg overflow-hidden ${cardStyles}`}
        cover={
          viewMode === "grid" && (
            <Link to={`/products/detail/${product.id}`}>
              <img
                alt={product.name}
                src={
                  product?.image ||
                  "https://via.placeholder.com/300x200?text=No+Image"
                }
                className="object-cover h-48 w-full"
              />
            </Link>
          )
        }
      >
        <div className={viewMode === "list" ? "flex" : ""}>
          {viewMode === "list" && (
            <div className={imageContainerStyles}>
              <Link to={`/products/detail/${product.id}`}>
                <img
                  alt={product?.name}
                  src={
                    product.image ||
                    "https://via.placeholder.com/300x200?text=No+Image"
                  }
                  className="object-cover h-48 w-full"
                />
              </Link>
            </div>
          )}
          <div className={contentStyles}>
            <Link to={`/products/detail/${product.link}`}>
              <Title level={5} className="mb-1 truncate" title={product.nameProduct}>
                {product.nameProduct}
              </Title>
            </Link>

            <Paragraph type="secondary" className="text-sm text-gray-500 mb-1">
              Brand: {product.brand || "Generic Brand"}
            </Paragraph>

            <Paragraph
              className="text-sm text-gray-600 mb-2"
              ellipsis={{ rows: 2, expandable: false }}
            >
              {product.shortDescription || "No description available."}
            </Paragraph>

            <div className="mb-2">
              <Text strong className="block text-base text-blue-600 mb-1">
                {new Intl.NumberFormat("vi-VN").format(product.price)} VNĐ
              </Text>
              {product.tags && product.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 max-h-12 overflow-hidden">
                  {product.tags.slice(0, 1).map((tag, index) => (
                    <Tag color="blue" key={index} className="text-xs">
                      {tag}
                    </Tag>
                  ))}
                  {product.tags.length > 2 && (
                    <Tag className="text-xs bg-gray-200 border-none text-gray-600">
                      +{product.tags.length - 2} more
                    </Tag>
                  )}
                </div>
              )}
            </div>


            <Link to={`/products/detail/${product.slug}`}>
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
              onClick={() => hadleAddItemtoCart(product)}
              icon={<ShoppingCartOutlined />}
              block
              className="mt-2"
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
