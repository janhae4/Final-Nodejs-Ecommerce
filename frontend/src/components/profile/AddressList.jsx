import React from 'react';
import { Button, Tag } from 'antd';
import { EditOutlined, DeleteOutlined, StarOutlined, CheckCircleOutlined, } from '@ant-design/icons';
import { CheckCircleFilled } from '@ant-design/icons';

const AddressList = ({ addresses, onEdit, onDelete, onSetDefault }) => {
  const sortedAddresses = [...addresses]
    .filter(address => address)
    .sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0));

  return (
    <div>
      {sortedAddresses.length > 0 ? (
        sortedAddresses.map((address) => {
          const isDefault = address.isDefault;
          return (
            <div
              key={address._id || address.id}
              className="p-4 mb-4 rounded-lg border transition-all"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">
                  {address.fullAddress || 'Address not available'}
                </h3>
              </div>

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

                {isDefault ? (
                  <Button 
                    type="primary" 
                    icon={<CheckCircleOutlined />} 
                    disabled
                    style={{ cursor: 'not-allowed' }}
                  >
                    Default
                  </Button>
                ) : (
                  <Button 
                    onClick={() => onSetDefault(address._id || address.id)} 
                    type="link" 
                    icon={<StarOutlined />} 
                    className="text-green-500"
                  >
                    Set Default
                  </Button>
                )}
              </div>
            </div>
          );
        })
      ) : (
        <p>No addresses available.</p>
      )}
    </div>
  );
};

export default AddressList;
