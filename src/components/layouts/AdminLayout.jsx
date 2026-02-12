import React from 'react';
import { Outlet } from 'react-router-dom';
import classNames from 'classnames/bind';
import Sidebar from '@components/AdminSidebar/index'; // Component vừa tạo
import AdminHeader from '@components/AdminHeader/AdminHeader'; // Component bạn đã có
import styles from './AdminLayout.module.scss';

const cx = classNames.bind(styles);

const AdminLayout = () => {
    return (
        <div className={cx('admin-layout')}>
            <Sidebar />

            <div className={cx('admin-main')}>
                <AdminHeader />

                <main className={cx('admin-content')}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
