// src/pages/organizer/EventManagement/EventManagement.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Input,
    Button,
    Tag,
    Space,
    Typography,
    Row,
    Col,
    Pagination,
    Alert
} from 'antd';
import {
    SearchOutlined,
    EditOutlined,
    CalendarOutlined,
    EnvironmentOutlined,
    DashboardOutlined,
    TeamOutlined,
    FileTextOutlined,
    AppstoreOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

// Import API
import { callFetchAllEvents } from '@apis/eventApi';

const { Title, Text } = Typography;

const EventManagement = () => {
    const navigate = useNavigate();

    // --- STATE ---
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [activeTab, setActiveTab] = useState('pending');
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 6;

    // --- FETCH DATA ---
    const fetchEvents = useCallback(async () => {
        setLoading(true);
        try {
            const response = await callFetchAllEvents();
            const data =
                response?.content || response?.result || response || [];
            setEvents(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Lỗi tải danh sách:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    // --- FILTER LOGIC ---
    const filteredEvents = useMemo(() => {
        const now = dayjs();
        let result = events;

        // 1. Filter theo Search
        if (searchText) {
            const lowerSearch = searchText.toLowerCase();
            result = result.filter(
                e =>
                    (e.name && e.name.toLowerCase().includes(lowerSearch)) ||
                    (e.locationName &&
                        e.locationName.toLowerCase().includes(lowerSearch))
            );
        }

        // 2. Filter theo Tab (Đã xóa case 'draft')
        switch (activeTab) {
            case 'upcoming': // Sắp tới
                result = result.filter(
                    e =>
                        e.status === 'PUBLISHED' &&
                        dayjs(e.startDate).isAfter(now)
                );
                break;
            case 'past': // Đã qua
                result = result.filter(e =>
                    dayjs(e.endDate || e.startDate).isBefore(now)
                );
                break;
            case 'pending': // Chờ duyệt
                result = result.filter(
                    e => e.status === 'PENDING' || !e.status
                );
                break;
            default:
                break;
        }

        return result;
    }, [events, searchText, activeTab]);

    // --- PAGINATION DATA ---
    const currentData = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredEvents.slice(start, start + pageSize);
    }, [filteredEvents, currentPage]);

    // --- STYLES ---
    const styles = {
        container: {
            minHeight: '100vh',
            background:
                'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #0f2e1f 100%)',
            padding: '24px 40px',
            borderRadius: '12px'
        },
        searchContainer: {
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '32px',
            flexWrap: 'wrap',
            gap: '16px'
        },
        pillTab: isActive => ({
            padding: '8px 24px',
            borderRadius: '50px',
            cursor: 'pointer',
            fontWeight: 600,
            fontSize: '14px',
            transition: 'all 0.3s',
            background: isActive ? '#2dc275' : 'rgba(255,255,255,0.1)',
            color: isActive ? '#fff' : '#9ca6b0',
            border: isActive ? 'none' : '1px solid #393f4e',
            display: 'inline-block'
        }),
        card: {
            background: '#1f1f1f',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            border: '1px solid #2a2a2a',
            transition: 'transform 0.2s, box-shadow 0.2s',
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
        },
        actionButton: {
            color: '#9ca6b0',
            fontSize: '13px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer',
            background: 'transparent',
            border: 'none',
            padding: '8px 4px',
            flex: 1,
            transition: 'color 0.3s'
        }
    };

    return (
        <div style={styles.container}>
            {/* 1. TOP BAR */}
            <div style={styles.searchContainer}>
                <div
                    style={{
                        display: 'flex',
                        gap: '12px',
                        flex: 1,
                        minWidth: '300px'
                    }}
                >
                    <Input
                        placeholder='Tìm kiếm sự kiện...'
                        prefix={<SearchOutlined style={{ color: '#2dc275' }} />}
                        style={{
                            borderRadius: '50px',
                            background: '#fff',
                            border: 'none',
                            padding: '10px 20px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            maxWidth: '400px'
                        }}
                        onChange={e => setSearchText(e.target.value)}
                    />
                    <Button
                        type='primary'
                        shape='round'
                        size='large'
                        style={{
                            background: '#2dc275',
                            borderColor: '#2dc275',
                            fontWeight: 600
                        }}
                    >
                        Tìm kiếm
                    </Button>
                </div>

                {/* STATUS TABS (Đã xóa Nháp) */}
                <Space size={12} wrap>
                    {[
                        { key: 'upcoming', label: 'Sắp tới' },
                        { key: 'past', label: 'Đã qua' },
                        { key: 'pending', label: 'Chờ duyệt' }
                    ].map(tab => (
                        <div
                            key={tab.key}
                            style={styles.pillTab(activeTab === tab.key)}
                            onClick={() => {
                                setActiveTab(tab.key);
                                setCurrentPage(1);
                            }}
                        >
                            {tab.label}
                        </div>
                    ))}
                </Space>
            </div>

            {/* 2. ALERT BANNER */}
            {activeTab === 'pending' && (
                <Alert
                    message='Sự kiện đang chờ duyệt'
                    description='Các sự kiện dưới đây đang được Admin kiểm duyệt. Bạn sẽ nhận được thông báo qua email khi trạng thái thay đổi. Vui lòng không chỉnh sửa trong quá trình này.'
                    type='warning'
                    showIcon
                    icon={<ExclamationCircleOutlined />}
                    style={{
                        marginBottom: '32px',
                        borderRadius: '8px',
                        background: '#fffbe6',
                        border: '1px solid #ffe58f'
                    }}
                />
            )}

            {/* 3. EVENT CARDS LIST */}
            <Row gutter={[24, 24]}>
                {loading ? (
                    <div style={{ color: '#fff', padding: 20 }}>
                        Đang tải...
                    </div>
                ) : currentData.length === 0 ? (
                    <div
                        style={{
                            color: '#9ca6b0',
                            padding: 20,
                            width: '100%',
                            textAlign: 'center'
                        }}
                    >
                        Không tìm thấy sự kiện nào.
                    </div>
                ) : (
                    currentData.map(event => (
                        <Col xs={24} lg={12} key={event.id}>
                            <div
                                className='event-card-hover'
                                style={styles.card}
                            >
                                <div
                                    style={{ display: 'flex', height: '180px' }}
                                >
                                    {/* Left: Thumbnail */}
                                    <div
                                        style={{
                                            width: '180px',
                                            flexShrink: 0,
                                            position: 'relative'
                                        }}
                                    >
                                        <img
                                            src={
                                                event.poster ||
                                                'https://via.placeholder.com/300x400?text=EvtGO'
                                            }
                                            alt={event.name}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover'
                                            }}
                                        />
                                        <div
                                            style={{
                                                position: 'absolute',
                                                top: 10,
                                                left: 10,
                                                background: 'rgba(0,0,0,0.6)',
                                                color: '#fff',
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                                fontSize: '12px',
                                                fontWeight: 'bold',
                                                backdropFilter: 'blur(4px)'
                                            }}
                                        >
                                            {event.genreName || 'Music'}
                                        </div>
                                    </div>

                                    {/* Right: Info */}
                                    <div
                                        style={{
                                            padding: '16px',
                                            flex: 1,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'space-between'
                                        }}
                                    >
                                        <div>
                                            <Title
                                                level={4}
                                                style={{
                                                    color: '#fff',
                                                    margin: '0 0 8px 0',
                                                    fontSize: '18px'
                                                }}
                                                ellipsis={{ rows: 2 }}
                                            >
                                                {event.name}
                                            </Title>
                                            <Space
                                                direction='vertical'
                                                size={4}
                                                style={{ width: '100%' }}
                                            >
                                                <div
                                                    style={{
                                                        color: '#2dc275',
                                                        fontSize: '14px',
                                                        fontWeight: 500
                                                    }}
                                                >
                                                    <CalendarOutlined
                                                        style={{
                                                            marginRight: 8
                                                        }}
                                                    />
                                                    {dayjs(
                                                        event.startDate
                                                    ).format(
                                                        'HH:mm - DD/MM/YYYY'
                                                    )}
                                                </div>
                                                <div
                                                    style={{
                                                        color: '#9ca6b0',
                                                        fontSize: '13px'
                                                    }}
                                                >
                                                    <EnvironmentOutlined
                                                        style={{
                                                            marginRight: 8
                                                        }}
                                                    />
                                                    {event.locationName ||
                                                        'Chưa cập nhật'}
                                                </div>
                                                <Text
                                                    ellipsis
                                                    style={{
                                                        color: '#666',
                                                        fontSize: '12px',
                                                        paddingLeft: '22px'
                                                    }}
                                                >
                                                    {event.addressDetail ||
                                                        '...'}
                                                </Text>
                                            </Space>
                                        </div>

                                        {/* Status Badge (Đã xóa Draft tag) */}
                                        <div
                                            style={{
                                                alignSelf: 'flex-start',
                                                marginTop: '8px'
                                            }}
                                        >
                                            {event.status === 'PUBLISHED' && (
                                                <Tag color='success'>
                                                    Đang bán
                                                </Tag>
                                            )}
                                            {event.status === 'PENDING' && (
                                                <Tag color='warning'>
                                                    Chờ duyệt
                                                </Tag>
                                            )}
                                            {event.status === 'REJECTED' && (
                                                <Tag color='error'>
                                                    Bị từ chối
                                                </Tag>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* 4. BOTTOM ACTION BAR */}
                                <div
                                    style={{
                                        display: 'flex',
                                        borderTop: '1px solid #2a2a2a',
                                        background: '#1a1a1a',
                                        padding: '8px 0'
                                    }}
                                >
                                    <button
                                        style={styles.actionButton}
                                        className='action-btn'
                                    >
                                        <DashboardOutlined
                                            style={{ fontSize: '18px' }}
                                        />
                                        <span>Tổng quan</span>
                                    </button>
                                    <button
                                        style={styles.actionButton}
                                        className='action-btn'
                                    >
                                        <TeamOutlined
                                            style={{ fontSize: '18px' }}
                                        />
                                        <span>Thành viên</span>
                                    </button>
                                    <button
                                        style={styles.actionButton}
                                        className='action-btn'
                                    >
                                        <FileTextOutlined
                                            style={{ fontSize: '18px' }}
                                        />
                                        <span>Đơn hàng</span>
                                    </button>
                                    <button
                                        style={styles.actionButton}
                                        className='action-btn'
                                    >
                                        <AppstoreOutlined
                                            style={{ fontSize: '18px' }}
                                        />
                                        <span>Sơ đồ ghế</span>
                                    </button>
                                    <button
                                        style={{
                                            ...styles.actionButton,
                                            color: '#2dc275'
                                        }}
                                        className='action-btn'
                                        onClick={() =>
                                            navigate(`/organizer/events/create`)
                                        }
                                    >
                                        <EditOutlined
                                            style={{ fontSize: '18px' }}
                                        />
                                        <span>Chỉnh sửa</span>
                                    </button>
                                </div>
                            </div>
                        </Col>
                    ))
                )}
            </Row>

            {/* 5. PAGINATION */}
            <div style={{ marginTop: '40px', textAlign: 'right' }}>
                <Pagination
                    current={currentPage}
                    onChange={setCurrentPage}
                    total={filteredEvents.length}
                    pageSize={pageSize}
                    showSizeChanger={false}
                    itemRender={(page, type, element) => {
                        if (type === 'page') {
                            return (
                                <a
                                    style={{
                                        color:
                                            page === currentPage
                                                ? '#2dc275'
                                                : '#9ca6b0',
                                        fontWeight:
                                            page === currentPage
                                                ? 'bold'
                                                : 'normal',
                                        background:
                                            page === currentPage
                                                ? 'rgba(45, 194, 117, 0.1)'
                                                : 'transparent',
                                        border:
                                            page === currentPage
                                                ? '1px solid #2dc275'
                                                : '1px solid #393f4e',
                                        borderRadius: '4px'
                                    }}
                                >
                                    {page}
                                </a>
                            );
                        }
                        return element;
                    }}
                />
            </div>

            <style>{`
                .event-card-hover:hover {
                    box-shadow: 0 0 20px rgba(45, 194, 117, 0.3) !important;
                    border-color: #2dc275 !important;
                    transform: translateY(-5px);
                }
                .action-btn:hover {
                    color: #fff !important;
                    background: rgba(255,255,255,0.05) !important;
                }
                .ant-pagination-item-active {
                    border-color: #2dc275;
                }
                .ant-pagination-item-active a {
                    color: #2dc275;
                }
                .ant-pagination-prev .ant-pagination-item-link,
                .ant-pagination-next .ant-pagination-item-link {
                    color: #fff !important;
                    background: transparent !important;
                    border-color: #393f4e !important;
                }
            `}</style>
        </div>
    );
};

export default EventManagement;
