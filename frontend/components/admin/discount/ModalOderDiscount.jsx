import React from 'react'
import { Modal, Table } from 'antd'
const ModalOderDiscount = ({ orderModalVisible, setOrderModalVisible, selectedDiscount }) => {
    return (
        <Modal
            title={`Orders using code: ${selectedDiscount?.code}`}
            open={orderModalVisible}
            onCancel={() => setOrderModalVisible(false)}
            footer={null}
            width={800}
        >
            <Table
                dataSource={selectedDiscount?.orders || []}
                rowKey="_id"
                columns={[
                    { title: 'Order ID', dataIndex: '_id', key: '_id' },
                    { title: 'Customer', dataIndex: 'customerName', key: 'customerName' },
                    { title: 'Total', dataIndex: 'totalPrice', key: 'totalPrice' },
                    { title: 'Status', dataIndex: 'status', key: 'status' },
                ]}
                pagination={false}
                size="small"
                scroll={{ x: "max-content" }}
                className="overflow-x-auto"
            />
        </Modal>
    )
}

export default ModalOderDiscount