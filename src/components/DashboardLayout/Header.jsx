import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import { AuthContext } from '@contexts/AuthContext';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    UserOutlined,
    LogoutOutlined
} from '@ant-design/icons';
import styles from './Header.module.scss';

const cx = classNames.bind(styles);

const Header = ({ title, collapsed, onToggle, extraActions }) => {
    const { user, logoutContext } = useContext(AuthContext);

    return (
        <header className={cx('header')}>
            <div className={cx('headerLeft')}>
                <button className={cx('toggleBtn')} onClick={onToggle}>
                    {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                </button>
                <h2 className={cx('pageTitle')}>{title}</h2>
            </div>

            <div className={cx('headerRight')}>
                {/* Khu vực chứa nút "Tạo sự kiện" truyền từ Layout vào */}
                <div className={cx('extraActions')}>{extraActions}</div>

                <div className={cx('userSection')}>
                    <div className={cx('userInfo')}>
                        <span className={cx('userName')}>
                            {user?.name || 'Người dùng'}
                        </span>
                        <span className={cx('userRole')}>
                            {user?.role_id === 2
                                ? 'Nhà tổ chức'
                                : 'Quản trị viên'}
                        </span>
                    </div>

                    <div className={cx('avatarWrapper')}>
                        <div className={cx('avatar')}>
                            <img
                                src={
                                    user?.avatar ||
                                    'https://static.ticketbox.vn/avatar.png'
                                }
                                alt='avatar'
                            />
                        </div>

                        <div className={cx('dropdownMenu')}>
                            <Link to='/profile' className={cx('menuItem')}>
                                <UserOutlined />
                                <span>Thông tin cá nhân</span>
                            </Link>
                            <div
                                className={cx('menuItem', 'logout')}
                                onClick={() => logoutContext()}
                            >
                                <LogoutOutlined />
                                <span>Đăng xuất</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
