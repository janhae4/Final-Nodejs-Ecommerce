import React from 'react';
import { Form, Input, Button, Rate, Alert } from 'antd';

const ReviewForm = ({ onSubmitComment, onSubmitRating, isLoggedIn, loading }) => {
  const [form] = Form.useForm();

  const handleCommentSubmit = (values) => {
    onSubmitComment(values.comment); // Only comment if not logged in
    form.resetFields(['comment']);
  };

  const handleRatingSubmit = (values) => {
    onSubmitRating(values.comment, values.rating); // Comment and rating if logged in
    form.resetFields();
  };

  return (
    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
      <h3 className="text-lg font-semibold mb-3">Leave a Review</h3>
      <Form form={form} onFinish={isLoggedIn ? handleRatingSubmit : handleCommentSubmit} layout="vertical">
        {isLoggedIn && (
          <Form.Item
            name="rating"
            label="Your Rating"
            rules={[{ required: false, message: 'Please provide a rating!' }]}
          >
            <Rate allowClear />
          </Form.Item>
        )}
        <Form.Item
          name="comment"
          label={isLoggedIn ? "Your Comment (Optional)" : "Your Comment"}
          rules={[{ required: !isLoggedIn, message: 'Please enter your comment!' }]}
        >
          <Input.TextArea rows={4} placeholder="Share your thoughts about this product..." />
        </Form.Item>
        
        {!isLoggedIn && (
          <Alert
            message="You are commenting as a guest. Log in to rate this product with stars."
            type="info"
            showIcon
            className="mb-3"
          />
        )}

        <Form.Item>
          <Button htmlType="submit" type="primary" loading={loading} className="bg-blue-500 hover:bg-blue-600">
            {isLoggedIn ? 'Submit Review' : 'Submit Comment'}
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};
export default ReviewForm;