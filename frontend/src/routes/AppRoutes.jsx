import { Routes, Route } from 'react-router-dom'
// Admin pages
import Dashboard from '../pages/admin/Dashboard.jsx'
import DiscountCodeAdmin from '../pages/admin/discount/Discount'
import CreateProduct from '../pages/admin/product/CreateProduct.jsx'
import ProductCatalog from '../pages/admin/product/ProductCatalog.jsx'
import ProductDetail from '../pages/admin/product/ProductDetail.jsx'
import EditProduct from '../pages/admin/product/ProductEdit.jsx'
import AdminLayout from '../pages/admin/AdminLayout'
import OrderAdmin from '../pages/admin/order/Order.jsx'
import '../App.css'

export default function AppRoutes() {
    return (
        <Routes>
            {/* Admin layout */}
            <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="discounts" element={<DiscountCodeAdmin />} />
                <Route path="orders" element={<OrderAdmin />} />
                <Route path="products" element={<ProductCatalog />} />
                <Route path="products/detail/:productId" element={<ProductDetail />} />
                <Route path="products/create" element={<CreateProduct />} />
                <Route path="products/edit/:id" element={<EditProduct />} />
            </Route>
        </Routes>
    )
}
