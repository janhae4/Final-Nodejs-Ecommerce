import React, { useState, useEffect, useCallback } from "react";
import {
  Input,
  Row,
  Col,
  Typography,
  Button,
  Spin,
  Layout,
  message,
} from "antd";
import { AppstoreOutlined, BarsOutlined } from "@ant-design/icons";
import axios from "axios";
import ProductList from "../../../components/products/ProductList";
import ProductFilter from "../../../components/products/ProductFilter";
import ProductSort from "../../../components/products/ProductSort";
import AppPagination from "../../../components/AppPagination";

const { Search } = Input;
const { Title } = Typography;

const ProductCatalogPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("relevance");
  const [filters, setFilters] = useState({});
  const [viewMode, setViewMode] = useState("grid");

  const API_URL = import.meta.env.VITE_API_URL;

  const fetchAndFilterProducts = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();

      if (searchTerm) queryParams.append("keyword", searchTerm);
      if (filters.category) queryParams.append("category", filters.category);
      if (filters.brand?.length)
        filters.brand.forEach((b) => queryParams.append("brand", b));
      if (filters.minPrice !== undefined)
        queryParams.append("minPrice", filters.minPrice);
      if (filters.maxPrice !== undefined)
        queryParams.append("maxPrice", filters.maxPrice);
      if (filters.minRating !== undefined) queryParams.append("minRating", filters.minRating);

      switch (sortOption) {
        case "price_asc":
          queryParams.append("sortBy", "price");
          queryParams.append("sortOrder", "asc");
          break;
        case "price_desc":
          queryParams.append("sortBy", "price");
          queryParams.append("sortOrder", "desc");
          break;
        case "name_asc":
          queryParams.append("sortBy", "nameProduct");
          queryParams.append("sortOrder", "asc");
          break;
        case "name_desc":
          queryParams.append("sortBy", "nameProduct");
          queryParams.append("sortOrder", "desc");
          break;
        default:
          queryParams.append("sortBy", "createdAt");
          queryParams.append("sortOrder", "desc");
          break;
      }

      queryParams.append("page", currentPage);
      queryParams.append("limit", pageSize);

      const { data } = await axios.get(
        `${API_URL}/products/search?${queryParams.toString()}`
      );

      if (data.status) {
        setProducts(data.products);
        setTotalProducts(data.totalProducts);
      } else {
        message.error(data.message || "Lỗi khi tải sản phẩm");
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
      message.error("Không thể tải sản phẩm");
    } finally {
      setLoading(false);
    }
  }, [API_URL, currentPage, pageSize, searchTerm, sortOption, filters]);

  useEffect(() => {
    fetchAndFilterProducts();
  }, [fetchAndFilterProducts]);

  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleSortChange = (value) => {
    setSortOption(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <Layout>
      <div className="container mx-auto p-4 md:p-8">
        <Title level={2} className="mb-6 text-center md:text-left">
          Product Catalog
        </Title>

        <Row gutter={[16, 16]} className="mb-6 items-center">
          <Col xs={24} md={12}>
            <Search
              placeholder="Search products by name, brand..."
              onSearch={handleSearch}
              enterButton
              size="large"
            />
          </Col>
          <Col
            xs={24}
            md={12}
            className="flex justify-end items-center space-x-4"
          >
            <ProductSort
              currentSort={sortOption}
              onSortChange={handleSortChange}
            />
            <div>
              <Button
                icon={<AppstoreOutlined />}
                onClick={() => setViewMode("grid")}
                type={viewMode === "grid" ? "primary" : "default"}
                className={viewMode === "grid" ? "bg-blue-500" : ""}
              />
              <Button
                icon={<BarsOutlined />}
                onClick={() => setViewMode("list")}
                type={viewMode === "list" ? "primary" : "default"}
                className={viewMode === "list" ? "bg-blue-500" : ""}
              />
            </div>
          </Col>
        </Row>

        <Row gutter={[24, 24]}>
          <Col xs={24} md={7} lg={6}>
            {" "}
            {/* Sidebar for filters */}
            <ProductFilter
              onFilterChange={handleFilterChange}
              initialFilters={filters}
            />
          </Col>
          <Col xs={24} md={17} lg={18}>
            {" "}
            {/* Main content area for products */}
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Spin size="large" />
              </div>
            ) : (
              <ProductList
                products={products}
                loading={loading}
                viewMode={viewMode}
              />
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
