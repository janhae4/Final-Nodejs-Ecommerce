// src/components/products/ProductList.jsx
import React from 'react';
import ProductCard from './ProductCard';
import { Empty, Row, Col, List } from 'antd'; // Ant Design for Grid/List

const ProductList = ({ products, loading, viewMode = 'grid' }) => {
  if (loading) {
    // Placeholder for loading state, e.g., skeleton loaders
    return (
      <Row gutter={[16, 16]}>
        {[...Array(8)].map((_, index) => (
          <Col key={index} xs={24} sm={12} md={8} lg={viewMode === 'grid' ? 6 : 24}>
            <div className="bg-gray-200 h-80 rounded-lg animate-pulse"></div>
          </Col>
        ))}
      </Row>
    );
  }

  if (!products || products.length === 0) {
    return <Empty description="No products found matching your criteria." className="py-10" />;
  }

  if (viewMode === 'list') {
    return (
      <List
        itemLayout="vertical" // Or horizontal for a different list style
        dataSource={products}
        renderItem={product => (
          <List.Item key={product.id} className="p-0 mb-4 border-0"> {/* Remove default List.Item padding/border */}
            <ProductCard product={product} viewMode="list" />
          </List.Item>
        )}
      />
    );
  }

  // Grid View
  return (
    <Row gutter={[16, 24]}> {/* Horizontal and vertical gutters */}
      {products.map(product => (
        <Col key={product.id} xs={24} sm={12} md={8} lg={6}> {/* Responsive grid */}
          <ProductCard product={product} viewMode="grid" />
        </Col>
      ))}
    </Row>
  );
};

export default ProductList;