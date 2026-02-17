// src/components/layouts/OrganizerLayout.jsx
import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Button } from 'antd';
import {
    CalendarOutlined,
    FileProtectOutlined,
    UserOutlined,
    LogoutOutlined,
    PlusOutlined
} from '@ant-design/icons';
import MainDashboardLayout from './MainDashboardLayout'; // Import layout chung

function OrganizerLayout() {
    const navigate = useNavigate();
    const location = useLocation();

    // === LOGIC RIÊNG CỦA ORGANIZER (Giữ nguyên logic Create Event) ===
    const [currentStep, setCurrentStep] = useState(1);
    const [onNextAction, setOnNextAction] = useState(null);

    // 1. Định nghĩa Menu cho Organizer
    const menuItems = [
        {
            key: '/organizer/events',
            icon: <CalendarOutlined />,
            label: 'Sự kiện của tôi',
            onClick: () => navigate('/organizer/events')
        },
        {
            key: '/organizer/terms',
            icon: <FileProtectOutlined />,
            label: 'Điều khoản',
            onClick: () => navigate('/organizer/terms')
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
            onClick: () => {
                navigate('/login');
            }
        }
    ];

    // 3. Nút "Tạo sự kiện" (Chỉ hiện khi không ở trang create)
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
            {/* Truyền Context xuống các trang con */}
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
