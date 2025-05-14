// src/services/productService.js
import axios from "axios";

export const fetchProductById = async (id) => {
  const response = await axios.get(`http://localhost:3000/api/products/${id}`);
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