import React from 'react';
import { Card, Col, Row, Statistic, Table, Tag, Typography, Space } from 'antd';
import {
    UserOutlined,
    CalendarOutlined,
    DollarOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    RiseOutlined
} from '@ant-design/icons';
import styles from './AdminDashBoard.module.scss'; // Style riêng nếu cần

const { Title } = Typography;

function AdminDashBoard() {
    // === MOCK DATA (Dữ liệu giả lập) ===
    const stats = [
        {
            title: 'Tổng người dùng',
            value: 1250,
            icon: (
                <UserOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
            ),
            suffix: '',
            color: '#e6f7ff'
        },
        {
            title: 'Tổng sự kiện',
            value: 86,
            icon: (
                <CalendarOutlined
                    style={{ fontSize: '24px', color: '#722ed1' }}
                />
            ),
            suffix: 'events',
            color: '#f9f0ff'
        },
        {
            title: 'Doanh thu (tháng)',
            value: 125000000,
            icon: (
                <DollarOutlined
                    style={{ fontSize: '24px', color: '#52c41a' }}
                />
            ),
            suffix: 'VND',
            color: '#f6ffed'
        },
        {
            title: 'Sự kiện chờ duyệt',
            value: 5,
            icon: (
                <ClockCircleOutlined
                    style={{ fontSize: '24px', color: '#fa8c16' }}
                />
            ),
            suffix: '',
            color: '#fff7e6'
        }
    ];

    // Dữ liệu bảng người dùng mới
    const recentUsers = [
        {
            key: 1,
            name: 'Nguyễn Văn A',
            email: 'a@gmail.com',
            role: 'Customer',
            date: '2023-10-25'
        },
        {
            key: 2,
            name: 'Trần Thị B',
            email: 'b@gmail.com',
            role: 'Organizer',
            date: '2023-10-24'
        },
        {
            key: 3,
            name: 'Lê Văn C',
            email: 'c@gmail.com',
            role: 'Customer',
            date: '2023-10-23'
        }
    ];

    // Dữ liệu bảng sự kiện mới
    const recentEvents = [
        {
            key: 1,
            name: 'Hòa nhạc Mùa Thu',
            organizer: 'Band A',
            status: 'pending',
            date: '2023-11-20'
        },
        {
            key: 2,
            name: 'Triển lãm Art',
            organizer: 'Studio B',
            status: 'approved',
            date: '2023-12-05'
        },
        {
            key: 3,
            name: 'Workshop React',
            organizer: 'Tech C',
            status: 'rejected',
            date: '2023-11-15'
        }
    ];

    // Cấu hình cột cho bảng Users
    const userColumns = [
        { title: 'Tên', dataIndex: 'name', key: 'name' },
        { title: 'Email', dataIndex: 'email', key: 'email' },
        {
            title: 'Vai trò',
            dataIndex: 'role',
            key: 'role',
            render: role => (
                <Tag color={role === 'Organizer' ? 'purple' : 'blue'}>
                    {role}
                </Tag>
            )
        },
        { title: 'Ngày tham gia', dataIndex: 'date', key: 'date' }
    ];

    // Cấu hình cột cho bảng Events
    const eventColumns = [
        { title: 'Tên sự kiện', dataIndex: 'name', key: 'name' },
        { title: 'BTC', dataIndex: 'organizer', key: 'organizer' },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: status => {
                let color = 'default';
                let text = 'Khác';
                if (status === 'approved') {
                    color = 'success';
                    text = 'Đã duyệt';
                }
                if (status === 'pending') {
                    color = 'warning';
                    text = 'Chờ duyệt';
                }
                if (status === 'rejected') {
                    color = 'error';
                    text = 'Từ chối';
                }
                return <Tag color={color}>{text}</Tag>;
            }
        }
    ];

    return (
        <div className={styles.dashboardContainer}>
            <Title level={3} style={{ marginBottom: 20 }}>
                Tổng quan hệ thống
            </Title>

            {/* 1. Phần Thống kê (Stats Cards) */}
            <Row gutter={[16, 16]}>
                {stats.map((item, index) => (
                    <Col xs={24} sm={12} lg={6} key={index}>
                        <Card
                            bordered={false}
                            hoverable
                            className={styles.statCard}
                        >
                            <div className={styles.statContent}>
                                <div
                                    className={styles.statIcon}
                                    style={{ backgroundColor: item.color }}
                                >
                                    {item.icon}
                                </div>
                                <div className={styles.statInfo}>
                                    <Statistic
                                        title={item.title}
                                        value={item.value}
                                        suffix={
                                            <span
                                                style={{
                                                    fontSize: '14px',
                                                    color: '#888'
                                                }}
                                            >
                                                {item.suffix}
                                            </span>
                                        }
                                        valueStyle={{
                                            fontSize: '24px',
                                            fontWeight: 'bold'
                                        }}
                                    />
                                </div>
                            </div>
                        </Card>
                    </Col>
                ))}
            </Row>

            {/* 2. Phần Bảng dữ liệu (Tables) */}
            <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
                {/* Bảng Người dùng mới */}
                <Col xs={24} lg={12}>
                    <Card
                        title='Người dùng mới tham gia'
                        bordered={false}
                        extra={<a href='/admin/users'>Xem tất cả</a>}
                    >
                        <Table
                            columns={userColumns}
                            dataSource={recentUsers}
                            pagination={false}
                            size='small'
                        />
                    </Card>
                </Col>

                {/* Bảng Sự kiện gần đây */}
                <Col xs={24} lg={12}>
                    <Card
                        title='Sự kiện gần đây'
                        bordered={false}
                        extra={<a href='/admin/events'>Xem tất cả</a>}
                    >
                        <Table
                            columns={eventColumns}
                            dataSource={recentEvents}
                            pagination={false}
                            size='small'
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
}

export default AdminDashBoard;
