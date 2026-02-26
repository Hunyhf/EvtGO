// src/components/layouts/MainDashboardLayout.jsx
import React, { useState, useContext } from 'react'; // Thêm useContext
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Layout,
    Menu,
    ConfigProvider,
    theme,
    Button,
    Avatar,
    Dropdown,
    Space
} from 'antd';
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    UserOutlined
} from '@ant-design/icons';

// Import AuthContext và helper xử lý ảnh
import { AuthContext } from '@contexts/AuthContext';
import { getAvatarUrl } from '@utils/imageHelper';

const { Header, Sider, Content } = Layout;

// Cấu hình màu sắc chung
const PRIMARY_COLOR = '#2dc275';
const SECONDARY_COLOR = '#27272a';
const TEXT_COLOR = '#9ca6b0';
const SIDER_WIDTH = 250;

/**
 * MainDashboardLayout: Khung giao diện chung cho cả Admin và Organizer
 */
const MainDashboardLayout = ({
    menuItems,
    userMenuItems,
    logoTitle = 'EvtGO',
    logoLink = '/',
    children,
    extraHeaderActions
}) => {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Lấy thông tin user từ context
    const { user } = useContext(AuthContext);

    // Tự động chọn menu dựa trên URL hiện tại
    const selectedKey = location.pathname;

    return (
        <ConfigProvider
            theme={{
                algorithm: theme.darkAlgorithm,
                token: {
                    colorPrimary: PRIMARY_COLOR,
                    colorBgBase: SECONDARY_COLOR,
                    colorTextBase: TEXT_COLOR,
                    colorBgContainer: '#2a2d34'
                },
                components: {
                    Layout: {
                        bodyBg: SECONDARY_COLOR,
                        headerBg: SECONDARY_COLOR,
                        siderBg: SECONDARY_COLOR
                    },
                    Menu: {
                        itemBg: SECONDARY_COLOR,
                        itemSelectedBg: PRIMARY_COLOR,
                        itemSelectedColor: '#fff'
                    }
                }
            }}
        >
            <Layout style={{ minHeight: '100vh' }}>
                {/* 1. SIDEBAR CỐ ĐỊNH */}
                <Sider
                    trigger={null}
                    collapsible
                    collapsed={collapsed}
                    width={SIDER_WIDTH}
                    style={{
                        overflow: 'auto',
                        height: '100vh',
                        position: 'fixed',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        borderRight: '1px solid #393f4e',
                        zIndex: 1000
                    }}
                >
                    {/* Logo Area */}
                    <div
                        onClick={() => navigate(logoLink)}
                        style={{
                            height: '64px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: PRIMARY_COLOR,
                            fontSize: '20px',
                            fontWeight: 'bold',
                            borderBottom: '1px solid #393f4e',
                            cursor: 'pointer',
                            userSelect: 'none'
                        }}
                    >
                        {collapsed ? 'GO' : logoTitle}
                    </div>

                    <Menu
                        mode='inline'
                        selectedKeys={[selectedKey]}
                        items={menuItems}
                        style={{ borderRight: 0, marginTop: '10px' }}
                    />
                </Sider>

                {/* Layout con nằm bên phải Sidebar */}
                <Layout
                    style={{
                        marginLeft: collapsed ? 80 : SIDER_WIDTH,
                        transition: 'all 0.2s'
                    }}
                >
                    {/* 2. HEADER CỐ ĐỊNH */}
                    <Header
                        style={{
                            padding: '0 24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            borderBottom: '1px solid #393f4e',
                            position: 'sticky',
                            top: 0,
                            zIndex: 999,
                            width: '100%',
                            background: SECONDARY_COLOR
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
                            style={{
                                fontSize: '16px',
                                width: 64,
                                height: 64,
                                color: TEXT_COLOR
                            }}
                        />

                        <Space size='middle'>
                            {extraHeaderActions}

                            <Dropdown
                                menu={{ items: userMenuItems }}
                                trigger={['click']}
                            >
                                <Space
                                    style={{
                                        cursor: 'pointer',
                                        color: TEXT_COLOR
                                    }}
                                >
                                    {/* Hiển thị Avatar từ dữ liệu người dùng */}
                                    <Avatar
                                        src={getAvatarUrl(
                                            user?.id,
                                            user?.avatar
                                        )}
                                        icon={<UserOutlined />}
                                        style={{
                                            backgroundColor: SECONDARY_COLOR
                                        }}
                                    />
                                    {/* Hiển thị tên người dùng từ context */}
                                    <span>{user?.name || 'User'}</span>
                                </Space>
                            </Dropdown>
                        </Space>
                    </Header>

                    {/* 3. CONTENT */}
                    <Content
                        style={{
                            margin: '24px 16px',
                            padding: 24,
                            minHeight: 280,
                            overflow: 'initial'
                        }}
                    >
                        {children}
                    </Content>
                </Layout>
            </Layout>
        </ConfigProvider>
    );
};

export default MainDashboardLayout;
