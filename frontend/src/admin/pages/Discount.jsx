import React, { useState, useEffect } from 'react';
import {
    Layout,
    Table,
    Button,
    Modal,
    Form,
    Input,
    InputNumber,
    Select,
    message,
    Space,
    Popconfirm,
    Card,
    Typography,
    Tag,
    Statistic,
    Row,
    Col,
    Divider,
    Breadcrumb
} from 'antd';
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    ReloadOutlined,
    SearchOutlined,
    TagOutlined,
    CodeOutlined,
    PercentageOutlined,
    DashboardOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

const DiscountCodeAdmin = () => {
    // State for discount codes data
    const [discountCodes, setDiscountCodes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [form] = Form.useForm();
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        inactive: 0,
        mostUsed: null
    });

    // Mock function to fetch discount codes (would be replaced with actual API call)
    const fetchDiscountCodes = async () => {
        try {
            setLoading(true);
            // In a real app, this would be an API call
            // const response = await axios.get('/api/discount-codes');
            // setDiscountCodes(response.data);

            // Mock data for demo
            const mockData = [
                { _id: '1', code: 'SUMMER25', value: 25, usageLimit: 100, usedCount: 45, status: 'active' },
                { _id: '2', code: 'WELCOME10', value: 10, usageLimit: 50, usedCount: 30, status: 'active' },
                { _id: '3', code: 'FLASH50', value: 50, usageLimit: 25, usedCount: 25, status: 'inactive' },
                { _id: '4', code: 'WINTER20', value: 20, usageLimit: 75, usedCount: 12, status: 'active' },
                { _id: '5', code: 'SALE15', value: 15, usageLimit: 200, usedCount: 78, status: 'active' },
            ];

            setDiscountCodes(mockData);

            // Calculate stats
            const total = mockData.length;
            const active = mockData.filter(code => code.status === 'active').length;
            const inactive = total - active;
            const mostUsed = [...mockData].sort((a, b) => b.usedCount - a.usedCount)[0];

            setStats({
                total,
                active,
                inactive,
                mostUsed
            });

            setLoading(false);
        } catch (error) {
            console.error('Error fetching discount codes:', error);
            message.error('Failed to fetch discount codes');
            setLoading(false);
        }
    };

    // Initial data load
    useEffect(() => {
        fetchDiscountCodes();
    }, []);

    // Handle modal visibility
    const showModal = (record = null) => {
        if (record) {
            setEditingId(record._id);
            form.setFieldsValue(record);
        } else {
            setEditingId(null);
            form.resetFields();
        }
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
    };

    // Handle form submission
    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            if (editingId) {
                // Update existing code
                // In a real app: await axios.put(`/api/discount-codes/${editingId}`, values);
                setDiscountCodes(prev =>
                    prev.map(item => item._id === editingId ? { ...item, ...values } : item)
                );
                message.success('Discount code updated successfully');
            } else {
                // Create new code
                // In a real app: const response = await axios.post('/api/discount-codes', values);
                const newCode = {
                    _id: String(discountCodes.length + 1),
                    ...values,
                    usedCount: 0
                };
                setDiscountCodes(prev => [...prev, newCode]);
                message.success('Discount code created successfully');
            }

            setIsModalVisible(false);
            form.resetFields();

            // Update stats
            const updatedCodes = editingId
                ? discountCodes.map(item => item._id === editingId ? { ...item, ...values } : item)
                : [...discountCodes, { _id: String(discountCodes.length + 1), ...values, usedCount: 0 }];

            const total = updatedCodes.length;
            const active = updatedCodes.filter(code => code.status === 'active').length;
            const inactive = total - active;
            const mostUsed = [...updatedCodes].sort((a, b) => b.usedCount - a.usedCount)[0];

            setStats({
                total,
                active,
                inactive,
                mostUsed
            });
        } catch (error) {
            console.error('Error submitting form:', error);
            message.error('Failed to save discount code');
        }
    };

    // Handle code deletion
    const handleDelete = async (id) => {
        try {
            // In a real app: await axios.delete(`/api/discount-codes/${id}`);
            setDiscountCodes(prev => prev.filter(item => item._id !== id));
            message.success('Discount code deleted successfully');

            // Update stats after deletion
            const updatedCodes = discountCodes.filter(item => item._id !== id);
            const total = updatedCodes.length;
            const active = updatedCodes.filter(code => code.status === 'active').length;
            const inactive = total - active;
            const mostUsed = updatedCodes.length > 0
                ? [...updatedCodes].sort((a, b) => b.usedCount - a.usedCount)[0]
                : null;

            setStats({
                total,
                active,
                inactive,
                mostUsed
            });
        } catch (error) {
            console.error('Error deleting discount code:', error);
            message.error('Failed to delete discount code');
        }
    };

    // Filter data based on search
    const filteredData = discountCodes.filter(item =>
        item.code.toLowerCase().includes(searchText.toLowerCase())
    );

    // Table columns configuration
    const columns = [
        {
            title: 'Code',
            dataIndex: 'code',
            key: 'code',
            render: (text) => <Text strong><CodeOutlined /> {text}</Text>,
            sorter: (a, b) => a.code.localeCompare(b.code),
        },
        {
            title: 'Value (%)',
            dataIndex: 'value',
            key: 'value',
            render: (value) => <span><PercentageOutlined /> {value}%</span>,
            sorter: (a, b) => a.value - b.value,
        },
        {
            title: 'Usage Limit',
            dataIndex: 'usageLimit',
            key: 'usageLimit',
            sorter: (a, b) => a.usageLimit - b.usageLimit,
        },
        {
            title: 'Used Count',
            dataIndex: 'usedCount',
            key: 'usedCount',
            sorter: (a, b) => a.usedCount - b.usedCount,
            render: (text, record) => (
                <div className="flex items-center">
                    <span>{text}</span>
                    <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                        <div
                            className="h-full rounded-full bg-blue-500"
                            style={{ width: `${(text / record.usageLimit) * 100}%` }}
                        ></div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={status === 'active' ? 'green' : 'red'}>
                    {status.toUpperCase()}
                </Tag>
            ),
            filters: [
                { text: 'Active', value: 'active' },
                { text: 'Inactive', value: 'inactive' },
            ],
            onFilter: (value, record) => record.status === value,
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button
                        type="primary"
                        icon={<EditOutlined />}
                        size="small"
                        onClick={() => showModal(record)}
                        className="bg-blue-500"
                    >
                        Edit
                    </Button>
                    <Popconfirm
                        title="Are you sure you want to delete this code?"
                        onConfirm={() => handleDelete(record._id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button
                            danger
                            icon={<DeleteOutlined />}
                            size="small"
                        >
                            Delete
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    // Responsive layout configuration
    const getResponsiveLayout = () => {
        return window.innerWidth < 768 ? 24 : 6;
    };

    return (
        <Layout className="min-h-screen">
            <Content className="p-4 md:p-6 bg-white">
                <Breadcrumb className="mb-4">
                    <Breadcrumb.Item href="#"><DashboardOutlined /> Dashboard</Breadcrumb.Item>
                    <Breadcrumb.Item>Discount Codes</Breadcrumb.Item>
                </Breadcrumb>

                <Title level={2} className="mb-6">Discount Codes Management</Title>

                {/* Statistics Cards */}
                <Row gutter={[16, 16]} className="mb-6">
                    <Col xs={24} sm={12} md={6}>
                        <Card bordered={false} className="hover:shadow-md transition-shadow">
                            <Statistic
                                title="Total Discount Codes"
                                value={stats.total}
                                prefix={<TagOutlined />}
                                valueStyle={{ color: '#1890ff' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card bordered={false} className="hover:shadow-md transition-shadow">
                            <Statistic
                                title="Active Codes"
                                value={stats.active}
                                valueStyle={{ color: '#3f8600' }}
                                prefix={<TagOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card bordered={false} className="hover:shadow-md transition-shadow">
                            <Statistic
                                title="Inactive Codes"
                                value={stats.inactive}
                                valueStyle={{ color: '#cf1322' }}
                                prefix={<TagOutlined />}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={6}>
                        <Card bordered={false} className="hover:shadow-md transition-shadow">
                            <Statistic
                                title="Most Used Code"
                                value={stats.mostUsed ? stats.mostUsed.code : 'N/A'}
                                suffix={stats.mostUsed ? `(${stats.mostUsed.usedCount} uses)` : ''}
                                valueStyle={{ color: '#722ed1' }}
                                prefix={<CodeOutlined />}
                            />
                        </Card>
                    </Col>
                </Row>

                <Card className="mb-6">
                    <div className="flex flex-col md:flex-row justify-between items-start mb-4">
                        <Title level={4} className="mb-4 md:mb-0">Discount Codes List</Title>
                        <div className="w-full md:w-auto flex flex-col md:flex-row gap-4 items-start">
                            <Input
                                placeholder="Search by code"
                                value={searchText}
                                onChange={e => setSearchText(e.target.value)}
                                prefix={<SearchOutlined />}
                                className="w-full md:w-64"
                            />
                            <div className="flex gap-2">
                                <Button
                                    type="primary"
                                    icon={<ReloadOutlined />}
                                    onClick={fetchDiscountCodes}
                                    className="bg-blue-500"
                                >
                                    Refresh
                                </Button>
                                <Button
                                    type="primary"
                                    icon={<PlusOutlined />}
                                    onClick={() => showModal()}
                                    className="bg-green-500"
                                >
                                    Add New
                                </Button>
                            </div>
                        </div>
                    </div>

                    <Table
                        columns={columns}
                        dataSource={filteredData}
                        rowKey="_id"
                        loading={loading}
                        pagination={{
                            pageSize: 10,
                            showSizeChanger: true,
                            showTotal: (total) => `Total ${total} items`,
                        }}
                        scroll={{ x: 'max-content' }}
                        className="overflow-x-auto"
                    />
                </Card>
            </Content>

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
            >
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={{ status: 'active' }}
                >
                    <Form.Item
                        name="code"
                        label="Discount Code"
                        rules={[
                            { required: true, message: 'Please input the discount code!' },
                            { min: 3, message: 'Code must be at least 3 characters' },
                        ]}
                    >
                        <Input placeholder="e.g. SUMMER25" prefix={<CodeOutlined />} />
                    </Form.Item>

                    <Form.Item
                        name="value"
                        label="Discount Value (%)"
                        rules={[
                            { required: true, message: 'Please input the discount value!' },
                            { type: 'number', min: 1, max: 100, message: 'Value must be between 1-100%' },
                        ]}
                    >
                        <InputNumber
                            min={1}
                            max={100}
                            formatter={value => `${value}%`}
                            parser={value => value.replace('%', '')}
                            className="w-full"
                        />
                    </Form.Item>

                    <Form.Item
                        name="usageLimit"
                        label="Usage Limit"
                        rules={[
                            { required: true, message: 'Please input the usage limit!' },
                            { type: 'number', min: 1, message: 'Limit must be at least 1' },
                        ]}
                    >
                        <InputNumber min={1} className="w-full" />
                    </Form.Item>

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
                </Form>
            </Modal>
        </Layout>
    );
};

export default DiscountCodeAdmin;