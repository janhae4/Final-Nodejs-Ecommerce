import React, { useState, useEffect, useRef } from 'react';
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
    DashboardOutlined,
    DollarOutlined
} from '@ant-design/icons';
import ModalDiscount from '../../../../components/admin/discount/ModalDiscount';
import axios from 'axios';
import debounce from 'debounce';
import dayjs from 'dayjs';
import CardStatistic from '../../../../components/admin/discount/CardStatistic';
import ModalOderDiscount from '../../../../components/admin/discount/ModalOderDiscount';
const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

const DiscountCodeAdmin = () => {
    // State for discount codes data
    const [discountCodes, setDiscountCodes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [orderModalVisible, setOrderModalVisible] = useState(false);
    const [selectedDiscount, setSelectedDiscount] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [messageApi, contextHolder] = message.useMessage();
    const [form] = Form.useForm();
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        inactive: 0,
        mostUsed: null
    });
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 5,
        total: 0
    });
    const API_URL = import.meta.env.VITE_API_URL

    const fetchAllData = async (page = 1, pageSize = 5) => {
        try {
            setLoading(true);
            const [discountCodesResponse, mostUsedResponse, activeLengthResponse, inactiveLengthResponse] = await Promise.all([
                axios.get(`${API_URL}/discount-codes?page=${page}&limit=${pageSize}`),
                axios.get(`${API_URL}/discount-codes/most-used`),
                axios.get(`${API_URL}/discount-codes/active-length`),
                axios.get(`${API_URL}/discount-codes/inactive-length`)
            ]);

            const discountCodes = discountCodesResponse.data.discounts;
            setDiscountCodes(discountCodes);
            setPagination({
                current: discountCodesResponse.data.currentPage,
                pageSize: 5,
                total: discountCodesResponse.data.totalCount,
            });

            setStats({
                total: discountCodes.length,
                active: activeLengthResponse.data || 0,
                inactive: inactiveLengthResponse.data || 0,
                mostUsed: mostUsedResponse.data,
            });

            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            messageApi.error('Failed to fetch data');
            setLoading(false);
        }
    };

    const fetchDiscountCodes = async (page = 1, pageSize = 5, search = '') => {
        try {
            setLoading(true);
            const discountCodesResponse = await axios.get(`${API_URL}/discount-codes?page=${page}&limit=${pageSize}&search=${search}`);
            const discountCodes = discountCodesResponse.data.discounts;
            setDiscountCodes(discountCodes);
            setPagination({
                current: discountCodesResponse.data.currentPage,
                pageSize: 5,
                total: discountCodesResponse.data.totalCount,
            });
            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
            messageApi.error('Failed to fetch data');
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchAllData();
    }, []);

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

    const handleRowClick = (record) => {
        setSelectedDiscount(record);
        setOrderModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            if (editingId) {
                await axios.patch(`${API_URL}/discount-codes/${editingId}`, values);
                setDiscountCodes(prev =>
                    prev.map(item => item._id === editingId ? { ...item, ...values } : item)
                );
                messageApi.success('Discount code updated successfully');
            } else {
                await axios.post(`${API_URL}/discount-codes`, values);
                const newCode = {
                    _id: String(discountCodes.length + 1),
                    ...values,
                    usedCount: 0
                };
                setDiscountCodes(prev => [...prev, newCode]);
                messageApi.success('Discount code created successfully');
            }
            setIsModalVisible(false);
            form.resetFields();

        } catch (error) {
            console.error('Error submitting form:', error);
            messageApi.error(error.response.data.message || 'Failed to submit form');
        }
    };

    const handleDelete = async (id) => {
        try {
            console.log(id)
            await axios.delete(`${API_URL}/discount-codes/${id}`);
            setDiscountCodes(prev => prev.filter(item => item._id !== id));
            messageApi.success('Discount code deleted successfully');

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
            messageApi.error(error.response.data.message || 'Failed to delete discount code');
        }
    };

    const debouncedFetchRef = useRef(
        debounce((value, page, pageSize) => {
            fetchDiscountCodes(page, pageSize, value);
        }, 500)
    );

    const handleSearchChange = e => {
        const value = e.target.value;
        setSearchText(value);
        debouncedFetchRef.current(value, page, pageSize);
    }

    const columns = [
        {
            title: 'Code',
            dataIndex: 'code',
            key: 'code',
            render: (text) => <Text strong><CodeOutlined /> {text}</Text>,
            sorter: (a, b) => a.code.localeCompare(b.code),
        },
        {
            title: 'Value',
            dataIndex: 'value',
            key: 'value',
            render: (value, record) => {
                const type = record.type;
                if (type === 'percentage') {
                    return <Text strong><PercentageOutlined /> {value}</Text>
                } else {
                    return <Text strong><DollarOutlined /> {value}</Text>
                }
            },
            sorter: (a, b) => a.value - b.value,
            filters: [
                { text: '%', value: 'percentage' },
                { text: 'vnđ', value: 'fixed' },
            ],
            onFilter: (value, record) => record.type === value,
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
            title: 'Created At',
            dataIndex: 'createdAt',
            key: 'createdAt',
            sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
            render: (text) => dayjs(text).format('DD/MM/YYYY - HH:mm:ss'),
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

    return (
        <Layout className="min-h-screen">
            {contextHolder}
            <Content className="p-4 md:p-6 bg-white">
                <Breadcrumb className="mb-4">
                    <Breadcrumb.Item href="#"><DashboardOutlined /> Dashboard</Breadcrumb.Item>
                    <Breadcrumb.Item>Discount Codes</Breadcrumb.Item>
                </Breadcrumb>

                <Title level={2} className="mb-6">Discount Codes Management</Title>

                {/* Statistics Cards */}
                <CardStatistic stats={stats} />

                <Card className="mb-6">
                    <div className="flex flex-col md:flex-row justify-between items-start mb-4">
                        <Title level={4} className="mb-4 md:mb-0">Discount Codes List</Title>
                        <div className="w-full md:w-auto flex flex-col md:flex-row gap-4 items-start">
                            <Input
                                placeholder="Search by code"
                                value={searchText}
                                onChange={handleSearchChange}
                                prefix={<SearchOutlined />}
                                className="w-full md:w-64"
                            />
                            <div className="flex gap-2">
                                <Button
                                    type="primary"
                                    icon={<ReloadOutlined />}
                                    onClick={fetchAllData}
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
                        dataSource={discountCodes}
                        rowKey="_id"
                        loading={loading}
                        pagination={{
                            current: pagination.current,
                            pageSize: pagination.pageSize,
                            total: pagination.total,
                            showSizeChanger: true,
                            showTotal: (total) => `Total ${total} items`,
                            onChange: (page, pageSize) => {
                                setPage(page);
                                setPageSize(pageSize);
                                fetchDiscountCodes(page, pageSize, searchText);
                            },
                            showTotal: (total) => `Total ${total} items`,
                        }}
                        scroll={{ x: 'max-content' }}
                        className="overflow-x-auto"
                        onRow={(record) => ({
                            onClick: () => handleRowClick(record),
                        })}
                    />
                </Card>
            </Content>
            <ModalDiscount
                editingId={editingId}
                isModalVisible={isModalVisible}
                handleCancel={handleCancel}
                form={form}
                handleSubmit={handleSubmit}
            />
            <ModalOderDiscount
                orderModalVisible={orderModalVisible}
                setOrderModalVisible={setOrderModalVisible}
                selectedDiscount={selectedDiscount}
            />
        </Layout>
    );
};

export default DiscountCodeAdmin;