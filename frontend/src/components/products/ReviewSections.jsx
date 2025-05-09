// src/components/products/ReviewsSection.jsx
import React, { useState, useEffect } from 'react';
import { List, Typography, message, Divider } from 'antd';
import ReviewItem from './ReviewItem';
import ReviewForm from './ReviewForm';
import StarRatingDisplay from '../StartRatingDisplay';
// import { useAuth } from '../../contexts/AuthContext'; // Your auth context
// import useWebSocket from 'react-use-websocket'; // For WebSocket integration

const { Title, Text } = Typography;

const ReviewsSection = ({ productId, initialReviews = [], averageRating = 0, totalReviews = 0 }) => {
  const [reviews, setReviews] = useState(initialReviews);
  const [avgRating, setAvgRating] = useState(averageRating);
  const [numReviews, setNumReviews] = useState(totalReviews);
  const [formLoading, setFormLoading] = useState(false);
  
  // const { isLoggedIn, user } = useAuth(); // Get from your auth context
  const isLoggedIn = true; // MOCK: Replace with actual auth check
  const user = { name: 'Current User' }; // MOCK: Replace with actual user

  // --- WebSocket (Optional) ---
  // const socketUrl = `wss://your-api.com/ws/products/${productId}/reviews`;
  // const { lastMessage, readyState } = useWebSocket(socketUrl, {
  //   onOpen: () => console.log('WebSocket connected for reviews'),
  //   shouldReconnect: (closeEvent) => true,
  // });

  // useEffect(() => {
  //   if (lastMessage !== null) {
  //     const newReviewData = JSON.parse(lastMessage.data);
  //     // Assuming newReviewData is an object with { type: 'NEW_REVIEW'/'UPDATE_RATING', payload: ... }
  //     if (newReviewData.type === 'NEW_REVIEW') {
  //       setReviews(prevReviews => [newReviewData.payload, ...prevReviews]); // Add to top
  //       // Or fetch all reviews again if easier: fetchProductReviews();
  //     }
  //     if (newReviewData.type === 'UPDATE_RATING_STATS') {
  //       setAvgRating(newReviewData.payload.averageRating);
  //       setNumReviews(newReviewData.payload.totalReviews);
  //     }
  //     message.info('Reviews updated!');
  //   }
  // }, [lastMessage]);
  // --- End WebSocket ---

  // Simulate fetching reviews (normally done in ProductDetailPage)
  useEffect(() => {
    // This is where you might initially fetch reviews if not passed as props
    // Or re-fetch if using WebSockets and a full refresh is preferred on new message.
  }, [productId]);


  const handleCommentSubmit = async (commentText) => {
    setFormLoading(true);
    try {
      // API call to post comment (guest)
      // await postGuestComment(productId, { content: commentText, author: 'Guest' });
      const newComment = {
        id: `comment-${Date.now()}`,
        author: 'Guest',
        content: commentText,
        datetime: new Date().toISOString(),
      };
      setReviews(prev => [newComment, ...prev]); // Optimistic update
      message.success('Comment submitted for moderation!');
    } catch (error) {
      message.error('Failed to submit comment.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleRatingSubmit = async (commentText, ratingValue) => {
    if (!isLoggedIn) {
      message.error('You must be logged in to rate.');
      return;
    }
    setFormLoading(true);
    try {
      // API call to post review (comment + rating, logged in user)
      // const newReview = await postUserReview(productId, { content: commentText, rating: ratingValue, author: user.name });
      const newReview = {
        id: `review-${Date.now()}`,
        author: user.name, // from auth context
        content: commentText,
        rating: ratingValue,
        datetime: new Date().toISOString(),
      };
      setReviews(prev => [newReview, ...prev]); // Optimistic update
      // Update average rating and count - ideally from API response or WebSocket
      // For now, just a placeholder update
      setNumReviews(prev => prev + 1);
      // Recalculate avgRating (simplified)
      const totalRatingSum = reviews.reduce((sum, r) => sum + (r.rating || 0), 0) + ratingValue;
      setAvgRating(totalRatingSum / (reviews.length + 1));

      message.success('Review submitted!');
    } catch (error) {
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
          dataSource={reviews}
          renderItem={review => <ReviewItem review={review} />}
          className="bg-white p-4 rounded-lg shadow"
        />
      ) : (
        <Text className="block text-center py-4">Be the first to review this product!</Text>
      )}
    </div>
  );
};

export default ReviewsSection;