import React, { useState, useEffect } from 'react';
import { Row, Col, Table, Tag, Typography, message } from 'antd';
import {
    UserOutlined,
    CalendarOutlined,
    AccountBookOutlined,
    ArrowUpOutlined
} from '@ant-design/icons';
import classNames from 'classnames/bind';

import styles from './AdminDashBoard.module.scss';
import StatCard from '@components/StatCard/StatCard.jsx';
import { callFetchAllUsers } from '@apis/userApi';

const cx = classNames.bind(styles);
const { Title, Text } = Typography;

function AdminDashBoard() {
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeEvents: 93,
        revenue: 25600000,
        growth: 11.28
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            // Gọi API lấy tổng số người dùng
            const res = await callFetchAllUsers('page=1&size=1');
            if (res?.meta) {
                setStats(prev => ({ ...prev, totalUsers: res.meta.total }));
            }
        } catch (error) {
            message.error('Lỗi khi tải dữ liệu thống kê');
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: 'Sự kiện',
            dataIndex: 'name',
            key: 'name',
            render: text => (
                <span className={cx('table-text-bold')}>{text}</span>
            )
        },
        { title: 'Người tổ chức', dataIndex: 'organizer', key: 'organizer' },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            render: status => (
                <Tag color={status === 'Đang diễn ra' ? '#2dc275' : '#faad14'}>
                    {status}
                </Tag>
            )
        }
    ];

    return (
        <div className={cx('dashboard')}>
            <div className={cx('dashboard__header')}>
                <Title level={2} className={cx('dashboard__title')}>
                    Bảng điều khiển quản trị
                </Title>
                <Text className={cx('dashboard__subtitle')}>
                    Chào mừng trở lại! Đây là tổng quan hệ thống EvtGO của bạn.
                </Text>
            </div>

            <Row gutter={[24, 24]}>
                <Col xs={24} sm={12} lg={6}>
                    <StatCard
                        title='Tổng người dùng'
                        value={stats.totalUsers}
                        icon={<UserOutlined />}
                        color='#2dc275'
                        loading={loading}
                    />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <StatCard
                        title='Sự kiện'
                        value={stats.activeEvents}
                        icon={<CalendarOutlined />}
                        color='#1890ff'
                        loading={loading}
                    />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <StatCard
                        title='Doanh thu'
                        value={stats.revenue}
                        suffix='đ'
                        icon={<AccountBookOutlined />}
                        color='#faad14'
                        loading={loading}
                    />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <StatCard
                        title='Tăng trưởng'
                        value={stats.growth}
                        suffix='%'
                        icon={<ArrowUpOutlined />}
                        color='#2dc275'
                        loading={loading}
                    />
                </Col>
            </Row>

            <div className={cx('dashboard__table-section')}>
                <div className={cx('section-header')}>
                    <Title level={4}>Sự kiện mới đăng ký</Title>
                </div>
                <Table
                    columns={columns}
                    dataSource={[]} // Kết nối với API Sự kiện của bạn sau này
                    pagination={false}
                    className={cx('custom-table')}
                />
            </div>
        </div>
    );
}

export default AdminDashBoard;
