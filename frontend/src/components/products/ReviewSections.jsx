import React, { useState, useEffect } from 'react';
import { List, Typography, message, Divider } from 'antd';
import ReviewItem from './ReviewItem';
import ReviewForm from './ReviewForm';
import StarRatingDisplay from '../StartRatingDisplay';
import axios from 'axios';

const { Title, Text } = Typography;

const ReviewsSection = ({productId}) => {
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [numReviews, setNumReviews] = useState(0);
  const [formLoading, setFormLoading] = useState(false);

  const isLoggedIn = true; // TODO: Replace with actual auth
  const user = { _id: 'userId123', fullName: 'Current User' }; // TODO: Replace with actual user data

  console.log('Product ID:', productId);
  // --- Fetch Product Reviews on mount ---
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await axios.get(`http://localhost:3000/api/products/${productId}`); // Adjust endpoint
        const product = res.data.product;
        console.log('Product after fetch comment:', product);

        // Assumes API returns populated 'comments.user.fullName'
        setReviews(product.comments);
        setAvgRating(product.ratingAverage || 0);
        setNumReviews(product.ratingCount || 0);
      } catch (error) {
        console.error('Error fetching product reviews:', error);
        message.error('Failed to load product reviews');
      }
    };

    fetchReviews();
  }, [productId]);

  // --- Handle new review submission ---
  const handleRatingSubmit = async (commentText, ratingValue) => {
    if (!isLoggedIn) {
      message.error('You must be logged in to submit a review.');
      return;
    }

    setFormLoading(true);
    try {
      const res = await axios.post(`http://localhost:3000/api/products/${productId}/comments`, {
        content: commentText,
        rating: ratingValue,
        userId: user._id, // Đổi thành userId đúng key theo backend
      });

      const newReview = res.data.comment; // Đổi từ comments -> comment

      // Cập nhật UI
      setReviews(prev => [newReview, ...prev]);

      // Optionally re-fetch full product if ratingAverage not trả về
      const updatedProduct = await axios.get(`http://localhost:3000/api/products/${productId}`);
      setAvgRating(updatedProduct.data.product.ratingAverage || 0);
      setNumReviews(updatedProduct.data.product.ratingCount || 0);

      message.success('Review submitted!');
    } catch (error) {
      console.error('Review submit error:', error);
      message.error('Failed to submit review.');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="mt-8">
      <Title level={3} className="mb-4">Customer Reviews & Ratings</Title>

      {numReviews > 0 && (
        <div className="mb-6 p-4 bg-white rounded-lg shadow">
          <Text strong className="text-xl mr-2">{avgRating.toFixed(1)}</Text>
          <StarRatingDisplay rating={avgRating} size="large" />
          <Text type="secondary" className="ml-2">based on {numReviews} reviews</Text>
        </div>
      )}

      <Divider />

      <ReviewForm
        onSubmitRating={handleRatingSubmit}
        isLoggedIn={isLoggedIn}
        loading={formLoading}
      />

      <Divider />

      {reviews.length > 0 ? (
        <List
          header={<Text strong>{`${reviews.length} Review(s)`}</Text>}
          itemLayout="horizontal"
          dataSource={reviews}
          renderItem={review => (
            <ReviewItem
              review={{
                author: review.userFullName || 'Anonymous',
                content: review.content,
                rating: review.rating,
                datetime: review.createdAt,
              }}
            />
          )}
          className="bg-white p-4 rounded-lg shadow"
        />
      ) : (
        <Text className="block text-center py-4">Be the first to review this product!</Text>
      )}
    </div>
  );
};

export default ReviewsSection;
