import { createBrowserRouter, Outlet } from 'react-router-dom'; // - Import Outlet

// Import các Layout
import AdminLayout from '@components/layouts/AdminLayout.jsx';
import CustomerLayout from '@components/layouts/CustomerLayout.jsx';
import OrganizerLayout from '@components/layouts/OrganizerLayout.jsx';
import StaffLayout from '@components/layouts/StaffLayout.jsx';

// Import Pages
import Home from '@pages/customer/Home/Home.jsx';
import Staff from '@pages/staff/Staff.jsx';
import Category from '@pages/customer/Category.jsx';
import Profile from '@pages/customer/Profile/Profile.jsx';
import Ticket from '@pages/customer/Ticket/Ticket.jsx';
import NotFound from '@pages/customer/NotFound/NotFound.jsx';
import AdminDashBoard from '@pages/admin/AdminDashBoard/AdminDashBoard.jsx';
import OrganizerDashBoard from '@pages/organizer/OrganizerDashBoard.jsx';
// Import Protection, Context & Constants
import ProtectedRoute from '@components/ProtectedRoute';
import { AuthProvider } from '@contexts/AuthContext';
import { ROLE_ID } from '@constants/roles.js';

export const BREADCRUMB_LABELS = {
    '/': 'Trang chủ',
    '/my-tickets': 'Vé của tôi',
    '/profile': 'Hồ sơ cá nhân',
    '/category': 'Danh mục',
    '/staff': 'Quản lý vận hành',
    '/admin': 'Quản trị hệ thống',
    '/organizer': 'Nhà tổ chức'
};

export const routes = createBrowserRouter([
    {
        // - TƯ DUY SENIOR: Dùng một route không có path để bọc AuthProvider.
        // Điều này đảm bảo AuthContext có thể sử dụng hook useNavigate() mà không bị lỗi.
        element: (
            <AuthProvider>
                <Outlet />
            </AuthProvider>
        ),
        children: [
            {
                path: '/',
                element: <CustomerLayout />,
                children: [
                    { index: true, element: <Home /> },
                    { path: 'category', element: <Category /> },
                    {
                        path: 'my-tickets',
                        element: (
                            <ProtectedRoute allowedRoles={[ROLE_ID.CUSTOMER]}>
                                <Ticket />
                            </ProtectedRoute>
                        )
                    },
                    {
                        path: 'profile',
                        element: (
                            <ProtectedRoute
                                allowedRoles={[
                                    ROLE_ID.ADMIN,
                                    ROLE_ID.CUSTOMER,
                                    ROLE_ID.ORGANIZER,
                                    ROLE_ID.STAFF
                                ]}
                            >
                                <Profile />
                            </ProtectedRoute>
                        )
                    }
                ]
            },

            // --- NHÓM STAFF ---
            {
                path: '/staff',
                element: (
                    <ProtectedRoute allowedRoles={[ROLE_ID.STAFF]}>
                        <StaffLayout />
                    </ProtectedRoute>
                ),
                children: [{ index: true, element: <Staff /> }]
            },

            // --- NHÓM ADMIN ---
            {
                path: '/admin',
                element: (
                    <ProtectedRoute allowedRoles={[ROLE_ID.ADMIN]}>
                        <AdminLayout />
                    </ProtectedRoute>
                ),
                children: [{ index: true, element: <AdminDashBoard /> }] //
            },

            // --- NHÓM ORGANIZER ---
            {
                path: '/organizer',
                element: (
                    <ProtectedRoute allowedRoles={[ROLE_ID.ORGANIZER]}>
                        <OrganizerLayout />
                    </ProtectedRoute>
                ),
                children: [
                    { index: true, element: <OrganizerDashBoard /> } //
                ]
            },

            // --- ERROR ROUTES ---
            { path: '/404', element: <NotFound /> },
            { path: '*', element: <NotFound /> }
        ]
    }
]);
