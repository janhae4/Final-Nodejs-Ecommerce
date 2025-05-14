// src/services/productService.js
import axios from "axios";

export const fetchProductById = async (slug) => {
  const response = await axios.get(`http://localhost:3000/api/products/slug/${slug}`);
  return response.data.product;
};

export const fetchCategories = async () => {
  const response = await axios.get("http://localhost:3000/api/products/categories");
  return response.data.categories;
}

export const fetchBrands = async () => {
  const response = await axios.get("http://localhost:3000/api/products/brands");
  return response.data.brands;
};