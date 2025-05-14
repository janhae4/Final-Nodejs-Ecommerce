import React from 'react';
import { Card, Button, Popconfirm, Tag } from 'antd';
import { EditOutlined, DeleteOutlined, HomeOutlined } from '@ant-design/icons';

const AddressCard = ({ address, onEdit, onDelete, onSetDefault, isDefault }) => {
  return (
    <Card 
      className="mb-4 shadow-md"
      title={<div className="flex items-center"><HomeOutlined className="mr-2" /> {address.label || 'Delivery Address'}</div>}
      extra={
        <div className="space-x-2">
          {!isDefault && (
            <Button size="small" onClick={() => onSetDefault(address.id)}>Set as Default</Button>
          )}
          <Button icon={<EditOutlined />} size="small" onClick={() => onEdit(address)} />
          <Popconfirm
            title="Are you sure to delete this address?"
            onConfirm={() => onDelete(address.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button icon={<DeleteOutlined />} size="small" danger />
          </Popconfirm>
        </div>
      }
    >
      <p className="text-gray-700">{address.fullAddress}</p>
      <p className="text-sm text-gray-500">Contact: {address.contactNumber || 'N/A'}</p>
      {isDefault && <Tag color="green" className="mt-2">Default</Tag>}
    </Card>
  );
};
export default AddressCard;