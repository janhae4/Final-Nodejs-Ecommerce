import React from 'react';
import { Rate } from 'antd';

const StarRatingDisplay = ({ rating, count, size = "small" }) => {
  return (
    <div className="flex items-center">
      <Rate disabled defaultValue={rating} allowHalf style={{ fontSize: size === 'small' ? 14 : 18 }}/>
      {count !== undefined && <span className="ml-2 text-gray-600 text-sm">({count} reviews)</span>}
    </div>
  );
};
export default StarRatingDisplay;