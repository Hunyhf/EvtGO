import React, { useContext } from 'react';
import { Outlet, useNavigate, useParams, useLocation } from 'react-router-dom';
import {
    DashboardOutlined,
    ShoppingCartOutlined,
    TeamOutlined,
    ArrowLeftOutlined
} from '@ant-design/icons';
import MainDashboardLayout from './MainDashboardLayout';
import { AuthContext } from '@contexts/AuthContext';

function EventDashboardLayout() {
    const navigate = useNavigate();
    const { id: eventId } = useParams(); // Lấy ID sự kiện từ URL
    const location = useLocation();
    const { logoutContext } = useContext(AuthContext);

    // Sidebar dành riêng cho Event Detail
    const menuItems = [
        {
            key: `/organizer/events/${eventId}/summary`,
            icon: <DashboardOutlined />,
            label: 'Tổng kết',
            onClick: () => navigate(`/organizer/events/${eventId}/summary`)
        },

        /*  {
            key: `/organizer/events/${eventId}/orders`,
            icon: <ShoppingCartOutlined />,
            label: 'Danh sách đơn hàng',
            onClick: () => navigate(`/organizer/events/${eventId}/orders`)
        },*/
        {
            key: `/organizer/events/${eventId}/members`,
            icon: <TeamOutlined />,
            label: 'Thành viên',
            onClick: () => navigate(`/organizer/events/${eventId}/members`)
        }
    ];

    // User Menu
    const userMenuItems = [
        {
            key: 'profile',
            label: 'Hồ sơ cá nhân',
            onClick: () => navigate('/organizer/profile')
        },
        { type: 'divider' },
        {
            key: 'logout',
            label: 'Đăng xuất',
            danger: true,
            onClick: () => logoutContext()
        }
    ];

    // Thay đổi Header Logo thành nút quay về
    const logoTitle = (
        <span
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '1.6rem'
            }}
        >
            <ArrowLeftOutlined /> Quay về trang chủ
        </span>
    );

    return (
        <MainDashboardLayout
            menuItems={menuItems}
            userMenuItems={userMenuItems}
            logoTitle={logoTitle}
            logoLink='/organizer/events'
        >
            <Outlet />
        </MainDashboardLayout>
    );
}

export default EventDashboardLayout;
