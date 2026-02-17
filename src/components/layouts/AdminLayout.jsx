// src/components/layouts/AdminLayout.jsx
import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
    DashboardOutlined,
    UsergroupAddOutlined,
    FileProtectOutlined,
    UserOutlined,
    LogoutOutlined
} from '@ant-design/icons';
import MainDashboardLayout from './MainDashboardLayout';

function AdminLayout() {
    const navigate = useNavigate();

    // 1. Định nghĩa Menu cho Admin
    const menuItems = [
        {
            key: '/admin/dashboard',
            icon: <DashboardOutlined />,
            label: 'Thống kê',
            onClick: () => navigate('/admin/dashboard')
        },
        {
            key: '/admin/users',
            icon: <UsergroupAddOutlined />,
            label: 'Quản lý người dùng',
            onClick: () => navigate('/admin/users')
        }
        // Thêm các menu khác của admin ở đây
    ];

    // 2. Định nghĩa User Menu cho Admin
    const userMenuItems = [
        {
            key: 'logout',
            label: 'Đăng xuất',
            icon: <LogoutOutlined />,
            danger: true,
            onClick: () => {
                navigate('/login');
            }
        }
    ];

    return (
        <MainDashboardLayout
            menuItems={menuItems}
            userMenuItems={userMenuItems}
            logoTitle='EvtGO Admin'
            logoLink='/admin/dashboard'
        >
            {/* Admin thường không cần context phức tạp như Organizer, chỉ cần Outlet */}
            <Outlet />
        </MainDashboardLayout>
    );
}

export default AdminLayout;
