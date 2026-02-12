import React, { useContext } from 'react';
import { Avatar, Dropdown, message } from 'antd';
import {
    UserOutlined,
    LogoutOutlined,
    ProfileOutlined
} from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import classNames from 'classnames/bind';

import styles from './AdminHeader.module.scss';
import { AuthContext } from '@contexts/AuthContext'; //

const cx = classNames.bind(styles);

function AdminHeader() {
    // Lấy thông tin user và hàm logout từ AuthContext
    const { user, logoutContext } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        if (logoutContext) {
            logoutContext(); // Gọi hàm logout trong context để xóa token/session
            message.success('Đăng xuất thành công!');
            navigate('/'); // Quay về trang chủ khách hàng sau khi đăng xuất
        }
    };

    const menuItems = [
        {
            key: 'profile',
            label: <Link to='/admin/profile'>Thông tin cá nhân</Link>,
            icon: <ProfileOutlined />
        },
        {
            type: 'divider'
        },
        {
            key: 'logout',
            label: 'Đăng xuất',
            icon: <LogoutOutlined />,
            danger: true,
            onClick: handleLogout
        }
    ];

    return (
        <header className={cx('header')}>
            <Dropdown
                menu={{ items: menuItems }}
                placement='bottomRight'
                trigger={['click']}
            >
                <div className={cx('header__user-section')}>
                    <div className={cx('header__info')}>
                        <span className={cx('name')}>
                            {user?.name || 'Quản trị viên'}
                        </span>
                        <span className={cx('role')}>Admin</span>
                    </div>
                    <Avatar
                        size='large'
                        src={
                            user?.avatar ||
                            'https://static.ticketbox.vn/avatar.png'
                        }
                        icon={<UserOutlined />}
                        style={{ backgroundColor: '#2dc275' }} // Dùng màu primary của bạn
                    />
                </div>
            </Dropdown>
        </header>
    );
}

export default AdminHeader;
