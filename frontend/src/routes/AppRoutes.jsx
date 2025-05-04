import { Routes, Route } from 'react-router-dom'
// Admin pages

import '../App.css'
import AdminLayout from '../pages/admin/AdminLayout'
import Dashboard from '../pages/admin/Dashboard'
import DiscountCodeAdmin from '../pages/admin/discount/Discount'

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
