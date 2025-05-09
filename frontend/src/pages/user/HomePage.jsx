import React, { useState, useEffect } from 'react';
import { Layout, Menu, Input, Button, Card, Carousel, Row, Col, Typography, Badge, Space, Avatar, Dropdown } from 'antd';
import {
  SearchOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  LaptopOutlined,
  DesktopOutlined,
  HddOutlined,
/*************  ✨ Windsurf Command ⭐  *************/
  /**
   * Chuyển hướng đến trang đăng nhập
   */
/*******  38fe3618-8e4a-4c64-8119-e39600324f71  *******/  RocketOutlined,
  FireOutlined,
  HomeOutlined,
  DownOutlined
} from '@ant-design/icons';

const { Header, Content, Footer } = Layout;
const { Title, Text, Link } = Typography;
const { Meta } = Card;

// --- Mock Data (Replace with API calls in a real app) ---
const allProducts = [
  // New Products
  { id: 1, name: 'Laptop Gaming XYZ Pro Max', price: 1599.99, image: 'https://placehold.co/300x200/e81f27/white?text=New+Laptop', category: 'new', tags: ['laptop', 'gaming'] },
  { id: 2, name: 'Siêu Mỏng ABC Ultrabook', price: 1299.00, image: 'https://placehold.co/300x200/3498db/white?text=New+Ultrabook', category: 'new', tags: ['laptop', 'ultrabook'] },
  { id: 3, name: 'Màn Hình Cong 34" Ultrawide', price: 799.50, image: 'https://placehold.co/300x200/2ecc71/white?text=New+Monitor', category: 'new', tags: ['monitor'] },
  { id: 4, name: 'SSD NVMe Gen5 2TB Tốc Độ Cao', price: 299.00, image: 'https://placehold.co/300x200/f39c12/white?text=New+SSD', category: 'new', tags: ['hard_drive', 'ssd'] },

  // Best Sellers
  { id: 5, name: 'Laptop Bán Chạy Nhất 2023', price: 999.00, image: 'https://placehold.co/300x200/9b59b6/white?text=Best+Seller+Laptop', category: 'bestseller', tags: ['laptop'] },
  { id: 6, name: 'Màn Hình 27" 144Hz Gaming', price: 349.00, image: 'https://placehold.co/300x200/1abc9c/white?text=Best+Seller+Monitor', category: 'bestseller', tags: ['monitor', 'gaming'] },
  { id: 7, name: 'HDD 4TB Enterprise NAS', price: 149.99, image: 'https://placehold.co/300x200/e74c3c/white?text=Best+Seller+HDD', category: 'bestseller', tags: ['hard_drive'] },
  { id: 8, name: 'Bàn Phím Cơ RGB TKL', price: 89.00, image: 'https://placehold.co/300x200/7f8c8d/white?text=Best+Seller+Keyboard', category: 'bestseller', tags: ['accessory'] },

  // Laptops
  { id: 9, name: 'Laptop Văn Phòng Essential', price: 699.00, image: 'https://placehold.co/300x200/16a085/white?text=Office+Laptop', category: 'laptops', tags: ['laptop'] },
  { id: 10, name: 'MacBook Air M2', price: 1199.00, image: 'https://placehold.co/300x200/27ae60/white?text=MacBook+Air', category: 'laptops', tags: ['laptop', 'apple'] },
  { id: 11, name: 'Laptop 2-in-1 Cảm Ứng', price: 899.00, image: 'https://placehold.co/300x200/2980b9/white?text=2-in-1+Laptop', category: 'laptops', tags: ['laptop', '2-in-1'] },
  { id: 12, name: 'Workstation Laptop Hiệu Năng Cao', price: 2200.00, image: 'https://placehold.co/300x200/8e44ad/white?text=Workstation', category: 'laptops', tags: ['laptop', 'workstation'] },
  
  // Monitors
  { id: 13, name: 'Màn Hình 24" IPS Full HD', price: 159.00, image: 'https://placehold.co/300x200/f1c40f/white?text=24+IPS+Monitor', category: 'monitors', tags: ['monitor'] },
  { id: 14, name: 'Màn Hình 32" 4K ProArt', price: 899.00, image: 'https://placehold.co/300x200/e67e22/white?text=32+4K+Monitor', category: 'monitors', tags: ['monitor', '4k'] },
  { id: 15, name: 'Màn Hình Portable 15.6"', price: 220.00, image: 'https://placehold.co/300x200/d35400/white?text=Portable+Monitor', category: 'monitors', tags: ['monitor', 'portable'] },

  // Hard Drives / Storage
  { id: 16, name: 'SSD SATA 1TB Samsung EVO', price: 99.00, image: 'https://placehold.co/300x200/c0392b/white?text=SATA+SSD', category: 'hard_drives', tags: ['hard_drive', 'ssd'] },
  { id: 17, name: 'HDD External 2TB Seagate', price: 69.00, image: 'https://placehold.co/300x200/bdc3c7/white?text=External+HDD', category: 'hard_drives', tags: ['hard_drive', 'external'] },
  { id: 18, name: 'Thẻ Nhớ MicroSD 256GB', price: 35.00, image: 'https://placehold.co/300x200/34495e/white?text=MicroSD', category: 'hard_drives', tags: ['storage', 'microsd'] },

  // PC Components
  { id: 19, name: 'VGA RTX 4070 Super', price: 699.00, image: 'https://placehold.co/300x200/95a5a6/white?text=RTX+4070', category: 'components', tags: ['vga', 'gpu'] },
  { id: 20, name: 'CPU Intel Core i7 Gen 14', price: 399.00, image: 'https://placehold.co/300x200/1abc9c/white?text=Intel+i7', category: 'components', tags: ['cpu'] },
  { id: 21, name: 'RAM DDR5 32GB Kit (2x16GB)', price: 129.00, image: 'https://placehold.co/300x200/2ecc71/white?text=RAM+DDR5', category: 'components', tags: ['ram'] },
];

