import React, { useState, useEffect } from 'react';
import {
    Card,
    Col,
    Row,
    Statistic,
    Table,
    Tag,
    Typography,
    message,
    Spin,
    Tooltip
} from 'antd';
import {
    UserOutlined,
    CalendarOutlined,
    DollarOutlined,
    ClockCircleOutlined
} from '@ant-design/icons';
import styles from './AdminDashBoard.module.scss';

// Import các API
import { callFetchAllUsers } from '../../../apis/userApi';
import { eventApi } from '../../../apis/eventApi';
import orderApi from '../../../apis/orderApi';

const { Title, Text } = Typography;

function AdminDashBoard() {
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
            // Gọi API song song: Lấy dữ liệu sắp xếp theo ngày tạo giảm dần (mới nhất)
            const [userRes, eventRes, pendingEventRes, orderRes] =
                await Promise.all([
                    callFetchAllUsers('size=5&sort=createdAt,desc'),
                    eventApi.getAll({ size: 5, sort: 'createdAt,asc' }),
                    // Lọc sự kiện chưa đăng (isPublished = false)
                    eventApi.getAll({ filter: 'isPublished:false', size: 1 }),
                    // Lấy doanh thu từ các đơn hàng đã thanh toán
                    orderApi.getAllOrders("filter=orderStatus:'PAID'&size=100")
                ]);

            // Hàm helper xử lý cấu hình trả về của axiosClient (ResResponse wrapper)
            const getData = res => (res?.data?.meta ? res.data : res);

            const userData = getData(userRes);
            const eventData = getData(eventRes);
            const pendingData = getData(pendingEventRes);
            const orderData = getData(orderRes);

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
            setRecentEvents(eventData?.result || []);
        } catch (error) {
            console.error('Dashboard Error:', error);
            message.error('Không thể kết nối đến hệ thống');
        } finally {
            setLoading(false);
        }
    };

    // --- Cột cho bảng Người dùng ---
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

    // --- Cột cho bảng Sự kiện (Xử lý tên dài bằng Tooltip + Ellipsis) ---
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
            ellipsis: { showTitle: true }
        },
        {
            title: 'Thời gian',
            dataIndex: 'startTime',
            key: 'startTime',
            render: time =>
                time
                    ? new Date(time).toLocaleString('vi-VN', {
                          hour: '2-digit',
                          minute: '2-digit',
                          day: '2-digit',
                          month: '2-digit'
                      })
                    : '-'
        },
        {
            title: 'Trạng thái',
            dataIndex: 'isPublished',
            key: 'isPublished',
            width: 120,
            render: isPublished => (
                <Tag color={isPublished ? 'success' : 'warning'}>
                    {isPublished ? 'Đã đăng' : 'Chờ duyệt'}
                </Tag>
            )
        }
    ];

    const statCards = [
        {
            title: 'Tổng người dùng',
            value: stats.totalUsers,
            icon: <UserOutlined style={{ color: '#1890ff' }} />,
            color: '#e6f7ff',
            suffix: 'người'
        },
        {
            title: 'Tổng sự kiện',
            value: stats.totalEvents,
            icon: <CalendarOutlined style={{ color: '#722ed1' }} />,
            color: '#f9f0ff',
            suffix: 'sự kiện'
        },
        {
            title: 'Doanh thu (PAID)',
            value: stats.revenue,
            icon: <DollarOutlined style={{ color: '#52c41a' }} />,
            color: '#f6ffed',
            suffix: 'VND'
        },
        {
            title: 'Sự kiện chờ duyệt',
            value: stats.pendingEvents,
            icon: <ClockCircleOutlined style={{ color: '#fa8c16' }} />,
            color: '#fff7e6',
            suffix: ''
        }
    ];

    if (loading)
        return (
            <div style={{ textAlign: 'center', padding: '100px' }}>
                <Spin size='large' tip='Đang tải dữ liệu...' />
            </div>
        );

    return (
        <div className={styles.dashboardContainer}>
            <Title level={3} style={{ marginBottom: 20 }}>
                Tổng quan hệ thống
            </Title>

            <Row gutter={[16, 16]}>
                {statCards.map((item, index) => (
                    <Col xs={24} sm={12} lg={6} key={index}>
                        <Card
                            bordered={false}
                            hoverable
                            className={styles.statCard}
                        >
                            <Statistic
                                title={item.title}
                                value={item.value}
                                prefix={
                                    <div
                                        className={styles.statIcon}
                                        style={{
                                            backgroundColor: item.color,
                                            padding: 8,
                                            borderRadius: 8,
                                            marginRight: 12
                                        }}
                                    >
                                        {item.icon}
                                    </div>
                                }
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
                                formatter={val => val.toLocaleString('vi-VN')}
                            />
                        </Card>
                    </Col>
                ))}
            </Row>

            <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
                <Col xs={24} lg={12}>
                    <Card
                        title='Người dùng mới nhất'
                        extra={<a href='/admin/users'>Tất cả</a>}
                    >
                        <Table
                            columns={userColumns}
                            dataSource={recentUsers}
                            rowKey='id'
                            pagination={false}
                            size='small'
                        />
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card
                        title='Sự kiện mới cập nhật'
                        extra={<a href='/admin/events'>Tất cả</a>}
                    >
                        <Table
                            columns={eventColumns}
                            dataSource={recentEvents}
                            rowKey='id'
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
