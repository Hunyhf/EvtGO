// src/routes/index.jsx
import { createBrowserRouter, Outlet } from 'react-router-dom';
import ScrollToTop from '@components/Common/ScrollToTop';
// Import các Layout
import AdminLayout from '@components/layouts/AdminLayout.jsx';
import CustomerLayout from '@components/layouts/CustomerLayout.jsx';
import OrganizerLayout from '@components/layouts/OrganizerLayout.jsx';
import StaffLayout from '@components/layouts/StaffLayout.jsx';
import EventDashboardLayout from '@components/layouts/EventDashboardLayout.jsx'; // Layout mới cho chi tiết sự kiện

// Import Pages

// CUSTOMER PAGES
import Home from '@pages/customer/Home/Home.jsx';
import Genre from '@pages/customer/Genre/Genre';
import Profile from '@pages/customer/Profile/Profile.jsx';
import Booking from '@pages/customer/Booking/Booking';
import Checkout from '@pages/customer/Checkout/Checkout';
import NotFound from '@pages/customer/NotFound/NotFound.jsx';
import EventDetail from '@pages/customer/EventDetail/EventDetail';
import Ticket from '@pages/customer/Ticket/Ticket';
import PolicyViewer from '@pages/customer/PolicyViewer/PolicyViewer';
// ADMIN PAGES
import AdminDashBoard from '@pages/admin/AdminDashBoard/AdminDashBoard.jsx';
import UserManagement from '@pages/admin/UserManagement/UserManagement.jsx';
import AdminEventManagement from '@pages/admin/EventManagement/AdminEventManagement.jsx';

// ORGANIZER PAGES
import EventManagement from '@pages/organizer/EventManagement/EventManagement';
import CreateEvent from '@pages/organizer/EventManagement/CreateEvent';
import EditEvent from '@pages/organizer/EventManagement/EditEvent';
import OrderManagement from '@pages/organizer/OrderManagement/OrderManagement';
import EventSummary from '@pages/organizer/EventManagement/EventSummary/EventSummary.jsx'; // Trang Summary mới
import StaffManagement from '@pages/organizer/EventManagement/StaffManagement';

// STAFF PAGES
import TicketScanner from '@pages/staff/TicketScanner';
// Import Protection, Context & Constants
import ProtectedRoute from '@components/ProtectedRoute';
import { AuthProvider } from '@contexts/AuthContext';
import { ROLE_ID } from '@constants/roles.js';

export const BREADCRUMB_LABELS = {
    '/': 'Trang chủ',
    '/genre': 'Thể loại',
    '/event': 'Chi tiết sự kiện',
    '/booking': 'Chọn vé',
    '/booking/:id/checkout': 'Thanh toán',
    '/my-tickets': 'Vé của tôi',
    '/profile': 'Hồ sơ cá nhân',
    '/organizer': 'Quản lý sự kiện',
    '/organizer/events/create': 'Tạo sự kiện mới',
    '/admin': 'Tổng quan',
    '/admin/users': 'Quản lý người dùng',
    '/admin/events': 'Quản lý sự kiện'
};

export const routes = createBrowserRouter([
    {
        element: (
            <AuthProvider>
                <ScrollToTop />
                <Outlet />
            </AuthProvider>
        ),
        children: [
            {
                path: '/',
                element: <CustomerLayout />,
                children: [
                    { index: true, element: <Home /> },
                    { path: 'genre/:slug', element: <Genre /> },
                    { path: 'genre', element: <Genre /> },
                    { path: 'event/:id', element: <EventDetail /> },
                    {
                        path: 'booking/:id',
                        element: <Booking />
                    },
                    {
                        path: 'booking/:id/checkout',
                        element: (
                            <ProtectedRoute allowedRoles={[ROLE_ID.CUSTOMER]}>
                                <Checkout />
                            </ProtectedRoute>
                        )
                    },
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
                    },
                    {
                        path: 'chinh-sach-bao-mat-thanh-toan',
                        element: (
                            <PolicyViewer
                                fileName='chinh-sach-bao-mat-thanh-toan.pdf'
                                title='Chính sách bảo mật thanh toán'
                            />
                        )
                    },
                    {
                        path: 'chinh-sach-kiem-hang',
                        element: (
                            <PolicyViewer
                                fileName='chinh-sach-kiem-hang.pdf'
                                title='Chính sách kiểm hàng và đổi trả'
                            />
                        )
                    },
                    {
                        path: 'dieu-kien-van-chuyen',
                        element: (
                            <PolicyViewer
                                fileName='dieu-kien-van-chuyen.pdf'
                                title='Điều kiện vận chuyển và giao nhận'
                            />
                        )
                    }
                ]
            },

            // --- NHÓM STAFF ---

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
                    { path: 'users', element: <UserManagement /> },
                    { path: 'events', element: <AdminEventManagement /> }
                ]
            },

            // --- NHÓM ORGANIZER ---
            {
                path: '/organizer',
                element: (
                    <ProtectedRoute allowedRoles={[ROLE_ID.ORGANIZER]}>
                        {/* Đổi OrganizerLayout thành Outlet để chia nhiều layout con */}
                        <Outlet />
                    </ProtectedRoute>
                ),
                children: [
                    // Layout 1: Màn hình chung của Organizer
                    {
                        element: <OrganizerLayout />,
                        children: [
                            { path: 'events', element: <EventManagement /> },
                            { path: 'events/create', element: <CreateEvent /> },
                            { path: 'events/edit/:id', element: <EditEvent /> },
                            { path: 'profile', element: <Profile /> },
                            {
                                path: 'terms',
                                element: <div>Trang điều khoản</div>
                            },
                            { path: 'orders', element: <OrderManagement /> },
                            { path: 'staff', element: <StaffManagement /> },
                            {
                                path: 'staff/:eventId',
                                element: <StaffManagement />
                            }
                        ]
                    },
                    // Layout 2: Màn hình chi tiết của một sự kiện
                    {
                        path: 'events/:id',
                        element: <EventDashboardLayout />,
                        children: [
                            { path: 'summary', element: <EventSummary /> },
                            {
                                path: 'orders',
                                element: <OrderManagement />
                            },
                            {
                                path: 'members',
                                element: <StaffManagement />
                            }
                        ]
                    }
                ]
            },
            {
                path: '/staff',
                element: (
                    <ProtectedRoute allowedRoles={[ROLE_ID.STAFF]}>
                        <StaffLayout />
                    </ProtectedRoute>
                ),
                children: [
                    {
                        index: true, // Thay đổi ở đây: Đặt scanner làm trang chủ của Staff
                        element: <TicketScanner />
                    },
                    {
                        path: 'scan/:eventId',
                        element: <TicketScanner />
                    }
                ]
            },
            // --- ERROR ROUTES ---
            { path: '/404', element: <NotFound /> },
            { path: '*', element: <NotFound /> }
        ]
    }
]);
