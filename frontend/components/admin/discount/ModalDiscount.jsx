import React, { useEffect, useState } from 'react'
import { Modal, Form, Input, InputNumber, Select, Button, Row, Col } from 'antd';
import { CodeOutlined } from '@ant-design/icons';
const ModalDiscount = ({
    isModalVisible,
    handleCancel,
    form,
    handleSubmit,
    editingId
}) => {
    const [typeValue, setTypeValue] = useState('fixed');
    useEffect(() => {
        const type = form.getFieldValue('type');
        if (type) {
            setTypeValue(type);
        } else {
            setTypeValue('fixed');
        }
    }, [isModalVisible]);
    return (
        <Modal
            title={editingId ? 'Edit Discount Code' : 'Create New Discount Code'}
            open={isModalVisible}
            onCancel={handleCancel}
            footer={[
                <Button key="back" onClick={handleCancel}>
                    Cancel
                </Button>,
                <Button key="submit" type="primary" onClick={handleSubmit} className="bg-blue-500">
                    {editingId ? 'Update' : 'Create'}
                </Button>,
            ]}
            centered
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={{ status: 'active', type: "fixed", usageLimit: 1 }}
            >
                <Form.Item
                    name="code"
                    label="Discount Code"
                    rules={[
                        { required: true, message: 'Please input the discount code!' },
                        { min: 5, max: 5, message: 'Code must be exactly 5 characters' },]}
                >
                    <Input placeholder="e.g. SUMMER25" prefix={<CodeOutlined />} />
                </Form.Item>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            key={typeValue}
                            name="value"
                            label="Value"
                            rules={[
                                { required: true, message: 'Please input the discount value!' },
                                {
                                    type: 'number',
                                    max: typeValue === 'fixed' ? 1_000_000_000 : 100,
                                    min: 1,
                                    message: typeValue === 'fixed'
                                        ? 'Value must be less than or equal $1 to $1,000,000,000'
                                        : 'Value must be between 1% and 100%',
                                },
                            ]}
                        >
                            <InputNumber
                                min={1}
                                max={typeValue === 'fixed' ? 1_000_000_000 : 100}
                                formatter={value => {
                                    const num = Number(value || 0);
                                    const formatted = num.toLocaleString('en-US').replace(/,/g, ' ');
                                    return typeValue === 'fixed' ? `$ ${formatted}` : `${formatted} %`;
                                }}
                                parser={value => {
                                    return value.replace(/\s/g, '').replace('$', '').replace('%', '');
                                }} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name='type'
                            label="Type"
                            rules={[{ required: true, message: 'Please select a type!' }]}>
                            <Select value={typeValue} onChange={setTypeValue}>
                                <Option value="fixed">$</Option>
                                <Option value="percentage">%</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>
                <Row gutter={16}>

                    <Col span={12}>
                        <Form.Item
                            name="usageLimit"
                            label="Usage Limit"
                            rules={[
                                { required: true, message: 'Please input the usage limit!' },
                                { type: 'number', min: 1, message: 'Limit must be at least 1' },
                                { type: 'number', max: 10, message: 'Limit must be at most 10' }
                            ]}
                        >
                            <InputNumber min={1} className="w-full" />
                        </Form.Item>
                    </Col>

                    <Col span={12}>
                        <Form.Item
                            name="status"
                            label="Status"
                            rules={[{ required: true, message: 'Please select a status!' }]}
                        >
                            <Select>
                                <Option value="active">Active</Option>
                                <Option value="inactive">Inactive</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    )
}

export default ModalDiscount