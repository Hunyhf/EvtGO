// src/components/layouts/AdminLayout.jsx
import React, { useState } from 'react';
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import Sidebar from '@components/AdminSidebar/index';
import AdminHeader from '@components/AdminHeader/AdminHeader';

const { Content } = Layout;

const AdminLayout = () => {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sidebar collapsed={collapsed} />

            <Layout>
                <AdminHeader
                    collapsed={collapsed}
                    onToggle={() => setCollapsed(!collapsed)}
                />

                <Content
                    style={{
                        margin: '24px 16px',
                        padding: 24,
                        background: '#fff',
                        borderRadius: '8px',
                        minHeight: 280
                    }}
                >
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

export default AdminLayout;
