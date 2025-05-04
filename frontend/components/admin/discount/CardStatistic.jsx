import React from 'react'
import { Row, Col, Card, Statistic } from 'antd'
import { TagOutlined, CodeOutlined } from '@ant-design/icons';
const CardStatistic = ({stats}) => {
    return (
        <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} sm={12} md={6}>
                <Card variant='borderless' className="hover:shadow-md transition-shadow">
                    <Statistic
                        title="Total Discount Codes"
                        value={stats.total}
                        prefix={<TagOutlined />}
                        valueStyle={{ color: '#1890ff' }}
                    />
                </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
                <Card variant='borderless' className="hover:shadow-md transition-shadow">
                    <Statistic
                        title="Active Codes"
                        value={stats.active}
                        valueStyle={{ color: '#3f8600' }}
                        prefix={<TagOutlined />}
                    />
                </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
                <Card variant='borderless' className="hover:shadow-md transition-shadow">
                    <Statistic
                        title="Inactive Codes"
                        value={stats.inactive}
                        valueStyle={{ color: '#cf1322' }}
                        prefix={<TagOutlined />}
                    />
                </Card>
            </Col>
            <Col xs={24} sm={12} md={6}>
                <Card variant='borderless' className="hover:shadow-md transition-shadow">
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
    )
}

export default CardStatistic