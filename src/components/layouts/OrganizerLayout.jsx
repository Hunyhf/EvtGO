import React, { useState, useContext } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { AuthContext } from '@contexts/AuthContext';
import styles from './OrganizerLayout.module.scss';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    CalendarOutlined,
    TeamOutlined,
    FileTextOutlined,
    LogoutOutlined,
    UserOutlined,
    SettingOutlined
} from '@ant-design/icons';

function OrganizerLayout() {
    const [collapsed, setCollapsed] = useState(false);
    const { user, logoutContext } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        {
            path: '/organizer',
            label: 'Sự kiện của tôi',
            icon: <CalendarOutlined />
        },
        {
            path: '/organizer/tickets',
            label: 'Quản lý vé',
            icon: <FileTextOutlined />
        },
        {
            path: '/organizer/staff',
            label: 'Quản lý nhân viên',
            icon: <TeamOutlined />
        }
    ];

    return (
        <div className={styles.container}>
            {/* Sidebar tự dựng */}
            <aside
                className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}
            >
                <div className={styles.logoArea}>
                    {collapsed ? 'EG' : 'EvtGO'}
                </div>
                <ul className={styles.navMenu}>
                    {menuItems.map(item => (
                        <li
                            key={item.path}
                            className={
                                location.pathname === item.path
                                    ? styles.active
                                    : ''
                            }
                            onClick={() => navigate(item.path)}
                        >
                            {item.icon}
                            {!collapsed && <span>{item.label}</span>}
                        </li>
                    ))}
                </ul>
            </aside>

            {/* Vùng nội dung chính */}
            <div className={styles.mainLayout}>
                <header className={styles.header}>
                    <button
                        className={styles.toggleBtn}
                        onClick={() => setCollapsed(!collapsed)}
                    >
                        {collapsed ? (
                            <MenuUnfoldOutlined />
                        ) : (
                            <MenuFoldOutlined />
                        )}
                    </button>

                    {/* Khối User Actions với Dropdown tương tự Customer Header */}
                    <div className={styles.userActions}>
                        <div className={styles.userInfo}>
                            <span className={styles.name}>
                                {user?.name || 'Organizer'}
                            </span>
                            <span className={styles.role}>Nhà tổ chức</span>
                        </div>

                        <div className={styles.avatar}>
                            {user?.avatar ? (
                                <img src={user.avatar} alt='avatar' />
                            ) : (
                                <UserOutlined style={{ fontSize: '18px' }} />
                            )}
                        </div>

                        {/* Dropdown Menu hiện khi hover vào userActions */}
                        <div className={styles.dropdownMenu}>
                            <Link
                                to='/organizer/profile'
                                className={styles.menuItem}
                            >
                                <UserOutlined /> Hồ sơ cá nhân
                            </Link>
                            <Link
                                to='/organizer/settings'
                                className={styles.menuItem}
                            >
                                <SettingOutlined /> Cài đặt hệ thống
                            </Link>
                            <div
                                className={`${styles.menuItem} ${styles.logout}`}
                                onClick={() => logoutContext()}
                            >
                                <LogoutOutlined /> Đăng xuất
                            </div>
                        </div>
                    </div>
                </header>

                <main className={styles.contentBody}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default OrganizerLayout;
