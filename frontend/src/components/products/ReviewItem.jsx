import React from 'react';
import { Avatar, Rate, Typography } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Paragraph, Text } = Typography;

const ReviewItem = ({ review }) => {
  // review: { author: string, avatarUrl?: string, content: string, datetime: string (ISO), rating?: number }
  return (
    <Comment
      author={<Text strong>{review.author || 'Anonymous'}</Text>}
      avatar={<Avatar src={review.avatarUrl} icon={!review.avatarUrl && <UserOutlined />} />}
      content={
        <>
          {review.rating && <Rate disabled defaultValue={review.rating} className="mb-1 text-sm" />}
          <Paragraph className="text-gray-700">{review.content}</Paragraph>
        </>
      }
      datetime={
        <Text type="secondary" className="text-xs">
          {dayjs(review.datetime).format('MMMM D, YYYY')}
        </Text>
      }
      className="border-b border-gray-200 py-3 last:border-b-0"
    />
  );
};
export default ReviewItem;