const filterProducts = (categoryKey) => {
  return allProducts.filter(p => p.category === categoryKey).slice(0, 4); // Show 4 products per section
};
// --- End Mock Data ---


const ProductCard = ({ product }) => (
  <Col xs={24} sm={12} md={8} lg={6} className="p-2">
    <Card
      hoverable
      className="shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg overflow-hidden"
      cover={<img alt={product.name} src={product.image} className="h-48 w-full object-cover" />}
      actions={[
        <Button type="primary" danger icon={<ShoppingCartOutlined />} className="bg-brand-primary hover:bg-red-700 border-brand-primary">
          Thêm vào giỏ
        </Button>
      ]}
    >
      <Meta
        title={<Link href="#" className="text-gray-800 hover:text-brand-primary text-base font-semibold truncate">{product.name}</Link>}
        description={<Text strong className="text-brand-primary text-lg">${product.price.toFixed(2)}</Text>}
      />
      {/* You can add more details like ratings or short description here if needed */}
    </Card>
  </Col>
);

const ProductSection = ({ title, products, icon }) => (
  <div className="mb-12">
    <div className="flex items-center mb-6">
      {icon && React.cloneElement(icon, { className: "text-2xl mr-3 text-brand-primary"})}
      <Title level={2} className="!mb-0 !text-2xl font-bold text-gray-800">{title}</Title>
      <Link href="#" className="ml-auto text-brand-primary hover:text-red-700 font-medium">Xem tất cả <span aria-hidden="true">→</span></Link>
    </div>
    <Row gutter={[16, 16]}>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </Row>
  </div>
);


