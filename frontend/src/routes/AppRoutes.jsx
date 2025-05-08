import { Routes, Route } from 'react-router-dom'
import '../App.css'
// Admin pages
import AdminLayout from '../pages/admin/AdminLayout'
import DiscountCodeAdmin from '../pages/admin/discount/Discount'
import CreateProduct from '../pages/admin/product/CreateProduct'
import ProductCatalog from '../pages/admin/product/ProductCatalog'
import ProductDetail from '../pages/admin/product/ProductDetail'
import EditProduct from '../pages/admin/product/ProductEdit'
import Dashboard from '../pages/admin/Dashboard'
import OrderAdmin from '../pages/admin/order/Order'

export default function AppRoutes() {
    return (
        <Routes>
            {/* Admin layout */}
            <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="discounts" element={<DiscountCodeAdmin />} />
                <Route path="products" element={<ProductCatalog />} />
                <Route path="products/detail/:productId" element={<ProductDetail />} />
                <Route path="products/create" element={<CreateProduct />} />
                <Route path="products/edit/:id" element={<EditProduct />} />
                {/* <Route path="users" element={<User />} /> */}
            </Route>
        </Routes>
    )
}
