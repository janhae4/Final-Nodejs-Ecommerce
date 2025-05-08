import React, { useEffect, useState } from "react";
import { Badge, Modal, Table, Tag } from "antd";
import axios from "axios";
const ModalOderDiscount = ({
  orderModalVisible,
  setOrderModalVisible,
  selectedDiscount,
}) => {
  const [orders, setOrders] = useState([]);
  const API_URL = import.meta.env.VITE_API_URL;
  useEffect(() => {
    const fetchOrders = async (code) => {
      try {
        const response = await axios.get(`${API_URL}/orders/code/${code}`);
        console.log(response.data);
        setOrders(response.data);
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };
    console.log(selectedDiscount);
    if (selectedDiscount) {
      fetchOrders(selectedDiscount.code);
    }
  }, [selectedDiscount]);
  return (
    <Modal
      title={`Orders using code: ${selectedDiscount?.code}`}
      open={orderModalVisible}
      onCancel={() => setOrderModalVisible(false)}
      footer={null}
      width={800}
    >
      <Table
        dataSource={orders || []}
        rowKey="_id"
        columns={[
          { title: "Order Code", dataIndex: "orderCode", key: "orderCode" },
          { title: "Customer", dataIndex: "userId", key: "userId", width:200 },
          {
            title: "Total",
            dataIndex: "totalAmount",
            key: "totalAmount",
            render: (text) => `$${text}`,
          },
          {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (text) => {
              let color;
              switch (text) {
                case "pending":
                  color = "orange";
                  break;
                case "confirmed":
                  color = "blue";
                  break;
                case "shipping":
                  color = "purple";
                  break;
                case "delivered":
                  color = "green";
                  break;
                default:
                  color = "red";
              }
              return <Tag color={color}>{text.toUpperCase()}</Tag>;
            },
          },
        ]}
        pagination={false}
        size="small"
        scroll={{ x: "max-content", y: 400 }}
        className="overflow-x-auto"
      />
    </Modal>
  );
};

export default ModalOderDiscount;
