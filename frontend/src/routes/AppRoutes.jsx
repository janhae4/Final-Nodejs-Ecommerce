import { Routes, Route } from 'react-router-dom'
// Admin pages
import Dashboard from '../admin/pages/Dashboard.jsx'
import AdminLayout from '../admin/AdminLayout'
import DiscountCodeAdmin from '../admin/pages/Discount'
import CreateProduct from '../admin/pages/CreateProduct.jsx'
import ProductCatalog from '../admin/pages/ProductCatalog.jsx'
import ProductDetail from '../admin/pages/ProductDetail.jsx'
import EditProduct from '../admin/pages/ProductEdit.jsx'
import ManageUsers from '../admin/pages/ManageUser.jsx';  
import Login from '../user/pages/Login.jsx';
import Register from '../user/pages/Register.jsx'; 
import Home from '../user/HomePage.jsx'; 
import Profile from '../user/pages/Profile.jsx';



import '../App.css'

export default function AppRoutes() {
    return (
        <Routes>
            {/* User layout */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} /> 
            <Route path="/profile" element={<Profile />} />
            {/* Admin layout */}
            <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="discount" element={<DiscountCodeAdmin />} />
                <Route path="products" element={<ProductCatalog />} />
                <Route path="products/detail/:productId" element={<ProductDetail />} />
                <Route path="products/create" element={<CreateProduct />} />
                <Route path="products/edit/:id" element={<EditProduct />} />
                <Route path="users" element={<ManageUsers />} />
                
            </Route>
        </Routes>
        
    )
}
