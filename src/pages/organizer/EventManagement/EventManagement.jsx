// src/pages/organizer/EventManagement/EventManagement.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Table,
    Input,
    Button,
    Tabs,
    Tag,
    Space,
    Popconfirm,
    message,
    Card,
    Typography,
    Tooltip
} from 'antd';
import {
    SearchOutlined,
    EditOutlined,
    DeleteOutlined,
    PlusOutlined,
    EyeOutlined,
    CalendarOutlined,
    EnvironmentOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

// Import API
import { callFetchAllEvents, callDeleteEvent } from '@apis/eventApi';

const { Title } = Typography;

const EventManagement = () => {
    const navigate = useNavigate();

    // State
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [activeTab, setActiveTab] = useState('upcoming'); // Tab mặc định

    // 1. Logic Fetch API (Giữ nguyên logic tối ưu của bạn)
    const fetchEvents = useCallback(async () => {
        setLoading(true);
        try {
            const response = await callFetchAllEvents();
            // Xử lý response tùy theo cấu trúc trả về
            const data =
                response?.content || response?.result || response || [];
            setEvents(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Lỗi khi lấy danh sách sự kiện:', error);
            message.error('Không thể tải danh sách sự kiện');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    // 2. Logic Filter (Giữ nguyên logic của bạn, chuyển đổi sang dùng cho Table)
    const filteredEvents = useMemo(() => {
        const now = dayjs();

        return events.filter(event => {
            // Filter theo Search
            const name = event?.name?.toLowerCase() || '';
            const location = event?.location?.toLowerCase() || ''; // Thêm tìm theo địa điểm
            const matchSearch =
                name.includes(searchText.toLowerCase()) ||
                location.includes(searchText.toLowerCase());

            if (!matchSearch) return false;

            const eventDate = dayjs(event?.startDate);

            // Filter theo Tab
            switch (activeTab) {
                case 'upcoming':
                    // Đã duyệt và chưa diễn ra (hoặc đang diễn ra)
                    return (
                        event?.published &&
                        (eventDate.isAfter(now) || eventDate.isSame(now, 'day'))
                    );
                case 'past':
                    // Đã diễn ra
                    return eventDate.isBefore(now);
                case 'pending':
                    // Chưa được duyệt (Bản nháp hoặc chờ duyệt)
                    return !event?.published;
                default:
                    return true;
            }
        });
    }, [events, searchText, activeTab]);

    // 3. Xử lý Xóa (Dùng Antd Message)
    const handleDelete = async id => {
        try {
            await callDeleteEvent(id);
            message.success('Xóa sự kiện thành công!');
            fetchEvents(); // Reload lại list
        } catch (error) {
            console.error('Xóa thất bại:', error);
            message.error('Xóa thất bại, vui lòng thử lại.');
        }
    };

    // 4. Cấu hình Cột cho Table Ant Design
    const columns = [
        {
            title: 'Hình ảnh',
            dataIndex: 'poster',
            key: 'poster',
            width: 100,
            render: url => (
                <img
                    src={url || 'https://via.placeholder.com/150'}
                    alt='Event'
                    style={{
                        width: '80px',
                        height: '45px',
                        objectFit: 'cover',
                        borderRadius: 4
                    }}
                />
            )
        },
        {
            title: 'Tên sự kiện',
            dataIndex: 'name',
            key: 'name',
            render: text => (
                <span style={{ fontWeight: 600, color: '#fff' }}>{text}</span>
            )
        },
        {
            title: 'Thời gian & Địa điểm',
            key: 'info',
            render: (_, record) => (
                <Space direction='vertical' size={0}>
                    <span style={{ fontSize: 13, color: '#2dc275' }}>
                        <CalendarOutlined />{' '}
                        {dayjs(record.startDate).format('HH:mm DD/MM/YYYY')}
                    </span>
                    <span style={{ fontSize: 13, color: '#9ca6b0' }}>
                        <EnvironmentOutlined />{' '}
                        {record.location || 'Chưa cập nhật'}
                    </span>
                </Space>
            )
        },
        {
            title: 'Trạng thái',
            key: 'status',
            render: (_, record) => {
                let color = record.published ? 'green' : 'orange';
                let label = record.published ? 'Đang bán' : 'Chờ duyệt / Nháp';

                // Logic hiển thị status dựa trên Tab hiện tại để rõ nghĩa hơn
                if (activeTab === 'past') {
                    color = 'gray';
                    label = 'Đã kết thúc';
                }

                return <Tag color={color}>{label}</Tag>;
            }
        },
        {
            title: 'Hành động',
            key: 'action',
            width: 150,
            render: (_, record) => (
                <Space size='small'>
                    <Tooltip title='Xem chi tiết'>
                        <Button
                            type='text'
                            icon={<EyeOutlined style={{ color: '#2dc275' }} />}
                            onClick={() =>
                                navigate(`/organizer/events/${record.id}`)
                            }
                        />
                    </Tooltip>
                    <Tooltip title='Chỉnh sửa'>
                        <Button
                            type='text'
                            icon={<EditOutlined style={{ color: '#1890ff' }} />}
                            onClick={() =>
                                navigate(`/organizer/events/edit/${record.id}`)
                            }
                        />
                    </Tooltip>
                    <Tooltip title='Xóa'>
                        <Popconfirm
                            title='Xóa sự kiện?'
                            description='Hành động này không thể hoàn tác.'
                            onConfirm={() => handleDelete(record.id)}
                            okText='Xóa'
                            cancelText='Hủy'
                        >
                            <Button
                                type='text'
                                danger
                                icon={<DeleteOutlined />}
                            />
                        </Popconfirm>
                    </Tooltip>
                </Space>
            )
        }
    ];

    // Cấu hình Tabs
    const tabItems = [
        { key: 'upcoming', label: `Sắp diễn ra` },
        { key: 'pending', label: `Chờ duyệt` },
        { key: 'past', label: `Đã kết thúc` }
    ];

    return (
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
            {/* Header Area */}
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 24
                }}
            >
                <Title level={3} style={{ color: '#fff', margin: 0 }}>
                    Quản lý sự kiện
                </Title>
            </div>

            <Card
                bordered={false}
                style={{
                    borderRadius: 8,
                    background: '#2a2d34',
                    minHeight: '80vh'
                }}
                bodyStyle={{ padding: '0 24px 24px 24px' }}
            >
                {/* Tabs & Search Area */}
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    items={tabItems}
                    tabBarStyle={{
                        borderBottom: '1px solid #393f4e',
                        marginBottom: 24
                    }}
                    tabBarExtraContent={
                        <Input
                            placeholder='Tìm kiếm sự kiện...'
                            prefix={
                                <SearchOutlined style={{ color: '#bfbfbf' }} />
                            }
                            onChange={e => setSearchText(e.target.value)}
                            style={{ width: 300 }}
                            allowClear
                        />
                    }
                />

                {/* Data Table */}
                <Table
                    columns={columns}
                    dataSource={filteredEvents}
                    rowKey='id'
                    loading={loading}
                    pagination={{ pageSize: 8, showSizeChanger: false }}
                    locale={{
                        emptyText: 'Không tìm thấy sự kiện nào trong mục này'
                    }}
                />
            </Card>
        </div>
    );
};

export default EventManagement;
