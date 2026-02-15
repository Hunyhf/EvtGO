import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '@contexts/AuthContext';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    UserOutlined,
    LogoutOutlined
} from '@ant-design/icons';
import styles from './Header.module.scss';

const Header = ({ title, collapsed, onToggle, extraActions }) => {
    const { user, logoutContext } = useContext(AuthContext);

    return (
        <header className={styles.header}>
            <div className={styles.headerLeft}>
                <button className={styles.toggleBtn} onClick={onToggle}>
                    {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                </button>
                <h2 className={styles.pageTitle}>{title}</h2>
            </div>

            <div className={styles.headerRight}>
                {/* Khu vực chứa nút "Tạo sự kiện" hoặc các nút khác tùy vai trò */}
                {extraActions}

                <div className={styles.userSection}>
                    <div className={styles.userInfo}>
                        <span className={styles.userName}>
                            {user?.name || 'Người dùng'}
                        </span>
                        <span className={styles.userRole}>
                            {user?.role_id === 2
                                ? 'Nhà tổ chức'
                                : 'Quản trị viên'}
                        </span>
                    </div>

                    <div className={styles.avatarWrapper}>
                        <div className={styles.avatar}>
                            <img
                                src={
                                    user?.avatar ||
                                    'https://static.ticketbox.vn/avatar.png'
                                }
                                alt='avatar'
                            />
                        </div>

                        <div className={styles.dropdownMenu}>
                            <Link to='/profile' className={styles.menuItem}>
                                <UserOutlined /> Thông tin cá nhân
                            </Link>
                            <div
                                className={styles.menuItem}
                                onClick={() => logoutContext()}
                            >
                                <LogoutOutlined /> Đăng xuất
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
