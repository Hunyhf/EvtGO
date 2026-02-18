import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    DashboardOutlined,
    UsergroupAddOutlined,
    CalendarOutlined,
    LogoutOutlined
} from '@ant-design/icons';
import MainDashboardLayout from './MainDashboardLayout'; // Layout chung

function AdminLayout() {
    const navigate = useNavigate();
    const location = useLocation();

    // 1. Định nghĩa Menu cho Admin (3 mục theo yêu cầu)
    const menuItems = [
        {
            key: '/admin', // Dẫn tới Dashboard
            icon: <DashboardOutlined />,
            label: 'Tổng quan',
            onClick: () => navigate('/admin')
        },
        {
            key: '/admin/users', // Dẫn tới Quản lý người dùng
            icon: <UsergroupAddOutlined />,
            label: 'Quản lý người dùng',
            onClick: () => navigate('/admin/users')
        },
        {
            key: '/admin/events', // Dẫn tới Quản lý sự kiện
            icon: <CalendarOutlined />,
            label: 'Quản lý sự kiện',
            onClick: () => navigate('/admin/events')
        }
    ];

    // 2. Định nghĩa User Menu (Góc trên bên phải)
    const userMenuItems = [
        {
            key: 'logout',
            label: 'Đăng xuất',
            icon: <LogoutOutlined />,
            danger: true,
            onClick: () => {
                // Xử lý đăng xuất (xóa token, v.v...)
                // auth.logout();
                navigate('/login');
            }
        }
    ];

    return (
        <MainDashboardLayout
            menuItems={menuItems}
            userMenuItems={userMenuItems}
            logoTitle='EvtGO Admin'
            logoLink='/admin'
            // Admin thường không cần nút Action phụ ở header như "Tạo sự kiện" của Organizer
            extraHeaderActions={null}
        >
            <Outlet />
        </MainDashboardLayout>
    );
}

export default AdminLayout;
