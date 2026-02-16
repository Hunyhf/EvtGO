import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom'; // Thêm useNavigate
import classNames from 'classnames/bind';
import { CalendarOutlined, FileProtectOutlined } from '@ant-design/icons';
import Sidebar from '@components/DashboardLayout/Sidebar';
import Header from '@components/DashboardLayout/Header';
import Stepper from '@components/Stepper/Stepper';
import styles from '@components/DashboardLayout/DashboardLayout.module.scss';

const cx = classNames.bind(styles);

const CREATE_EVENT_STEPS = [
    { id: 1, label: 'Thông tin sự kiện' },
    { id: 2, label: 'Thời gian & Loại vé' },
    { id: 3, label: 'Cài đặt' },
    { id: 4, label: 'Thông tin thanh toán' }
];

function OrganizerLayout() {
    const [collapsed, setCollapsed] = useState(false);
    const { pathname } = useLocation();
    const navigate = useNavigate(); // Hook để chuyển trang

    const [currentStep, setCurrentStep] = useState(1);
    const [onNextAction, setOnNextAction] = useState(null);

    const isCreateEventPage = pathname === '/organizer/events/create';

    const organizerMenu = [
        {
            path: '/organizer/events',
            label: 'Sự kiện của tôi',
            icon: <CalendarOutlined />
        },
        {
            path: '/organizer/terms',
            label: 'Điều khoản cho nhà tổ chức',
            icon: <FileProtectOutlined />
        }
    ];

    return (
        <div className={cx('layoutContainer')}>
            <Sidebar items={organizerMenu} collapsed={collapsed} />

            <div className={cx('mainContent')}>
                <Header
                    title={
                        isCreateEventPage ? 'Tạo sự kiện mới' : 'Nhà tổ chức'
                    }
                    collapsed={collapsed}
                    onToggle={() => setCollapsed(!collapsed)}
                    // PHẦN CẬP NHẬT: Hiện nút "Tạo sự kiện" nếu KHÔNG phải trang create
                    extraActions={
                        !isCreateEventPage && (
                            <button
                                className={cx('btnCreate')}
                                onClick={() =>
                                    navigate('/organizer/events/create')
                                }
                            >
                                Tạo sự kiện
                            </button>
                        )
                    }
                />

                {/* Stepper nằm ngay dưới Header và có sẵn nút "Tiếp tục" bên trong */}
                {isCreateEventPage && (
                    <Stepper
                        steps={CREATE_EVENT_STEPS}
                        currentStep={currentStep}
                        onNext={() => onNextAction && onNextAction()}
                    />
                )}

                <main className={cx('scrollArea')}>
                    <Outlet
                        context={{
                            currentStep,
                            setCurrentStep,
                            setOnNextAction
                        }}
                    />
                </main>
            </div>
        </div>
    );
}

export default OrganizerLayout;
