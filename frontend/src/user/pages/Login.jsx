import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Hàm xử lý khi người dùng submit form đăng nhập
    const handleLogin = async (values) => {
        setLoading(true);
        try {
            const response = await axios.post('http://localhost:3000/api/auth/login', {
                email: values.email,
                password: values.password
            });
    
            const { token, user } = response.data;
            console.log('User data:', user); // Log thông tin người dùng trả về
    
            // Kiểm tra tài khoản bị cấm
            if (user.isBanned) {
                console.log('User is banned:', user.isBanned); // Log giá trị isBanned
                alert('Tài khoản của bạn đã bị cấm.');
                setLoading(false);
                return; // Dừng xử lý nếu tài khoản bị cấm
            }
    
            // Nếu tài khoản không bị cấm, lưu token và chuyển hướng
            localStorage.setItem('authToken', token);
            message.success('Đăng nhập thành công!');
            
            // Chuyển hướng theo vai trò người dùng
            if (user.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/');
            }
        } catch (error) {
            // Xử lý nếu có lỗi trong quá trình gửi yêu cầu hoặc nhận dữ liệu
            console.error('Login error:', error);  // Log chi tiết lỗi
            message.error('Đăng nhập thất bại. Vui lòng kiểm tra lại!');
        } finally {
            setLoading(false);  // Dừng trạng thái loading dù thành công hay thất bại
        }
    };
    
    

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
