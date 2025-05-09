// src/pages/ProductCatalogPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Input, Row, Col, Typography, Button, Spin, Layout } from 'antd';
import { AppstoreOutlined, BarsOutlined } from '@ant-design/icons';
import ProductList from '../../../components/products/ProductList';
import ProductFilter from '../../../components/products/ProductFilter';
import ProductSort from '../../../components/products/ProductSort';
import AppPagination from '../../../components/AppPagination';
// import { fetchProducts } from '../../../services/productService'; // API call

const { Search } = Input;
const { Title } = Typography;

// Mock Data (IMPORTANT: Replace with actual API calls and data)
const allMockProducts = Array.from({ length: 50 }, (_, i) => ({
  id: `prod${i + 1}`,
  name: `Awesome Product ${i + 1} - Model X${i%5 + 1} Series ${String.fromCharCode(65 + i%3)}`,
  price: parseFloat((Math.random() * 200 + 20).toFixed(2)),
  images: [
    { url: `https://picsum.photos/seed/${i+1}/400/300` }, // Placeholder image
    { url: `https://picsum.photos/seed/a${i+1}/400/300` },
    { url: `https://picsum.photos/seed/b${i+1}/400/300` },
  ],
  shortDescription: 'This is a great product that you will absolutely love. It has many features and comes in various colors. High quality materials ensure durability. Perfect for everyday use or as a gift.',
  brand: { id: `brand${(i % 3) + 1}`, name: ['Sony', 'Apple', 'Generic Brand'][(i % 3)] },
  category: { id: `cat${(i % 4) + 1}`, name: ['Electronics', 'Books', 'Home Goods', 'Apparel'][(i % 4)] },
  tags: [['New', 'Sale', 'Featured'][i % 3]],
  rating: Math.floor(Math.random() * 5) + 1,
  variants: [ // Every product must have at least two variants
    { id: `var${i+1}a`, name: 'Red, Small', stock: Math.floor(Math.random() * 10) },
    { id: `var${i+1}b`, name: 'Blue, Medium', stock: Math.floor(Math.random() * 15) },
    { id: `var${i+1}c`, name: 'Green, Large', stock: Math.floor(Math.random() * 5) },
  ]
}));


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

  const fetchAndFilterProducts = useCallback(() => {
    setLoading(true);
    console.log("Fetching with:", { currentPage, pageSize, searchTerm, sortOption, filters });

    // --- SIMULATE API CALL ---
    let filteredProducts = [...allMockProducts];

    // Search
    if (searchTerm) {
      filteredProducts = filteredProducts.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.shortDescription.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.brand.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filters
    if (filters.category) {
      filteredProducts = filteredProducts.filter(p => p.category.id === filters.category);
    }
    if (filters.brand && filters.brand.length > 0) {
      filteredProducts = filteredProducts.filter(p => filters.brand.includes(p.brand.id));
    }
    if (filters.minPrice !== undefined) {
      filteredProducts = filteredProducts.filter(p => p.price >= filters.minPrice);
    }
    if (filters.maxPrice !== undefined) {
      filteredProducts = filteredProducts.filter(p => p.price <= filters.maxPrice);
    }
    if (filters.rating) {
      filteredProducts = filteredProducts.filter(p => p.rating >= filters.rating);
    }

    // Sorting
    switch (sortOption) {
      case 'name_asc':
        filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name_desc':
        filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'price_asc':
        filteredProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        filteredProducts.sort((a, b) => b.price - a.price);
        break;
      case 'relevance': // No specific relevance logic in mock
      default:
        break;
    }
    
    const paginatedProducts = filteredProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    
    setTimeout(() => { // Simulate network delay
      setProducts(paginatedProducts);
      setTotalProducts(filteredProducts.length);
      setLoading(false);
    }, 500);
    // --- END SIMULATION ---

    /* // Real API Call Example:
    fetchProducts({ page: currentPage, limit: pageSize, search: searchTerm, sort: sortOption, ...filters })
      .then(data => {
        setProducts(data.products);
        setTotalProducts(data.totalCount);
        setLoading(false);
      })
      .catch(error => {
        console.error("Failed to fetch products:", error);
        message.error("Could not load products.");
        setLoading(false);
      });
    */
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
          <Col xs={24} md={6} lg={5}> {/* Sidebar for filters */}
            <ProductFilter onFilterChange={handleFilterChange} initialFilters={filters} />
          </Col>
          <Col xs={24} md={18} lg={19}> {/* Main content area for products */}
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