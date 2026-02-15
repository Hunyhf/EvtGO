// src/routes/index.jsx
import { createBrowserRouter, Outlet } from 'react-router-dom';

// Import các Layout
import AdminLayout from '@components/Layouts/AdminLayout.jsx';
import CustomerLayout from '@components/Layouts/CustomerLayout.jsx';
import OrganizerLayout from '@components/Layouts/OrganizerLayout.jsx';
import StaffLayout from '@components/Layouts/StaffLayout.jsx';

// Import Pages
import Staff from '@pages/staff/Staff.jsx';
// CUSTOMER
import Home from '@pages/customer/Home/Home.jsx';
import Category from '@pages/customer/Category/Category';
import Profile from '@pages/customer/Profile/Profile.jsx';
import Ticket from '@pages/customer/Ticket/Ticket.jsx';
import NotFound from '@pages/customer/NotFound/NotFound.jsx';

// ADMIN
import AdminDashBoard from '@pages/admin/AdminDashBoard/AdminDashBoard.jsx';
import UserManagement from '@pages/admin/UserManagement/UserManagement.jsx';

// Organizer
import EventManagement from '@pages/organizer/EventManagement/EventManagement';
import CreateEvent from '@pages/organizer/EventManagement/CreateEvent';

// Import Protection, Context & Constants
import ProtectedRoute from '@components/ProtectedRoute';
import { AuthProvider } from '@contexts/AuthContext';
import { ROLE_ID } from '@constants/roles.js';

export const BREADCRUMB_LABELS = {
    '/': 'Trang chủ',
    '/my-tickets': 'Vé của tôi',
    '/profile': 'Hồ sơ cá nhân',
    '/organizer': 'Quản lý sự kiện',
    '/organizer/events/create': 'Tạo sự kiện mới'
};

export const routes = createBrowserRouter([
    {
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
                children: [
                    { index: true, element: <AdminDashBoard /> },
                    {
                        path: 'users',
                        element: <UserManagement />
                    }
                ]
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
                    {
                        path: 'events', // Tương đương /organizer/events
                        element: <EventManagement />
                    },
                    {
                        path: 'events/create', // Tương đương /organizer/events/create
                        element: <CreateEvent />
                    },
                    {
                        path: 'profile', // Tương đương /organizer/profile
                        element: <Profile />
                    },
                    {
                        path: 'terms', // Tương đương /organizer/terms
                        element: <div>Trang điều khoản</div>
                    }
                ]
            },

            // --- ERROR ROUTES ---
            { path: '/404', element: <NotFound /> },
            { path: '*', element: <NotFound /> }
        ]
    }
]);
