import React, { useState, useContext } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { AuthContext } from '@contexts/AuthContext';
import styles from './OrganizerLayout.module.scss';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    CalendarOutlined,
    FileProtectOutlined,
    LogoutOutlined,
    UserOutlined
} from '@ant-design/icons';

function OrganizerLayout() {
    const [collapsed, setCollapsed] = useState(false);
    const { user, logoutContext } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    // Menu sidebar đồng bộ với logic yêu cầu
    const menuItems = [
        {
            path: '/organizer',
            label: 'Sự kiện của tôi',
            icon: <CalendarOutlined />
        },
        {
            path: '/organizer/terms', // Đường dẫn cho điều khoản
            label: 'Điều khoản ban tổ chức',
            icon: <FileProtectOutlined />
        }
    ];

    return (
        <div className={styles.container}>
            {/* Sidebar */}
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

            {/* Main Content Area */}
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

                    <div className={styles.userActions}>
                        <div className={styles.userInfo}>
                            <span className={styles.name}>
                                {user?.name || 'Nhà tổ chức'}
                            </span>
                            <span className={styles.role}>Nhà tổ chức</span>
                        </div>

                        {/* Avatar hình tròn đồng bộ với Customer Header */}
                        <div className={styles.avatar}>
                            <img
                                src={
                                    user?.avatar ||
                                    'https://static.ticketbox.vn/avatar.png'
                                }
                                alt='avatar'
                            />
                        </div>

                        {/* Dropdown Menu hiện khi hover */}
                        <div className={styles.dropdownMenu}>
                            <Link
                                to='/organizer/profile'
                                className={styles.menuItem}
                            >
                                <UserOutlined /> Thông tin cá nhân
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
