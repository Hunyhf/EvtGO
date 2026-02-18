import React, { useContext } from 'react'; //
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    DashboardOutlined,
    UsergroupAddOutlined,
    CalendarOutlined,
    LogoutOutlined
} from '@ant-design/icons';
import MainDashboardLayout from './MainDashboardLayout';
import { AuthContext } from '@contexts/AuthContext'; //
import { callLogout } from '@apis/authApi'; //

function AdminLayout() {
    const navigate = useNavigate();
    const location = useLocation();

    // 1. Lấy hàm logout từ Context
    const { logoutContext } = useContext(AuthContext);

    // 2. Định nghĩa hàm handleLogout giống bên Header.jsx
    const handleLogout = async () => {
        try {
            await callLogout(); // Gọi API đăng xuất
        } catch (error) {
            console.error('Admin Logout error:', error);
        } finally {
            logoutContext(); // Xóa sạch dữ liệu user, token và điều hướng về Home
        }
    };

    // 3. Cập nhật Menu Admin
    const menuItems = [
        {
            key: '/admin',
            icon: <DashboardOutlined />,
            label: 'Tổng quan',
            onClick: () => navigate('/admin')
        },
        {
            key: '/admin/users',
            icon: <UsergroupAddOutlined />,
            label: 'Quản lý người dùng',
            onClick: () => navigate('/admin/users')
        },
        {
            key: '/admin/events',
            icon: <CalendarOutlined />,
            label: 'Quản lý sự kiện',
            onClick: () => navigate('/admin/events')
        }
    ];

    // 4. Cập nhật User Menu với hàm handleLogout mới
    const userMenuItems = [
        {
            key: 'logout',
            label: 'Đăng xuất',
            icon: <LogoutOutlined />,
            danger: true,
            onClick: handleLogout //
        }
    ];

    return (
        <MainDashboardLayout
            menuItems={menuItems}
            userMenuItems={userMenuItems}
            logoTitle='EvtGO Admin'
            logoLink='/admin'
            extraHeaderActions={null}
        >
            <Outlet />
        </MainDashboardLayout>
    );
}

export default AdminLayout;
