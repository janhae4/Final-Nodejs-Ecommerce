import React from 'react';
import { Select, Typography, Tag } from 'antd';

const { Text } = Typography;
const { Option } = Select;

const VariantSelector = ({ variants, selectedVariant, onSelectVariant }) => {
  if (!variants || variants.length === 0) return null;

  return (
    <div className="my-4">
      <Text strong className="block mb-2">Select Variant:</Text>
      <Select
        className="w-full md:w-1/2"
        placeholder="Choose a variant"
        value={selectedVariant?._id}
        onChange={(value) => onSelectVariant(value)}
        optionLabelProp="label"
      >
        {variants.map((variant) => (
          <Option 
            key={variant._id} 
            value={variant._id} 
            disabled={variant.inventory === 0}
            label={variant.name}
          >
            <div className="flex justify-between items-center">
              <span>{variant.name}</span>
              {variant.inventory !== undefined && (
                <Tag color={variant.inventory > 0 ? 'green' : 'red'}>
                  {variant.inventory > 0 ? `${variant.inventory} in stock` : 'Out of Stock'}
                </Tag>
              )}
            </div>
          </Option>
        ))}
      </Select>
    </div>
  );
};

export default VariantSelector;
