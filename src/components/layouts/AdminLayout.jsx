import React, { useState, useContext, useMemo } from 'react';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    UserOutlined,
    VideoCameraOutlined,
    DashboardOutlined,
    LogoutOutlined,
    ProfileOutlined
} from '@ant-design/icons';
import {
    Button,
    Layout,
    Menu,
    theme,
    Avatar,
    Dropdown,
    Space,
    message
} from 'antd';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '@contexts/AuthContext';

const { Header, Sider, Content } = Layout;

const SIDEBAR_ITEMS = [
    { key: '/admin', icon: <DashboardOutlined />, label: 'Bảng điều khiển' },
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

const AdminLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logoutContext } = useContext(AuthContext);

    const {
        token: { colorBgContainer, borderRadiusLG }
    } = theme.useToken();

    const handleLogout = () => {
        logoutContext();
        message.success('Đăng xuất thành công');
        navigate('/');
    };

    const userMenuItems = useMemo(
        () => [
            {
                key: 'profile',
                label: <Link to='/admin/profile'>Thông tin cá nhân</Link>,
                icon: <ProfileOutlined />
            },
            { type: 'divider' },
            {
                key: 'logout',
                label: 'Đăng xuất',
                icon: <LogoutOutlined />,
                danger: true,
                onClick: handleLogout
            }
        ],
        []
    );

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider trigger={null} collapsible collapsed={collapsed}>
                <div
                    style={{
                        height: 64,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 10
                    }}
                >
                    <Link to='/'>
                        <img
                            src='https://ticketbox.vn/_next/static/images/logo-for-tet.png'
                            alt='logo'
                            style={{
                                maxHeight: 32,
                                maxWidth: '100%',
                                objectFit: 'contain'
                            }}
                        />
                    </Link>
                </div>

                <Menu
                    theme='dark'
                    mode='inline'
                    selectedKeys={[location.pathname]} // Tự động active menu theo URL
                    items={SIDEBAR_ITEMS}
                    onClick={({ key }) => navigate(key)}
                />
            </Sider>

            <Layout>
                <Header
                    style={{
                        padding: '0 24px 0 0',
                        background: colorBgContainer,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}
                >
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
                        style={{ fontSize: 16, width: 64, height: 64 }}
                    />

                    <Dropdown
                        menu={{ items: userMenuItems }}
                        placement='bottomRight'
                        trigger={['click']}
                    >
                        <Space style={{ cursor: 'pointer', padding: '0 16px' }}>
                            <div
                                style={{ textAlign: 'right', lineHeight: 1.2 }}
                            >
                                <div
                                    style={{
                                        fontWeight: 600,
                                        color: '#27272a'
                                    }}
                                >
                                    {user?.name || 'Admin'}
                                </div>
                                <div style={{ fontSize: 12, color: '#9ca6b0' }}>
                                    Quản trị viên
                                </div>
                            </div>
                            <Avatar
                                size='large'
                                src='https://static.ticketbox.vn/avatar.png'
                                icon={<UserOutlined />}
                                style={{ backgroundColor: '#2dc275' }}
                            />
                        </Space>
                    </Dropdown>
                </Header>

                <Content
                    style={{
                        margin: '24px 16px',
                        padding: 24,
                        minHeight: 280,
                        background: colorBgContainer,
                        borderRadius: borderRadiusLG,
                        overflow: 'initial'
                    }}
                >
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};

export default AdminLayout;
