// src/components/layouts/OrganizerLayout.jsx
import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
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
    CalendarOutlined,
    FileProtectOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    UserOutlined,
    PlusOutlined,
    LogoutOutlined
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;

// Lấy màu từ biến scss (Hardcode để config cho Antd Theme)
const PRIMARY_COLOR = '#2dc275';
const SECONDARY_COLOR = '#27272a'; // Màu nền chính
const TEXT_COLOR = '#9ca6b0';
const WHITE_COLOR = '#ffffff';

function OrganizerLayout() {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // State cho logic tạo sự kiện (giữ nguyên logic cũ)
    const [currentStep, setCurrentStep] = useState(1);
    const [onNextAction, setOnNextAction] = useState(null);

    // Xác định Key menu đang chọn dựa trên URL
    const selectedKey = location.pathname;

    // Menu Items
    const menuItems = [
        {
            key: '/organizer/events',
            icon: <CalendarOutlined />,
            label: 'Sự kiện của tôi',
            onClick: () => navigate('/organizer/events')
        },
        {
            key: '/organizer/terms',
            icon: <FileProtectOutlined />,
            label: 'Điều khoản',
            onClick: () => navigate('/organizer/terms')
        }
    ];

    // Menu User Dropdown (Góc phải header)
    const userMenuNew = {
        items: [
            {
                key: 'profile',
                label: 'Hồ sơ',
                icon: <UserOutlined />
            },
            {
                key: 'logout',
                label: 'Đăng xuất',
                icon: <LogoutOutlined />,
                danger: true
            }
        ]
    };

    return (
        <ConfigProvider
            theme={{
                algorithm: theme.darkAlgorithm, // Kích hoạt chế độ tối mặc định của Antd
                token: {
                    colorPrimary: PRIMARY_COLOR,
                    colorBgBase: SECONDARY_COLOR, // Màu nền #27272a
                    colorTextBase: TEXT_COLOR,
                    colorBgContainer: '#2a2d34', // Màu sub-color cho các khối content
                    fontFamily: "'Roboto', sans-serif"
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
                        itemSelectedColor: WHITE_COLOR
                    }
                }
            }}
        >
            <Layout style={{ minHeight: '100vh' }}>
                <Sider
                    trigger={null}
                    collapsible
                    collapsed={collapsed}
                    width={250}
                    style={{ borderRight: '1px solid #393f4e' }} // Border nhẹ để tách biệt
                >
                    {/* Logo Area */}
                    <div
                        style={{
                            height: '64px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: PRIMARY_COLOR,
                            fontSize: '20px',
                            fontWeight: 'bold',
                            borderBottom: '1px solid #393f4e'
                        }}
                    >
                        {collapsed ? 'GO' : 'EvtGO Organizer'}
                    </div>

                    <Menu
                        mode='inline'
                        selectedKeys={[selectedKey]}
                        items={menuItems}
                        style={{ borderRight: 0, marginTop: '10px' }}
                    />
                </Sider>

                <Layout>
                    <Header
                        style={{
                            padding: '0 24px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            borderBottom: '1px solid #393f4e'
                        }}
                    >
                        {/* Nút Toggle Sidebar */}
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

                        {/* Right Actions */}
                        <Space size='middle'>
                            {/* Chỉ hiện nút Tạo sự kiện nếu không phải trang create */}
                            {location.pathname !==
                                '/organizer/events/create' && (
                                <Button
                                    type='primary'
                                    icon={<PlusOutlined />}
                                    onClick={() =>
                                        navigate('/organizer/events/create')
                                    }
                                >
                                    Tạo sự kiện
                                </Button>
                            )}

                            <Dropdown menu={userMenuNew} trigger={['click']}>
                                <Space
                                    style={{
                                        cursor: 'pointer',
                                        color: TEXT_COLOR
                                    }}
                                >
                                    <Avatar
                                        icon={<UserOutlined />}
                                        style={{
                                            backgroundColor: PRIMARY_COLOR
                                        }}
                                    />
                                    <span>Organizer Name</span>
                                </Space>
                            </Dropdown>
                        </Space>
                    </Header>

                    <Content
                        style={{
                            margin: '24px 16px',
                            padding: 24,
                            minHeight: 280,
                            // Phần nội dung con sẽ nằm ở đây
                            overflowY: 'auto'
                        }}
                    >
                        {/* Truyền context xuống dưới để các trang con (CreateEvent) 
                            có thể điều khiển Step hoặc state chung 
                        */}
                        <Outlet
                            context={{
                                currentStep,
                                setCurrentStep,
                                onNextAction,
                                setOnNextAction
                            }}
                        />
                    </Content>
                </Layout>
            </Layout>
        </ConfigProvider>
    );
}

export default OrganizerLayout;
