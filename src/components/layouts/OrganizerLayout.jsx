import React, { useState, useContext } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Button } from 'antd';
import {
    CalendarOutlined,
    FileProtectOutlined,
    UserOutlined,
    LogoutOutlined,
    PlusOutlined
} from '@ant-design/icons';
import MainDashboardLayout from './MainDashboardLayout';
import { AuthContext } from '@contexts/AuthContext';
import { callLogout } from '@apis/authApi';

function OrganizerLayout() {
    const navigate = useNavigate();
    const location = useLocation();

    // Lấy hàm logoutContext từ AuthContext
    const { logoutContext } = useContext(AuthContext);

    // === LOGIC RIÊNG CỦA ORGANIZER ===
    const [currentStep, setCurrentStep] = useState(1);
    const [onNextAction, setOnNextAction] = useState(null);

    // Xử lý đăng xuất bám sát logic hệ thống
    const handleLogout = async () => {
        try {
            await callLogout(); // Gọi API logout phía server
        } catch (error) {
            console.error('Organizer logout error:', error);
        } finally {
            logoutContext(); // Xóa token/user ở client và chuyển hướng về trang login/home
        }
    };

    // 1. Định nghĩa Menu cho Organizer
    const menuItems = [
        {
            key: '/organizer/events',
            icon: <CalendarOutlined />,
            label: 'Sự kiện của tôi',
            onClick: () => navigate('/organizer/events')
        },
        {
            // Đã sửa từ '/organizer/terms' thành đường dẫn tiếng Việt tương ứng với Route
            key: '/organizer/dieu-khoan-su-dung-cho-ban-to-chuc',
            icon: <FileProtectOutlined />,
            label: 'Điều khoản',
            onClick: () =>
                navigate('/organizer/dieu-khoan-su-dung-cho-ban-to-chuc')
        }
    ];

    // 2. Định nghĩa User Menu cho Organizer
    const userMenuItems = [
        {
            key: 'profile',
            label: 'Hồ sơ cá nhân',
            icon: <UserOutlined />,
            onClick: () => navigate('/organizer/profile')
        },
        { type: 'divider' },
        {
            key: 'logout',
            label: 'Đăng xuất',
            icon: <LogoutOutlined />,
            danger: true,
            onClick: handleLogout
        }
    ];

    // 3. Nút "Tạo sự kiện"
    const extraHeaderActions =
        location.pathname !== '/organizer/events/create' ? (
            <Button
                type='primary'
                icon={<PlusOutlined />}
                onClick={() => navigate('/organizer/events/create')}
            >
                Tạo sự kiện
            </Button>
        ) : null;

    return (
        <MainDashboardLayout
            menuItems={menuItems}
            userMenuItems={userMenuItems}
            logoTitle='EvtGO Organizer'
            logoLink='/organizer/events'
            extraHeaderActions={extraHeaderActions}
        >
            <Outlet
                context={{
                    currentStep,
                    setCurrentStep,
                    onNextAction,
                    setOnNextAction
                }}
            />
        </MainDashboardLayout>
    );
}

export default OrganizerLayout;
