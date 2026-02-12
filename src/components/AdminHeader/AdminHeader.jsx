// src/components/AdminHeader/AdminHeader.jsx
import React, { useContext } from 'react';
import { Layout, Button, Avatar, Dropdown, message } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '@contexts/AuthContext';
import LogOutIcon from '@icons/svgs/logOutIcon.svg?react';
import UserIcon from '@icons/svgs/userIcon.svg?react';

const { Header } = Layout;

function AdminHeader({ collapsed, onToggle }) {
    const { user, logoutContext } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        if (logoutContext) {
            logoutContext();
            message.success('Đăng xuất thành công!');
            navigate('/');
        }
    };

    const menuItems = [
        {
            key: 'profile',
            label: <Link to='/admin/profile'>Thông tin cá nhân</Link>,
            icon: <UserIcon style={{ width: '16px', height: '16px' }} />
        },
        {
            key: 'account',
            label: <Link to='/admin/account'>Thông tin tài khoản</Link>,
            icon: <UserIcon style={{ width: '16px', height: '16px' }} />
        },
        { type: 'divider' },
        {
            key: 'logout',
            label: 'Đăng xuất',
            icon: <LogOutIcon style={{ width: '16px', height: '16px' }} />,
            danger: true,
            onClick: handleLogout
        }
    ];

    return (
        <Header
            style={{
                padding: 0,
                background: '#fff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingRight: '24px',
                boxShadow: '0 1px 4px rgba(0,21,41,.08)'
            }}
        >
            {/* Nút Toggle Sidebar */}
            <Button
                type='text'
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={onToggle}
                style={{ fontSize: '18px', width: 64, height: 64 }}
            />

            <Dropdown
                menu={{ items: menuItems }}
                placement='bottomRight'
                trigger={['click']}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        cursor: 'pointer'
                    }}
                >
                    <div
                        style={{
                            textAlign: 'right',
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                    >
                        <span
                            style={{
                                fontWeight: 600,
                                fontSize: '14px',
                                color: '#262626',
                                lineHeight: '1.4'
                            }}
                        >
                            {user?.name || 'Quản trị viên'}
                        </span>
                        <span
                            style={{
                                fontSize: '12px',
                                color: '#8c8c8c',
                                lineHeight: '1'
                            }}
                        >
                            Admin
                        </span>
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
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    />
                </div>
            </Dropdown>
        </Header>
    );
}

export default AdminHeader;
