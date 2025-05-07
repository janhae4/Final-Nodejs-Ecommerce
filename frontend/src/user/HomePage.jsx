import React from 'react';
import { Typography, Button, Space } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;

const Home = () => {
  const navigate = useNavigate();

  const goToLogin = () => {
    navigate('/login');
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 24px' }}>
      <Title level={2}>Chào mừng đến với cửa hàng điện tử</Title>
      <Paragraph>
        Chúng tôi cung cấp các sản phẩm điện tử chất lượng cao: laptop, điện thoại, phụ kiện,...
      </Paragraph>

      <Space size="middle" wrap>
        <Button type="primary" size="large" onClick={() => navigate('/products')}>
          Xem sản phẩm
        </Button>
        <Button size="large" onClick={goToLogin}>
          Đăng nhập
        </Button>
        <Button size="large" onClick={() => navigate('/register')}>
          Đăng ký
        </Button>
        <Button size="large" onClick={() => navigate('/profile')}>
          Quản lý tài khoản
        </Button>
      </Space>
    </div>
  );
};

export default Home;
