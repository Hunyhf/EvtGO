import { createBrowserRouter } from 'react-router-dom';

//Import các Layout
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

// Import Protection & Constants
import ProtectedRoute from '@components/ProtectedRoute';
import { ROLE_ID } from '@constants/roles.js';

export const routes = createBrowserRouter([
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

    // --- NHÓM STAFF (Dùng StaffLayout riêng của bạn) ---
    {
        path: '/staff',
        element: (
            <ProtectedRoute allowedRoles={[ROLE_ID.STAFF]}>
                <StaffLayout />
            </ProtectedRoute>
        ),
        children: [
            { index: true, element: <Staff /> }
            // Thêm các trang con của staff ở đây
        ]
    },

    // --- NHÓM ADMIN (Sử dụng AdminLayout của bạn) ---
    {
        path: '/admin',
        element: (
            <ProtectedRoute allowedRoles={[ROLE_ID.ADMIN]}>
                \ <AdminLayout />
            </ProtectedRoute>
        ),
        children: [{ index: true, element: <div>Trang Admin Dashboard</div> }]
    },

    // --- NHÓM ORGANIZER (Sử dụng OrganizerLayout của bạn) ---
    {
        path: '/organizer',
        element: (
            <ProtectedRoute allowedRoles={[ROLE_ID.ORGANIZER]}>
                {/* Thay bằng <OrganizerLayout /> nếu bạn đã tạo file */}
                <OrganizerLayout />
            </ProtectedRoute>
        ),
        children: [
            { index: true, element: <div>Trang Organizer Dashboard</div> }
        ]
    },

    // --- ERROR ROUTES ---
    { path: '/404', element: <NotFound /> },
    { path: '*', element: <NotFound /> }
]);
