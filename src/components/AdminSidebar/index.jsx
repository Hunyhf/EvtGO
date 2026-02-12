import React from 'react';
import { Layout, Menu } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import { DashboardOutlined, UserOutlined } from '@ant-design/icons';
import styles from './Sidebar.module.scss';
import UserIcon from '@icons/svgs/userIcon.svg?react';

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
            icon: <UserIcon style={{ width: '16px', height: '16px' }} />,
            label: <Link to='/admin/users'>Quản lý người dùng</Link>
        }
    ];

    return (
        <Sider
            trigger={null}
            collapsible
            collapsed={collapsed}
            width={260}
            className={styles.sidebar}
            style={{
                boxShadow: '2px 0 8px 0 rgba(29,35,41,.05)',
                zIndex: 10
            }}
        >
            <div className={styles.sidebar__logo}>
                <Link to='/admin'>
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

            <div className={styles.sidebar__menu}>
                <Menu
                    mode='inline'
                    selectedKeys={[location.pathname]}
                    items={menuItems}
                    style={{ borderRight: 0 }}
                />
            </div>
        </Sider>
    );
};

export default AdminSidebar;
