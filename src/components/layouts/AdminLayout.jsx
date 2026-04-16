import React, { useContext } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
    DashboardOutlined,
    UsergroupAddOutlined,
    CalendarOutlined,
    LogoutOutlined,
    TagsOutlined,
    RobotOutlined
} from '@ant-design/icons';
import MainDashboardLayout from './MainDashboardLayout';
import { AuthContext } from '@contexts/AuthContext';
import { callLogout } from '@apis/authApi';

function AdminLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const { logoutContext } = useContext(AuthContext);

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
        },
        {
            key: '/admin/genres',
            icon: <TagsOutlined />,
            label: 'Quản lý thể loại',
            onClick: () => navigate('/admin/genres')
        },
        {
            key: '/admin/ai-documents',
            icon: <RobotOutlined />,
            label: 'Huấn luyện AI',
            onClick: () => navigate('/admin/ai-documents')
        },
        {
            key: '/admin/orders',
            icon: <DashboardOutlined />,
            label: 'Quản lý đơn hàng',
            onClick: () => navigate('/admin/orders')
        }
    ];

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
            <Outlet />
        </MainDashboardLayout>
    );
}

export default AdminLayout;
