import React, { useEffect, useState } from 'react';
import { Table, Input, Select, Pagination, Row, Col, Card, Tag, Button, Grid } from 'antd';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const { Search } = Input;
const { Option } = Select;
const { useBreakpoint } = Grid;

const ProductCatalog = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;
  const navigate = useNavigate();
  const screens = useBreakpoint();

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/products/');
      const data = response.data.products || [];

      setProducts(data);
      setFilteredProducts(data);
    } catch (error) {
      console.error('Error while getting product list:', error.message);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSearch = (value) => {
    setSearchKeyword(value);
    applyFilters(value, selectedBrand, selectedCategory, selectedTag);
  };

  const handleFilterChange = (type, value) => {
    if (type === 'brand') setSelectedBrand(value);
    if (type === 'category') setSelectedCategory(value);
    if (type === 'tag') setSelectedTag(value);
    applyFilters(
      searchKeyword,
      type === 'brand' ? value : selectedBrand,
      type === 'category' ? value : selectedCategory,
      type === 'tag' ? value : selectedTag
    );
  };

  const applyFilters = (keyword, brand, category, tag) => {
    let filtered = [...products];

    if (keyword) {
      filtered = filtered.filter(p => p.nameProduct.toLowerCase().includes(keyword.toLowerCase()));
    }
    if (brand) {
      filtered = filtered.filter(p => p.brand === brand);
    }
    if (category) {
      filtered = filtered.filter(p => p.category === category);
    }
    if (tag) {
      filtered = filtered.filter(p => p.tags.includes(tag));
    }

    setFilteredProducts(filtered);
    setCurrentPage(1);
  };

  const paginatedProducts = filteredProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div style={{ padding: 20 }}>
      {/* Add Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
        <Button
          type="primary"
          onClick={() => navigate('/admin/products/create')}
          style={{ backgroundColor: 'green', borderColor: 'green', color: 'white' }}
        >
          + Add Product
        </Button>
      </div>

      {/* Search and Filters */}
      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={12} md={6}>
          <Search placeholder="Find product..." onSearch={handleSearch} allowClear />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Select
            placeholder="Filter by Brand"
            style={{ width: '100%' }}
            onChange={(value) => handleFilterChange('brand', value)}
            allowClear
          >
            {[...new Set(products.map(p => p.brand))].map(brand => (
              <Option key={brand} value={brand}>{brand}</Option>
            ))}
          </Select>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Select
            placeholder="Filter by Category"
            style={{ width: '100%' }}
            onChange={(value) => handleFilterChange('category', value)}
            allowClear
          >
            {[...new Set(products.map(p => p.category))].map(category => (
              <Option key={category} value={category}>{category}</Option>
            ))}
          </Select>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Select
            placeholder="Filter by Tag"
            style={{ width: '100%' }}
            onChange={(value) => handleFilterChange('tag', value)}
            allowClear
          >
            {[...new Set(products.flatMap(p => p.tags))].map(tag => (
              <Option key={tag} value={tag}>{tag}</Option>
            ))}
          </Select>
        </Col>
      </Row>

      {/* Product List */}
      <Row gutter={[16, 16]}>
        {paginatedProducts.length > 0 ? (
          paginatedProducts.map(product => (
            <Col key={product._id} xs={24} sm={12} md={8} lg={6}>
              <Card
                hoverable
                style={{
                  height: 400,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
                cover={
                  <img
                    alt={product.nameProduct}
                    src={product.images[0]}
                    style={{
                      height: '200px',
                      width: '100%',
                      objectFit: 'cover',
                    }}
                  />
                }
                onClick={() => window.location.href = `/admin/products/detail/${product._id}`}
              >
                <Card.Meta
                  title={product.nameProduct}
                  description={
                    <div style={{ height: 130, overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div><strong>Price:</strong> {product.price.toLocaleString()} VNĐ</div>
                      <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        <strong>Description:</strong> {product.shortDescription}
                      </div>
                      <div style={{ height: 48, overflow: 'hidden', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {product.tags.map(tag => (
                          <Tag color="blue" key={tag}>{tag}</Tag>
                        ))}
                      </div>
                    </div>
                  }
                />
              </Card>
            </Col>
          ))
        ) : (
          <div style={{ margin: 'auto' }}>There are no products.</div>
        )}
      </Row>

      {/* Pagination */}
      <div style={{ marginTop: 20, textAlign: 'center' }}>
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={filteredProducts.length}
          onChange={(page) => setCurrentPage(page)}
          showSizeChanger={false}
        />
      </div>
    </div>
  );
};

export default ProductCatalog;
