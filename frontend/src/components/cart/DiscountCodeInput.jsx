// src/components/cart/DiscountCodeInput.jsx
import React, { useState } from 'react';
import { Input, Button, Typography, Tag, Spin } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useCart } from '../../context/CartContext';

const { Text } = Typography;

const DiscountCodeInput = () => {
  const { applyDiscountCode, removeDiscountCode, discountInfo } = useCart();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleApplyCode = async () => {
    if (!code.trim()) {
      setError('Please enter a discount code.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await applyDiscountCode(code);
      // Success message is handled in CartContext
      setCode(''); // Clear input on success
    } catch (err) {
      setError(err.message || 'Failed to apply discount code.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCode = () => {
    removeDiscountCode();
    setError('');
  }

  return (
    <div className="my-4">
      {!discountInfo ? (
        <>
          <div className="flex items-stretch">
            <Input
              placeholder="Enter 5-character discount code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              maxLength={5} 
              className="rounded-r-none"
              onPressEnter={handleApplyCode}
            />
            <Button type="primary" onClick={handleApplyCode} loading={loading} className="rounded-l-none bg-blue-500 hover:bg-blue-600">
              Apply
            </Button>
          </div>
          {error && <Text type="danger" className="block mt-1 text-sm">{error}</Text>}
        </>
      ) : (
        <div className="p-3 bg-green-50 border border-green-200 rounded">
          <div className="flex justify-between items-center">
            <div>
              <Text strong className="text-green-700">
                <CheckCircleOutlined className="mr-2" />
                Discount Applied: <Tag color="green">{discountInfo.code}</Tag>
              </Text>
            </div>
            <Button type="link" onClick={handleRemoveCode} danger icon={<CloseCircleOutlined />} size="small">
              Remove
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscountCodeInput;