import React, { useContext } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    DashboardOutlined,
    UsergroupAddOutlined,
    CalendarOutlined,
    LogoutOutlined
} from '@ant-design/icons';
import MainDashboardLayout from './MainDashboardLayout';
import { AuthContext } from '@contexts/AuthContext';
import { callLogout } from '@apis/authApi';

/**
 * Layout dành riêng cho khu vực Admin
 * Bao gồm:
 * - Sidebar menu điều hướng
 * - Header admin
 * - Dropdown user (logout)
 * - Outlet render nội dung con
 */
function AdminLayout() {
    const navigate = useNavigate();
    const location = useLocation();

    /**
     * Lấy hàm logout từ AuthContext
     * Dùng để xóa thông tin user sau khi gọi API logout
     */
    const { logoutContext } = useContext(AuthContext);

    /**
     * Xử lý đăng xuất trong Admin
     * - Gọi API logout
     * - Clear context (token, user)
     */
    const handleLogout = async () => {
        try {
            await callLogout();
        } catch (error) {
            console.error('Admin Logout error:', error);
        } finally {
            logoutContext();
        }
    };

    /**
     * Danh sách menu sidebar của Admin
     */
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

    /**
     * Dropdown menu tài khoản admin (góc phải header)
     */
    const userMenuItems = [
        {
            key: 'logout',
            label: 'Đăng xuất',
            icon: <LogoutOutlined />,
            danger: true,
            onClick: handleLogout
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
            {/* Render các trang con của Admin */}
            <Outlet />
        </MainDashboardLayout>
    );
}

export default AdminLayout;
