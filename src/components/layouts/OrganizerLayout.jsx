import React, { useState } from 'react';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    CalendarOutlined,
    TeamOutlined,
    FileTextOutlined
} from '@ant-design/icons';
import { Button, Layout, Menu, theme } from 'antd';
import { Outlet, useNavigate } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

function OrganizerLayout() {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();

    const {
        token: { colorBgContainer, borderRadiusLG }
    } = theme.useToken();

    // Menu dành riêng cho Nhà tổ chức
    const menuItems = [
        {
            key: '/organizer',
            icon: <CalendarOutlined />,
            label: 'Sự kiện của tôi'
        },
        {
            key: '/organizer/tickets',
            icon: <FileTextOutlined />,
            label: 'Quản lý vé'
        },
        {
            key: '/organizer/staff',
            icon: <TeamOutlined />,
            label: 'Quản lý nhân viên'
        }
    ];

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider trigger={null} collapsible collapsed={collapsed}>
                <div
                    className='demo-logo-vertical'
                    style={{
                        height: '32px',
                        margin: '16px',
                        background: 'rgba(255, 255, 255, .2)'
                    }}
                />
                <Menu
                    theme='dark'
                    mode='inline'
                    defaultSelectedKeys={['/organizer']}
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
                        style={{
                            fontSize: '16px',
                            width: 64,
                            height: 64
                        }}
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

export default OrganizerLayout;
