import { Routes, Route } from 'react-router-dom'
// Admin pages
import Dashboard from '../admin/pages/Dashboard.jsx'
import AdminLayout from '../admin/AdminLayout'
import DiscountCodeAdmin from '../admin/pages/Discount'
import CreateProduct from '../admin/pages/CreateProduct.jsx'
import ProductCatalog from '../admin/pages/ProductCatalog.jsx'
import ProductDetail from '../admin/pages/ProductDetail.jsx'
import EditProduct from '../admin/pages/ProductEdit.jsx'
import '../App.css'
import AdminLayout from '../pages/admin/AdminLayout'
import Dashboard from '../pages/admin/Dashboard'
import DiscountCodeAdmin from '../pages/admin/discount/Discount'
import OrderAdmin from '../pages/admin/order/Order'

export default function AppRoutes() {
    return (
        <Routes>
            {/* Admin layout */}
            <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="discount" element={<DiscountCodeAdmin />} />
                <Route path="products" element={<ProductCatalog />} />
                <Route path="products/detail/:productId" element={<ProductDetail />} />
                <Route path="products/create" element={<CreateProduct />} />
                <Route path="products/edit/:id" element={<EditProduct />} />
                <Route path="users" element={<User />} />
            </Route>
        </Routes>
    )
}
