import React from 'react';
import { Layout, Menu } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import { DashboardOutlined, UserOutlined } from '@ant-design/icons';

const { Sider } = Layout;

const AdminSidebar = ({ collapsed }) => {
    const location = useLocation();

    const menuItems = [
        {
            key: '/admin',
            icon: <DashboardOutlined />,
            label: <Link to='/admin'>Dashboard</Link>
        },
        {
            key: '/admin/users',
            icon: <UserOutlined />,
            label: <Link to='/admin/users'>Quản lý người dùng</Link>
        }
    ];

    return (
        <Sider
            trigger={null}
            collapsible
            collapsed={collapsed}
            theme='light'
            width={260}
            style={{
                boxShadow: '2px 0 8px 0 rgba(29,35,41,.05)',
                zIndex: 10
            }}
        >
            <div
                style={{
                    height: 64,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: collapsed ? '0' : '0 16px',
                    transition: 'all 0.2s',
                    overflow: 'hidden'
                }}
            >
                <Link to='/'>
                    <img
                        src='https://ticketbox.vn/_next/static/images/logo-for-tet.png'
                        alt='logo'
                        style={{
                            height: collapsed ? '30px' : '45px',
                            maxWidth: '100%',
                            objectFit: 'contain',
                            transition: 'height 0.2s'
                        }}
                    />
                </Link>
            </div>
            <Menu
                mode='inline'
                selectedKeys={[location.pathname]}
                items={menuItems}
                style={{ borderRight: 0 }}
            />
        </Sider>
    );
};

export default AdminSidebar;
