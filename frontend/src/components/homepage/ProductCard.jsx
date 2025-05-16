import React from "react";
import { Card, Col, Typography, Button, Image, Carousel } from "antd";
import {
  ShoppingCartOutlined,
  ThunderboltFilled,
  StarFilled,
} from "@ant-design/icons";
import Meta from "antd/es/card/Meta";
import { Link } from "react-router-dom";
const { Title, Paragraph, Text } = Typography;
const ProductCard = ({
  action,
  product,
  isNew = false,
  isBestSeller = false,
}) => (
  <Col xs={24} sm={12} md={8} lg={6} className="p-2">
    <Card
      hoverable
      className=" rouded-lg overflow-hidden h-full flex flex-col"
      cover={
        <div className="relative w-full h-[150px]">
          <Carousel
            dots={false}
            autoplay
            className="w-full h-full flex items-center justify-center"
          >
            {product.images.map((imgUrl, index) => (
              <div
                key={index}
                className="w-full h-[150px] p-2 flex items-center justify-center"
              >
                <img
                  alt={`${product.nameProduct} - ${index}`}
                  src={imgUrl}
                  className="object-contain"
                  style={{
                    width: "auto",
                    height: "auto",
                    maxWidth: "90%",
                    maxHeight: "140px",
                    margin: "0 auto",
                  }}
                />
              </div>
            ))}
          </Carousel>

          {/* Badges */}
          {isNew && (
            <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded">
              NEW
            </div>
          )}
          {isBestSeller && (
            <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded">
              BESTSELLER
            </div>
          )}
        </div>
      }
      actions={[
        <Button
          type="primary"
          className="bg-brand-primary hover:bg-blue-500 hover:shadow-md hover:shadow-blue-500/50 border-brand-primary py-4"
          onClick={(e) => {
            e.preventDefault();
            action(product);
          }}
          icon={<ShoppingCartOutlined />}
        >
          Add to Cart
        </Button>,
      ]}
    >
      <div className="flex-grow">
        <Meta
          title={
            <Link
              to={`/products/detail/${product.slug}`}
              className="block text-gray-800 hover:text-brand-primary text-base font-semibold
              line-clamp-2 whitespace-normal break-words"
              style={{ minHeight: "80px" }}
            >
              {product.nameProduct}
            </Link>
          }
          description={
            <div className="mt-2">
              <div className="flex items-center mb-1">
                <StarFilled className="text-yellow-400 mr-1" />
                <Text className="text-gray-600">
                  {product.ratingAverage}{" "}
                  <span className="text-gray-400">
                    ({Math.floor(product.ratingAverage * 20)})
                  </span>
                </Text>
              </div>
              <Text strong className="text-brand-primary text-lg">
                {product.price.toLocaleString("vi-VN", {
                  style: "currency",
                  currency: "VND",
                })}
              </Text>
              {product.price > 500 ? (
                <div className="mt-1 text-xs text-green-600">
                  <ThunderboltFilled className="mr-1" />
                  Free Shipping
                </div>
              ) : (
                <p>
                  <br></br>
                </p>
              )}
            </div>
          }
        />
      </div>
    </Card>
  </Col>
);

export default ProductCard;
