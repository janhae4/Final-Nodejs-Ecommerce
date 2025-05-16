import React, { useState, useEffect } from 'react';
import { List, Typography, message, Divider } from 'antd';
import ReviewItem from './ReviewItem';
import ReviewForm from './ReviewForm';
import StarRatingDisplay from '../StartRatingDisplay';
import { useAuth } from "../../context/AuthContext";
import axios from 'axios';

const { Title, Text } = Typography;

const ReviewsSection = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [numReviews, setNumReviews] = useState(0);
  const [formLoading, setFormLoading] = useState(false);
  const { isLoggedIn, userInfo, logout, login } = useAuth();

  const user = { _id: 'userId123', fullName: 'Current User' }; // TODO: Replace with actual user data
  console.log('User: ', userInfo._id);
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

  // Send comments without rating, no token needed
  const handleCommentSubmit = async (comment) => {
    setFormLoading(true);
    try {
      const res = await axios.post(
        `http://localhost:3000/api/products/${productId}/comments_anonymous`,
        { content: comment }
      );

      const newReview = res.data.product.comments;
      const latestReview = newReview[newReview.length - 1]; 
      console.log('New review:', latestReview);

      // Cập nhật UI
      setReviews(prev => [latestReview, ...prev]);
      message.success('Comment submitted!');
    } catch (error) {
      console.error('Comment submit error:', error);
      message.error('Failed to submit comment.');
    } finally {
      setFormLoading(false);
    }
  };

  // --- Handle new review submission ---
  const handleRatingSubmit = async (comment, rating) => {
    if (!isLoggedIn) {
      message.error('You must be logged in to submit a review.');
      return;
    }

    setFormLoading(true);
    try {
      const res = await axios.post(`http://localhost:3000/api/products/${productId}/comments`, {
        content: comment,
        rating: rating,
      },
        { withCredentials: true }
      );

      // console.log('Response data:', res.data);

      const newReview = res.data.product.comments;
      const latestReview = newReview[newReview.length - 1]; 
      console.log('New review:', latestReview);

      // Cập nhật UI
      setReviews(prev => [latestReview, ...prev]);

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
        onSubmitComment={handleCommentSubmit}
        onSubmitRating={handleRatingSubmit}
        isLoggedIn={isLoggedIn}
        loading={formLoading}
      />

      <Divider />

      {reviews.length > 0 ? (
        <List
          header={<Text strong>{`${reviews.length} Review(s)`}</Text>}
          itemLayout="horizontal"
          dataSource={reviews?.filter(Boolean)}
          renderItem={review => (
            <div key={review._id || review.id || review.createdAt}>
              <ReviewItem
                review={{
                  author: review.userFullName || 'Anonymous',
                  content: review.content,
                  rating: review.rating,
                  datetime: review.createdAt,
                }}
              />
            </div>
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
