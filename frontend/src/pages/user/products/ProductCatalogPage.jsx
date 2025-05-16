// src/pages/ProductCatalogPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Input, Row, Col, Typography, Button, Spin, Layout, message } from 'antd';
import { AppstoreOutlined, BarsOutlined } from '@ant-design/icons';
import ProductList from '../../../components/products/ProductList';
import ProductFilter from '../../../components/products/ProductFilter';
import ProductSort from '../../../components/products/ProductSort';
import AppPagination from '../../../components/AppPagination';

const { Search } = Input;
const { Title } = Typography;

const ProductCatalogPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12); // Number of products per page
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('relevance'); // Default sort
  const [filters, setFilters] = useState({}); // { category: 'electronics', minPrice: 50, brand: ['sony'] }
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  const [messageApi, contextHolder] = message.useMessage();

  const fetchAndFilterProducts = useCallback(() => {
    setLoading(true);
    
    // Xây dựng query params
    const queryParams = new URLSearchParams();
  
    if (searchTerm) queryParams.append("nameProduct", searchTerm);
    if (filters.category) queryParams.append("category", filters.category);
    if (filters.brand && filters.brand.length > 0) {
      // Nếu brand là mảng, có thể gửi lặp lại hoặc join
      filters.brand.forEach(b => queryParams.append("brand", b)); // hoặc join bằng dấu phẩy
    }
    if (filters.minPrice !== undefined) queryParams.append("minPrice", filters.minPrice);
    if (filters.maxPrice !== undefined) queryParams.append("maxPrice", filters.maxPrice);
  
    // Sort
    if (sortOption === 'price_asc') {
      queryParams.append("sortBy", "price");
      queryParams.append("sortOrder", "asc");
    } else if (sortOption === 'price_desc') {
      queryParams.append("sortBy", "price");
      queryParams.append("sortOrder", "desc");
    } else if (sortOption === 'name_asc') {
      queryParams.append("sortBy", "nameProduct");
      queryParams.append("sortOrder", "asc");
    } else if (sortOption === 'name_desc') {
      queryParams.append("sortBy", "nameProduct");
      queryParams.append("sortOrder", "desc");
    }
  
    queryParams.append("page", currentPage);
    queryParams.append("pageSize", pageSize);
  
    fetch(`http://localhost:3000/api/products/search?${queryParams.toString()}`)
      .then(res => res.json())
      .then(data => {
        if (data.status) {
          setProducts(data.products);
          setTotalProducts(data.totalProducts);
        } else {
          message.error(data.message || "Lỗi khi tải sản phẩm");
        }
        setLoading(false);
      })
      .catch(error => {
        console.error("Failed to fetch products:", error);
        message.error("Không thể tải sản phẩm");
        setLoading(false);
      });
  }, [currentPage, pageSize, searchTerm, sortOption, filters]);
  

  useEffect(() => {
    fetchAndFilterProducts();
  }, [fetchAndFilterProducts]); // Re-fetch when any dependency changes

  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page on new search
  };

  const handleSortChange = (value) => {
    setSortOption(value);
    setCurrentPage(1); // Reset to first page on new sort
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page on new filters
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <Layout>
      {contextHolder}
      <div className="container mx-auto p-4 md:p-8">
        <Title level={2} className="mb-6 text-center md:text-left">Product Catalog</Title>
        
        <Row gutter={[16, 16]} className="mb-6 items-center">
          <Col xs={24} md={12}>
            <Search
              placeholder="Search products by name, brand..."
              onSearch={handleSearch}
              enterButton
              size="large"
            />
          </Col>
          <Col xs={24} md={12} className="flex justify-end items-center space-x-4">
            <ProductSort currentSort={sortOption} onSortChange={handleSortChange} />
            <div>
              <Button 
                icon={<AppstoreOutlined />} 
                onClick={() => setViewMode('grid')}
                type={viewMode === 'grid' ? 'primary' : 'default'}
                className={viewMode === 'grid' ? 'bg-blue-500' : ''}
              />
              <Button 
                icon={<BarsOutlined />} 
                onClick={() => setViewMode('list')}
                type={viewMode === 'list' ? 'primary' : 'default'}
                className={viewMode === 'list' ? 'bg-blue-500' : ''}
              />
            </div>
          </Col>
        </Row>

        <Row gutter={[24, 24]}>
          <Col xs={24} md={7} lg={6}> {/* Sidebar for filters */}
            <ProductFilter onFilterChange={handleFilterChange} initialFilters={filters} />
          </Col>
          <Col xs={24} md={17} lg={18}> {/* Main content area for products */}
            {loading ? (
                <div className="flex justify-center items-center h-64"><Spin size="large" /></div>
            ) : (
                <ProductList products={products} loading={loading} viewMode={viewMode} />
            )}
            <AppPagination
              currentPage={currentPage}
              totalItems={totalProducts}
              pageSize={pageSize}
              onChange={handlePageChange}
            />
          </Col>
        </Row>
      </div>
    </Layout>
  );
};

export default ProductCatalogPage;