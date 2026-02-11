import React, { useState, useEffect } from 'react'; // Thêm useState, useEffect
import {
    Row,
    Col,
    Card,
    Statistic,
    Table,
    Tag,
    Typography,
    Skeleton
} from 'antd';
import {
    UserOutlined,
    CalendarOutlined,
    AccountBookOutlined,
    ArrowUpOutlined
} from '@ant-design/icons';
import { callFetchAllUsers } from '@apis/userApi'; // Import hàm API vừa tạo

const { Title } = Typography;

function AdminDashBoard() {
    // 1. Tạo state để lưu tổng số người dùng
    const [totalUsers, setTotalUsers] = useState(0);
    const [loading, setLoading] = useState(true);

    // 2. Gọi API khi component mount
    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            // Gọi API lấy danh sách người dùng (mặc định trang 1, size 1 để lấy meta)
            const res = await callFetchAllUsers('page=1&size=1');

            if (res && res.meta) {
                // Lấy giá trị 'total' từ đối tượng meta trong ResultPaginationDTO
                setTotalUsers(res.meta.total);
            }
        } catch (error) {
            console.error('Lỗi khi lấy dữ liệu dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const recentEvents = [
        {
            key: '1',
            name: 'Đại nhạc hội EDM 2024',
            organizer: 'Lê Văn A',
            status: 'Đang diễn ra',
            location: 'Hồ Chí Minh',
            date: '2024-12-20'
        }
    ];

    const columns = [
        { title: 'Tên sự kiện', dataIndex: 'name', key: 'name' },
        { title: 'Người tổ chức', dataIndex: 'organizer', key: 'organizer' },
        { title: 'Địa điểm', dataIndex: 'location', key: 'location' },
        { title: 'Ngày diễn ra', dataIndex: 'date', key: 'date' },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: status => (
                <Tag color={status === 'Đang diễn ra' ? 'green' : 'gold'}>
                    {status}
                </Tag>
            )
        }
    ];

    return (
        <div className='admin-dashboard'>
            <Title level={2}>Bảng điều khiển quản trị</Title>

            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false}>
                        {/* 3. Hiển thị dữ liệu thật vào Statistic */}
                        <Skeleton
                            loading={loading}
                            active
                            paragraph={{ rows: 1 }}
                        >
                            <Statistic
                                title='Tổng người dùng'
                                value={totalUsers} // Dữ liệu từ API
                                prefix={<UserOutlined />}
                                valueStyle={{ color: '#3f8600' }}
                            />
                        </Skeleton>
                    </Card>
                </Col>

                {/* Các cột khác giữ nguyên hoặc làm tương tự với API Sự kiện/Doanh thu */}
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false}>
                        <Statistic
                            title='Sự kiện đang chạy'
                            value={93}
                            prefix={<CalendarOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false}>
                        <Statistic
                            title='Doanh thu tháng này'
                            value={25600000}
                            suffix='VNĐ'
                            prefix={<AccountBookOutlined />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false}>
                        <Statistic
                            title='Tăng trưởng'
                            value={11.28}
                            precision={2}
                            valueStyle={{ color: '#3f8600' }}
                            prefix={<ArrowUpOutlined />}
                            suffix='%'
                        />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
                <Col span={24}>
                    <Card title='Sự kiện mới đăng ký' bordered={false}>
                        <Table
                            dataSource={recentEvents}
                            columns={columns}
                            pagination={false}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
}

export default AdminDashBoard;
