import React, { useState } from 'react';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    UserOutlined,
    VideoCameraOutlined,
    DashboardOutlined
} from '@ant-design/icons';
import { Button, Layout, Menu, theme } from 'antd';
import { Outlet, useNavigate, Link } from 'react-router-dom'; // Thêm Link vào đây

const { Header, Sider, Content } = Layout;

function AdminLayout() {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();

    const {
        token: { colorBgContainer, borderRadiusLG }
    } = theme.useToken();

    const menuItems = [
        {
            key: '/admin',
            icon: <DashboardOutlined />,
            label: 'Bảng điều khiển'
        },
        {
            key: '/admin/users',
            icon: <UserOutlined />,
            label: 'Quản lý người dùng'
        },
        {
            key: '/admin/events',
            icon: <VideoCameraOutlined />,
            label: 'Quản lý sự kiện'
        }
    ];

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider trigger={null} collapsible collapsed={collapsed}>
                {/* --- PHẦN LOGO MỚI --- */}
                <div
                    style={{
                        height: '64px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '10px'
                    }}
                >
                    <Link to='/'>
                        <img
                            src='https://ticketbox.vn/_next/static/images/logo-for-tet.png'
                            alt='logo'
                            style={{
                                maxHeight: '32px',
                                maxWidth: '100%',
                                objectFit: 'contain'
                            }}
                        />
                    </Link>
                </div>
                {/* ---------------------- */}

                <Menu
                    theme='dark'
                    mode='inline'
                    defaultSelectedKeys={['/admin']}
                    items={menuItems}
                    onClick={({ key }) => navigate(key)}
                />
            </Sider>

            <Layout>
                <Header style={{ padding: 0, background: colorBgContainer }}>
                    <Button
                        type='text'
                        icon={
                            collapsed ? (
                                <MenuUnfoldOutlined />
                            ) : (
                                <MenuFoldOutlined />
                            )
                        }
                        onClick={() => setCollapsed(!collapsed)}
                        style={{ fontSize: '16px', width: 64, height: 64 }}
                    />
                </Header>
                <Content
                    style={{
                        margin: '24px 16px',
                        padding: 24,
                        minHeight: 280,
                        background: colorBgContainer,
                        borderRadius: borderRadiusLG
                    }}
                >
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
}

export default AdminLayout;
