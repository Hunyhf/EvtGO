import React from 'react';
import { Menu } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import {
    DashboardOutlined,
    UserOutlined,
    CalendarOutlined
} from '@ant-design/icons';
import classNames from 'classnames/bind';
import styles from './Sidebar.module.scss';

const cx = classNames.bind(styles);

const Sidebar = () => {
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
        // Thêm các mục khác tại đây
    ];

    return (
        <aside className={cx('sidebar')}>
            <div className={cx('sidebar__logo')}>
                <Link to='/admin'>
                    <h2>EvtGO Admin</h2>
                </Link>
            </div>
            <Menu
                mode='inline'
                selectedKeys={[location.pathname]}
                items={menuItems}
                className={cx('sidebar__menu')}
            />
        </aside>
    );
};

export default Sidebar;
