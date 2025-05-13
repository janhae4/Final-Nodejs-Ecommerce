// AddressList.jsx

import React from 'react';
import { Button } from 'antd';  // Thêm dòng này để import Button
import { EditOutlined, DeleteOutlined, StarOutlined  } from '@ant-design/icons'; // Nếu cần thêm icons

const AddressList = ({ addresses, onEdit, onDelete, onSetDefault }) => {
  return (
    <div>
      {addresses && addresses.length > 0 ? (
        addresses.map((address) => (
          <div key={address._id || address.id} className="address-item p-4 mb-4 border border-gray-300 rounded-lg">
            <p><strong>Full Address: </strong>{address.fullAddress || 'Address not available'}</p>
            <p><strong>District: </strong>{address.district || 'District not available'}</p>
            <p><strong>Province: </strong>{address.province || 'Province not available'}</p>
            
            <div className="flex justify-end gap-4 mt-4">
              <Button 
                onClick={() => onEdit(address)} 
                type="link" 
                icon={<EditOutlined />} 
                className="text-blue-500"
              >
                Edit
              </Button>
              <Button 
                onClick={() => onDelete(address._id || address.id)} 
                type="link" 
                icon={<DeleteOutlined />} 
                className="text-red-500"
              >
                Delete
              </Button>
              <Button 
                onClick={() => onSetDefault(address._id || address.id)} 
                type="link" 
                icon={<StarOutlined />} 
                className="text-green-500"
              >
                Set Default
              </Button>
            </div>
          </div>
        ))
      ) : (
        <p>No addresses available.</p>
      )}
    </div>
  );
};

export default AddressList;
