import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
    CalendarOutlined,
    FileProtectOutlined,
    PlusCircleOutlined
} from '@ant-design/icons';
import Sidebar from '@components/DashboardLayout/Sidebar';
import Header from '@components/DashboardLayout/Header';
import styles from '@components/DashboardLayout/DashboardLayout.module.scss';

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
        return 'Nhà tổ chức';
    };

    return (
        <div className={styles.layoutContainer}>
            <Sidebar items={organizerMenu} collapsed={collapsed} />

            <div className={styles.mainContent}>
                <Header
                    title={getTitle()}
                    collapsed={collapsed}
                    onToggle={() => setCollapsed(!collapsed)}
                    extraActions={
                        <button
                            className='btn-create'
                            style={{
                                backgroundColor: '#2dc275',
                                color: '#fff',
                                border: 'none',
                                padding: '8px 16px',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                            onClick={() => navigate('/organizer/create')}
                        >
                            <PlusCircleOutlined /> Tạo sự kiện
                        </button>
                    }
                />

                <main className={styles.scrollArea}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default OrganizerLayout;
