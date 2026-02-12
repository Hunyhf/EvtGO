import React, { useContext } from 'react';
import { Avatar, Dropdown, message } from 'antd';
// Bạn có thể bỏ import UserOutlined nếu không dùng nữa
import { useNavigate, Link } from 'react-router-dom';
import classNames from 'classnames/bind';

// Import các icon SVG của bạn
import LogOutIcon from '@icons/svgs/logOutIcon.svg?react';
import UserIcon from '@icons/svgs/userIcon.svg?react';

import styles from './AdminHeader.module.scss';
import { AuthContext } from '@contexts/AuthContext';

const cx = classNames.bind(styles);

function AdminHeader() {
    const { user, logoutContext } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        if (logoutContext) {
            logoutContext();
            message.success('Đăng xuất thành công!');
            navigate('/');
        }
    };

    // Định nghĩa menu cho Dropdown
    const menuItems = [
        {
            key: 'profile',
            label: <Link to='/admin/profile'>Thông tin cá nhân</Link>,
            // Đã đổi thành UserIcon của bạn
            icon: <UserIcon style={{ width: '16px', height: '16px' }} />
        },

        {
            type: 'divider'
        },
        {
            key: 'logout',
            label: 'Đăng xuất',
            // Đã đổi thành LogOutIcon của bạn
            icon: <LogOutIcon style={{ width: '16px', height: '16px' }} />,
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
                        icon={
                            <UserIcon
                                style={{ width: '22px', height: '22px' }}
                            />
                        }
                        style={{
                            backgroundColor: '#2dc275',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    />
                </div>
            </Dropdown>
        </header>
    );
}

export default AdminHeader;
