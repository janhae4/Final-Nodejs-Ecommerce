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
            </Route>
        </Routes>
    )
}
