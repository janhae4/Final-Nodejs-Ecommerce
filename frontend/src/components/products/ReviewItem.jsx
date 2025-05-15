import React from 'react';
import {Rate, Typography } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Paragraph, Text } = Typography;

const CustomComment = ({ review }) => {
  return (
    <div className="flex gap-3 border-b border-gray-200 py-3 last:border-b-0">
      <div className="flex-1">
        <Text strong>{review.author || 'Anonymous'}</Text>
        <div className="text-xs text-gray-500">
          {dayjs(review.datetime).format('MMMM D, YYYY')}
        </div>
        {review.rating && <Rate disabled defaultValue={review.rating} className="mb-1 text-sm" />}
        <Paragraph className="text-gray-700 mb-0">{review.content}</Paragraph>
      </div>
    </div>
  );
};

export default CustomComment;
