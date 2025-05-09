// src/components/products/VariantSelector.jsx
import React from 'react';
import { Radio, Tag, Typography } from 'antd';

const { Text } = Typography;

const VariantSelector = ({ variants, selectedVariant, onSelectVariant }) => {
  if (!variants || variants.length === 0) return null;

  // Assuming variants is an array of objects like:
  // { id: 'var1', name: 'Red, Small', stock: 10, priceModifier: 0 }
  // { id: 'var2', name: 'Blue, Medium', stock: 5, priceModifier: 5 }

  return (
    <div className="my-4">
      <Text strong className="block mb-2">Select Variant:</Text>
      <Radio.Group onChange={(e) => onSelectVariant(e.target.value)} value={selectedVariant?.id}>
        {variants.map(variant => (
          <Radio.Button 
            key={variant.id} 
            value={variant.id} 
            disabled={variant.stock === 0}
            className="mr-2 mb-2"
          >
            {variant.name}
            {variant.stock !== undefined && (
              <Tag color={variant.stock > 0 ? "green" : "red"} className="ml-2">
                {variant.stock > 0 ? `${variant.stock} in stock` : "Out of Stock"}
              </Tag>
            )}
          </Radio.Button>
        ))}
      </Radio.Group>
    </div>
  );
};

export default VariantSelector;