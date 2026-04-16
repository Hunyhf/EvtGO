import React, { useState, useEffect } from 'react';
import { Col, Row, Table, Tag, Typography, message, Tooltip, Card } from 'antd';
import {
    UserOutlined,
    CalendarOutlined,
    DollarOutlined,
    ClockCircleOutlined
} from '@ant-design/icons';
import styles from './AdminDashBoard.module.scss';

// Import các API
import { callFetchAllUsers } from '@apis/userApi';
import { eventApi } from '@apis/eventApi';
import orderApi from '@apis/orderApi';
import { useNavigate } from 'react-router-dom';

// Import Component dùng chung
import StatCard from '@components/StatCard/StatCard';

const { Title, Text } = Typography;

function AdminDashBoard() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalEvents: 0,
        revenue: 0,
        pendingEvents: 0
    });
    const [recentUsers, setRecentUsers] = useState([]);
    const [recentEvents, setRecentEvents] = useState([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // Gọi API song song
            const [userRes, eventRes, pendingEventRes, orderRes] =
                await Promise.all([
                    callFetchAllUsers('size=5&sort=createdAt,desc'),
                    eventApi.getAll({ size: 5, sort: 'createdAt,desc' }),
                    eventApi.getAll({ filter: 'isPublished:false', size: 1 }),
                    orderApi.getAllOrders("filter=orderStatus:'PAID'&size=100")
                ]);

            const getData = res => (res?.data?.meta ? res.data : res);

            const userData = getData(userRes);
            const eventData = getData(eventRes);
            const pendingData = getData(pendingEventRes);
            const orderData = getData(orderRes);

            // Xử lý dữ liệu Event để đồng bộ trạng thái và ngày tháng giống AdminEventManagement
            const processedEvents = (eventData?.result || []).map(event => {
                const isPublished = event.isPublished || event.published;
                const isActive = event.isActive || event.active;

                // Logic định danh trạng thái giống trang quản lý sự kiện
                let derivedStatus = 'PENDING';
                if (!isPublished && isActive) {
                    derivedStatus = 'PAST';
                } else if (isPublished && isActive) {
                    derivedStatus = 'OPEN';
                } else if (isPublished && !isActive) {
                    derivedStatus = 'UPCOMING';
                } else {
                    derivedStatus = 'PENDING';
                }

                // Kết hợp ngày và giờ để tránh lỗi "Invalid Date"
                const fullStartTime = event.startDate
                    ? `${event.startDate} ${event.startTime || '00:00:00'}`
                    : event.startTime;

                return {
                    ...event,
                    derivedStatus,
                    fullStartTime
                };
            });

            setStats({
                totalUsers: userData?.meta?.total || 0,
                totalEvents: eventData?.meta?.total || 0,
                pendingEvents: pendingData?.meta?.total || 0,
                revenue:
                    orderData?.result?.reduce(
                        (sum, order) => sum + (order.totalAmount || 0),
                        0
                    ) || 0
            });

            setRecentUsers(userData?.result || []);
            setRecentEvents(processedEvents);
        } catch (error) {
            console.error('Dashboard Error:', error);
            message.error('Không thể kết nối đến hệ thống');
        } finally {
            setLoading(false);
        }
    };

    const userColumns = [
        { title: 'Tên', dataIndex: 'name', key: 'name' },
        { title: 'Email', dataIndex: 'email', key: 'email', ellipsis: true },
        {
            title: 'Vai trò',
            dataIndex: 'role',
            key: 'role',
            render: role => (
                <Tag color={role?.name === 'ADMIN' ? 'red' : 'blue'}>
                    {role?.name || 'Customer'}
                </Tag>
            )
        },
        {
            title: 'Ngày tham gia',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: date =>
                date ? new Date(date).toLocaleDateString('vi-VN') : '-'
        }
    ];

    const eventColumns = [
        {
            title: 'Tên sự kiện',
            dataIndex: 'name',
            key: 'name',
            width: '40%',
            render: name => (
                <Tooltip title={name}>
                    <Text ellipsis style={{ width: '100%' }}>
                        {name}
                    </Text>
                </Tooltip>
            )
        },
        {
            title: 'Địa điểm',
            dataIndex: 'location',
            key: 'location',
            ellipsis: true
        },
        {
            title: 'Thời gian',
            dataIndex: 'fullStartTime', // Sử dụng dữ liệu đã kết hợp ngày+giờ
            key: 'startTime',
            render: time => {
                if (!time) return <Text type='secondary'>Chưa cập nhật</Text>;
                const d = new Date(time);
                if (isNaN(d.getTime()))
                    return <Text type='secondary'>Ngày không hợp lệ</Text>;
                return d.toLocaleString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                });
            }
        },
        {
            title: 'Trạng thái',
            dataIndex: 'derivedStatus', // Hiển thị theo trạng thái thực tế
            key: 'status',
            width: 120,
            render: status => {
                const statusConfig = {
                    PENDING: { color: 'default', text: 'Chờ' },
                    UPCOMING: { color: 'processing', text: 'Sắp bán' },
                    OPEN: { color: 'success', text: 'Mở bán' },
                    PAST: { color: 'orange', text: 'Đã qua' }
                };
                const config = statusConfig[status] || {
                    color: 'default',
                    text: 'Chờ'
                };
                return (
                    <Tag color={config.color} style={{ fontSize: '10px' }}>
                        {config.text.toUpperCase()}
                    </Tag>
                );
            }
        }
    ];

    const statCardsData = [
        {
            title: 'Tổng người dùng',
            value: stats.totalUsers,
            icon: <UserOutlined />,
            color: '#1890ff',
            suffix: 'người',
            path: '/admin/users'
        },
        {
            title: 'Tổng sự kiện',
            value: stats.totalEvents,
            icon: <CalendarOutlined />,
            color: '#722ed1',
            suffix: 'sự kiện',
            path: '/admin/events'
        },
        {
            title: 'Doanh thu',
            value: stats.revenue,
            icon: <DollarOutlined />,
            color: '#52c41a',
            suffix: 'VND'
        },
        {
            title: 'Sự kiện chờ duyệt',
            value: stats.pendingEvents,
            icon: <ClockCircleOutlined />,
            color: '#fa8c16',
            suffix: 'đợi duyệt',
            path: '/admin/events'
        }
    ];

    return (
        <div className={styles.dashboardContainer}>
            <Title level={3} style={{ marginBottom: 24 }}>
                Tổng quan hệ thống
            </Title>

            <Row gutter={[24, 24]}>
                {statCardsData.map((item, index) => (
                    <Col xs={24} sm={12} lg={6} key={index}>
                        <div
                            onClick={() => item.path && navigate(item.path)}
                            style={{
                                cursor: item.path ? 'pointer' : 'default'
                            }}
                        >
                            <StatCard
                                title={item.title}
                                value={item.value}
                                icon={item.icon}
                                color={item.color}
                                suffix={item.suffix}
                                loading={loading}
                            />
                        </div>
                    </Col>
                ))}
            </Row>

            <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
                <Col xs={24} lg={12}>
                    <Card
                        title='Người dùng mới nhất'
                        extra={
                            <a onClick={() => navigate('/admin/users')}>
                                Tất cả
                            </a>
                        }
                        bordered={false}
                        className={styles.tableCard}
                    >
                        <Table
                            columns={userColumns}
                            dataSource={recentUsers}
                            rowKey='id'
                            pagination={false}
                            size='small'
                            loading={loading}
                        />
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card
                        title='Sự kiện vừa tạo'
                        extra={
                            <a onClick={() => navigate('/admin/events')}>
                                Tất cả
                            </a>
                        }
                        bordered={false}
                        className={styles.tableCard}
                    >
                        <Table
                            columns={eventColumns}
                            dataSource={recentEvents}
                            rowKey='id'
                            pagination={false}
                            size='small'
                            loading={loading}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
}

export default AdminDashBoard;
