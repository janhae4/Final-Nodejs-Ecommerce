import { Routes, Route } from 'react-router-dom'
// Admin pages
import Dashboard from '../admin/pages/Dashboard.jsx'
import AdminLayout from '../admin/AdminLayout'
import DiscountCodeAdmin from '../admin/pages/Discount'
import '../App.css'

export default function AppRoutes() {
    return (
        <Routes>
            {/* Admin layout */}
            <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="discount" element={<DiscountCodeAdmin />} />
            </Route>
        </Routes>
    )
}
