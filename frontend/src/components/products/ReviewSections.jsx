import React, { useState, useEffect } from "react";
import {
  List,
  Typography,
  message,
  Divider,
  Space,
  Tooltip,
  Avatar,
} from "antd";
import { CheckCircleOutlined } from "@ant-design/icons";
import { socket } from "../../context/SocketContext";
import ReviewForm from "./ReviewForm";
import StarRatingDisplay from "../StartRatingDisplay";
import { useAuth } from "../../context/AuthContext";
import { Comment } from "@ant-design/compatible";
import axios from "axios";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

const { Title, Text } = Typography;

const ReviewsSection = ({ slug }) => {
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [numReviews, setNumReviews] = useState(0);
  const [formLoading, setFormLoading] = useState(false);
  const { isLoggedIn, userInfo, logout, login } = useAuth();
  
    const fetchReviews = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3000/api/products/id/${slug}`
        );
        const product = res.data;
        console.log("Product after fetch comment:", product);
        setReviews(product.comments);
        setAvgRating(product.ratingAverage || 0);
        setNumReviews(product.ratingCount || 0);
      } catch (error) {
        console.error("Error fetching product reviews:", error);
        message.error("Failed to load product reviews");
      }
    };
  
    useEffect(() => {
    fetchReviews();
    socket.on("connect", () => {
      console.log("Socket connected");
    });

    socket.on(`new-comment-${slug}`, (newReview) => {
      setReviews((prev) => [newReview, ...prev]);
      console.log("REIVEW MOI NE:", newReview);
      setNumReviews((prev) => prev + 1);
      setAvgRating((prev) => prev + (newReview.rating - prev) / prev);
    });

    return () => {
      socket.off(`new-comment-${slug}`);
      socket.off("connect");
    };
  }, [slug]);

  const handleCommentSubmit = async (comment) => {
    setFormLoading(true);
    try {
      const res = await axios.post(
        `http://localhost:3000/api/products/${slug}/comments_anonymous`,
        { content: comment }
      );
      message.success("Comment submitted!");
      await fetchReviews();
    } catch (error) {
      console.error("Comment submit error:", error);
      message.error("Failed to submit comment.");
    } finally {
      setFormLoading(false);
    }
  };

  useEffect(() => {
    console.log("REIVEW NE:", reviews);
  }, [reviews]);

  const handleRatingSubmit = async (comment, rating) => {
    if (!isLoggedIn) {
      message.error("You must be logged in to submit a review.");
      return;
    }

    setFormLoading(true);
    try {
      await axios.post(
        `http://localhost:3000/api/products/${slug}/comments`,
        {
          content: comment,
          rating: rating,
        },
        { withCredentials: true }
      );
      
      // Optionally re-fetch full product if ratingAverage not trả về
      const updatedProduct = await axios.get(
        `http://localhost:3000/api/products/id/${slug}`
      );
      setAvgRating(updatedProduct.data.ratingAverage || 0);
      message.success("Review submitted!");
      await fetchReviews();
    } catch (error) {
      console.error("Review submit error:", error);
      message.error("Failed to submit review.");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="mt-8">
      <Title level={3} className="mb-4">
        Customer Reviews & Ratings
      </Title>

      {numReviews > 0 && (
        <div className="mb-6 p-4 bg-white rounded-lg shadow">
          <Text strong className="text-xl mr-2">
            {avgRating.toFixed(1)}
          </Text>
          <StarRatingDisplay rating={avgRating} size="large" />
          <Text type="secondary" className="ml-2">
            based on {numReviews} reviews
          </Text>
        </div>
      )}

      <Divider />

      <ReviewForm
        onSubmitComment={handleCommentSubmit}
        onSubmitRating={handleRatingSubmit}
        isLoggedIn={isLoggedIn}
        loading={formLoading}
      />

      <Divider />

      {reviews.length > 0 ? (
        reviews
          .filter((review) => review !== null)
          .map((review) => (
            <Comment
              key={Math.random()}
              author={
                <Space align="center">
                  <Text strong>{review?.userFullName}</Text>
                  {review?.isBuy && (
                    <Tooltip title="Bought this product">
                      <CheckCircleOutlined
                        style={{ color: "#52c41a", fontSize: "16px" }}
                      />
                    </Tooltip>
                  )}
                </Space>
              }
              avatar={
                <Avatar
                  src={review?.userAvatar || "https://i.pravatar.cc/300"}
                  alt={review?.userFullName}
                  size="large"
                />
              }
              content={
                <>
                  <StarRatingDisplay rating={review?.rating} size="large" />
                  <p className="mt-4">{review?.content}</p>
                </>
              }
              datetime={
                <Text type="secondary" className="text-xs ml-5">
                  {dayjs(review?.createdAt).fromNow()}
                </Text>
              }
            />
          ))
      ) : (
        <Text className="block text-center py-4">
          Be the first to review this product!
        </Text>
      )}
    </div>
  );
};

export default ReviewsSection;
