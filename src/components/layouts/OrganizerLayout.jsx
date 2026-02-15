import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import {
    CalendarOutlined,
    FileProtectOutlined,
    PlusCircleOutlined
} from '@ant-design/icons';
import Sidebar from '@components/DashboardLayout/Sidebar';
import Header from '@components/DashboardLayout/Header';
import styles from '@components/DashboardLayout/DashboardLayout.module.scss';

const cx = classNames.bind(styles);

function OrganizerLayout() {
    const [collapsed, setCollapsed] = useState(false);
    const { pathname } = useLocation();
    const navigate = useNavigate();

    // Menu riêng cho Organizer
    const organizerMenu = [
        {
            path: '/organizer',
            label: 'Sự kiện của tôi',
            icon: <CalendarOutlined />
        },
        {
            path: '/organizer/terms',
            label: 'Điều khoản cho nhà tổ chức',
            icon: <FileProtectOutlined />
        }
    ];

    // Map tiêu đề Header
    const getTitle = () => {
        if (pathname === '/organizer') return 'Quản lý sự kiện';
        if (pathname === '/organizer/terms') return 'Điều khoản ban tổ chức';
        if (pathname === '/organizer/events/create') return 'Tạo sự kiện mới';
        return 'Nhà tổ chức';
    };

    return (
        <div className={cx('layoutContainer')}>
            {' '}
            {/* Đổi styles.layoutContainer -> cx('layoutContainer') */}
            <Sidebar items={organizerMenu} collapsed={collapsed} />
            <div className={cx('mainContent')}>
                <Header
                    title={getTitle()}
                    collapsed={collapsed}
                    onToggle={() => setCollapsed(!collapsed)}
                    extraActions={
                        <button
                            className={cx('btnCreate')} // Chuyển inline style vào class btnCreate
                            onClick={() => navigate('/organizer/events/create')}
                        >
                            <PlusCircleOutlined />
                            <span>Tạo sự kiện</span>
                        </button>
                    }
                />

                <main className={cx('scrollArea')}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default OrganizerLayout;
