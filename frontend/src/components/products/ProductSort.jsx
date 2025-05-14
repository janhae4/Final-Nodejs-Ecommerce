// src/components/products/ProductSort.jsx
import React from 'react';
import { Select } from 'antd';

const { Option } = Select;

const ProductSort = ({ currentSort, onSortChange }) => {
  const sortOptions = [
    { value: 'relevance', label: 'Relevance' }, // Assuming backend handles 'relevance'
    { value: 'name_asc', label: 'Name (A-Z)' },
    { value: 'name_desc', label: 'Name (Z-A)' },
    { value: 'price_asc', label: 'Price (Low to High)' },
    { value: 'price_desc', label: 'Price (High to Low)' },
    // Add more as needed e.g. 'date_added_desc' for Newest
  ];

  return (
    <div className="flex items-center">
      <span className="mr-2 text-gray-600">Sort by:</span>
      <Select
        defaultValue={currentSort || 'relevance'}
        style={{ width: 200 }}
        onChange={onSortChange}
        aria-label="Sort products"
      >
        {sortOptions.map(option => (
          <Option key={option.value} value={option.value}>
            {option.label}
          </Option>
        ))}
      </Select>
    </div>
  );
};

export default ProductSort;