const HomePage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Mock login state
  const [cartItemCount, setCartItemCount] = useState(0); // Mock cart count

  // In a real app, these would come from API / context
  const newProducts = filterProducts('new');
  const bestSellers = filterProducts('bestseller');
  const laptops = filterProducts('laptops');
  const monitors = filterProducts('monitors');
  const hardDrives = filterProducts('hard_drives');
  const components = filterProducts('components');

  const handleLogin = () => setIsLoggedIn(true);
  const handleLogout = () => setIsLoggedIn(false);

  const userMenu = (
    <Menu>
      <Menu.Item key="profile">Trang cá nhân</Menu.Item>
      <Menu.Item key="orders">Đơn hàng của tôi</Menu.Item>
      <Menu.Item key="logout" onClick={handleLogout}>Đăng xuất</Menu.Item>
    </Menu>
  );

  return (
    <Layout className="min-h-screen bg-gray-50">
      {/* --- Header --- */}
      <Header className="bg-white shadow-md sticky top-0 z-50 px-4 md:px-8">
        <div className="container mx-auto flex items-center justify-between h-full">
          {/* Logo */}
          <div className="text-2xl font-bold text-brand-primary">
            <a href="/">LOGO<span className="text-gray-700">SHOP</span></a>
          </div>

          {/* Search Bar - Centered and more prominent */}
          <div className="hidden md:flex flex-grow max-w-xl mx-4">
            <Input
              size="large"
              placeholder="Tìm kiếm sản phẩm, danh mục, ..."
              prefix={<SearchOutlined className="text-gray-400" />}
              className="rounded-lg"
            />
          </div>
          
          {/* User Actions */}
          <Space size="middle">
            <Badge count={cartItemCount} size="small">
              <Button 
                type="text" 
                icon={<ShoppingCartOutlined className="text-2xl text-gray-700 hover:text-brand-primary" />}
                onClick={() => console.log("Open Cart")}
              />
            </Badge>
            {isLoggedIn ? (
              <Dropdown overlay={userMenu} trigger={['click']}>
                <a onClick={e => e.preventDefault()} className="flex items-center text-gray-700 hover:text-brand-primary">
                  <Avatar icon={<UserOutlined />} size="small" className="mr-2" /> Xin chào, User <DownOutlined className="ml-1" />
                </a>
              </Dropdown>
            ) : (
              <Button type="primary" ghost className="border-brand-primary text-brand-primary hover:!bg-brand-primary hover:!text-white" onClick={handleLogin}>
                Đăng nhập
              </Button>
            )}
          </Space>
        </div>
        {/* Mobile Search Bar */}
        <div className="md:hidden mt-2">
           <Input
              placeholder="Tìm kiếm sản phẩm..."
              prefix={<SearchOutlined className="text-gray-400" />}
              className="rounded-lg w-full"
            />
        </div>
      </Header>

      {/* --- Main Content --- */}
      <Content className="container mx-auto px-4 py-8">
        {/* Hero Carousel/Banner Section */}
        <Carousel autoplay className="mb-12 rounded-lg overflow-hidden shadow-lg">
          <div>
            <img src="https://placehold.co/1200x400/e81f27/white?text=Khuyen+Mai+HAP+DAN+1" alt="Banner 1" className="w-full h-auto md:h-[400px] object-cover"/>
          </div>
          <div>
            <img src="https://placehold.co/1200x400/3498db/white?text=SAN+PHAM+MOI+RA+MAT" alt="Banner 2" className="w-full h-auto md:h-[400px] object-cover"/>
          </div>
          <div>
            <img src="https://placehold.co/1200x400/2ecc71/white?text=LAPTOP+GAMING+GIA+TOT" alt="Banner 3" className="w-full h-auto md:h-[400px] object-cover"/>
          </div>
        </Carousel>

        {/* Product Sections */}
        <ProductSection title="Sản Phẩm Mới" products={newProducts} icon={<RocketOutlined />} />
        <ProductSection title="Bán Chạy Nhất" products={bestSellers} icon={<FireOutlined />} />
        <ProductSection title="Laptop Tuyển Chọn" products={laptops} icon={<LaptopOutlined />} />
        <ProductSection title="Màn Hình Chất Lượng" products={monitors} icon={<DesktopOutlined />} />
        <ProductSection title="Ổ Cứng & Lưu Trữ" products={hardDrives} icon={<HddOutlined />} />
        <ProductSection title="Linh Kiện PC" products={components} icon={<HomeOutlined />} /> 
        {/* Added HomeOutlined as a placeholder for PC Components */}

      </Content>

      {/* --- Footer --- */}
      <Footer className="bg-gray-800 text-gray-300 text-center py-8">
        <div className="container mx-auto">
          <Row gutter={[16, 32]}>
            <Col xs={24} md={8}>
              <Title level={4} className="!text-gray-100">Về LOGOSHOP</Title>
              <ul className="list-none p-0">
                <li><Link href="#" className="text-gray-400 hover:text-white">Giới thiệu</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white">Tuyển dụng</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white">Liên hệ</Link></li>
              </ul>
            </Col>
            <Col xs={24} md={8}>
              <Title level={4} className="!text-gray-100">Hỗ Trợ Khách Hàng</Title>
              <ul className="list-none p-0">
                <li><Link href="#" className="text-gray-400 hover:text-white">Chính sách bảo hành</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white">Chính sách đổi trả</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white">Hướng dẫn mua hàng</Link></li>
              </ul>
            </Col>
            <Col xs={24} md={8}>
              <Title level={4} className="!text-gray-100">Kết Nối Với Chúng Tôi</Title>
              {/* Add social media icons here */}
              <Text className="text-gray-400">Địa chỉ: 123 Đường ABC, Quận XYZ, TP. HCM</Text><br/>
              <Text className="text-gray-400">Email: support@logoshop.com</Text>
            </Col>
          </Row>
          <div className="mt-8 pt-8 border-t border-gray-700">
            LOGOSHOP ©{new Date().getFullYear()} - All Rights Reserved.
          </div>
        </div>
      </Footer>
    </Layout>
  );
};

export default HomePage;