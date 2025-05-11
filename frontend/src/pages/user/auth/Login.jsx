import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    return (
        <div style={{ maxWidth: 400, margin: '100px auto' }}>
            <h2>Đăng nhập</h2>
            <Form onFinish={handleLogin} layout="vertical">
                <Form.Item
                    label="Email"
                    name="email"
                    rules={[{ required: true, type: 'email', message: 'Vui lòng nhập email hợp lệ!' }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    label="Mật khẩu"
                    name="password"
                    rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
                >
                    <Input.Password />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        Đăng nhập
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default Login;
