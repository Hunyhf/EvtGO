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
    PlusOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

import { eventApi } from '@apis/eventApi';

const { Title } = Typography;

// 1. KHAI BÁO URL BACKEND ĐỂ LẤY FILE
// Thay đổi port nếu server của bạn chạy port khác
const BASE_URL_IMAGE = 'http://localhost:8080/api/v1/files';

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

const EventManagement = () => {
    const navigate = useNavigate();

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
            const response = await eventApi.getAll();

            // Lấy data từ response (giả sử cấu trúc RestResponse)
            const rawData =
                response?.content || response?.result || response?.data || [];

            // BIẾN ĐỔI DỮ LIỆU ĐỂ HIỂN THỊ ĐÚNG ẢNH VÀ ĐỊA CHỈ
            const mappedData = (Array.isArray(rawData) ? rawData : []).map(
                e => {
                    // TÌM ẢNH BÌA (isPoster = true trong code FE hoặc coverIndex trong BE)
                    const posterObj =
                        e.images?.find(img => img.isPoster === true) ||
                        e.images?.[0];

                    // GHÉP URL: Nếu có tên file thì ghép với domain server, nếu không dùng placeholder
                    const posterUrl = posterObj?.url
                        ? `${BASE_URL_IMAGE}/${posterObj.url}`
                        : 'https://placehold.co/300x400?text=No+Image';

                    return {
                        ...e,
                        posterUrl, // Gán URL đã ghép vào đây
                        status: e.isPublished ? 'PUBLISHED' : 'PENDING'
                    };
                }
            );

            setEvents(mappedData);
        } catch (error) {
            console.error('>>> [EventManagement] Lỗi tải danh sách:', error);
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

        if (searchText) {
            const lowerSearch = searchText.toLowerCase();
            result = result.filter(
                e =>
                    (e.name && e.name.toLowerCase().includes(lowerSearch)) ||
                    (e.location &&
                        e.location.toLowerCase().includes(lowerSearch)) // SỬA: locationName -> location
            );
        }

        switch (activeTab) {
            case 'upcoming':
                result = result.filter(
                    e =>
                        e.status === 'PUBLISHED' &&
                        dayjs(e.startDate).isAfter(now)
                );
                break;
            case 'past':
                result = result.filter(e =>
                    dayjs(e.endDate || e.startDate).isBefore(now)
                );
                break;
            case 'pending':
                result = result.filter(
                    e => e.status === 'PENDING' || !e.status
                );
                break;
            default:
                break;
        }

        return result;
    }, [events, searchText, activeTab]);

    const currentData = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredEvents.slice(start, start + pageSize);
    }, [filteredEvents, currentPage]);

    return (
        <div style={styles.container}>
            {/* TOP BAR */}
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
                            padding: '10px 20px',
                            maxWidth: '400px'
                        }}
                        onChange={e => setSearchText(e.target.value)}
                    />
                    <Button
                        type='primary'
                        shape='round'
                        size='large'
                        onClick={fetchEvents}
                        style={{
                            background: '#2dc275',
                            borderColor: '#2dc275'
                        }}
                    >
                        Làm mới
                    </Button>
                    <Button
                        type='dashed'
                        shape='round'
                        size='large'
                        icon={<PlusOutlined />}
                        onClick={() => navigate('/organizer/create-event')}
                        style={{ color: '#2dc275', borderColor: '#2dc275' }}
                    >
                        Tạo sự kiện
                    </Button>
                </div>

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

            {/* LIST */}
            <Row gutter={[24, 24]}>
                {loading ? (
                    <div
                        style={{
                            color: '#fff',
                            textAlign: 'center',
                            width: '100%'
                        }}
                    >
                        Đang tải...
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
                                    {/* Thumbnail: Hiển thị posterUrl đã được ghép ở trên */}
                                    <div
                                        style={{
                                            width: '180px',
                                            flexShrink: 0,
                                            position: 'relative'
                                        }}
                                    >
                                        <img
                                            src={event.posterUrl}
                                            alt={event.name}
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover'
                                            }}
                                            onError={e => {
                                                e.target.onerror = null;
                                                e.target.src =
                                                    'https://placehold.co/300x400?text=Error+Image';
                                            }}
                                        />
                                    </div>

                                    {/* Info */}
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
                                                    margin: '0 0 8px 0'
                                                }}
                                                ellipsis={{ rows: 2 }}
                                            >
                                                {event.name}
                                            </Title>
                                            <Space
                                                direction='vertical'
                                                size={4}
                                            >
                                                <div
                                                    style={{ color: '#2dc275' }}
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
                                                    style={{ color: '#9ca6b0' }}
                                                >
                                                    <EnvironmentOutlined
                                                        style={{
                                                            marginRight: 8
                                                        }}
                                                    />
                                                    {/* SỬA: Hiển thị trường location từ BE */}
                                                    {event.location ||
                                                        'Địa chỉ đang cập nhật'}
                                                </div>
                                            </Space>
                                        </div>
                                        <div style={{ marginTop: '8px' }}>
                                            {event.status === 'PUBLISHED' ? (
                                                <Tag color='success'>
                                                    Đang bán
                                                </Tag>
                                            ) : (
                                                <Tag color='warning'>
                                                    Chờ duyệt
                                                </Tag>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div
                                    style={{
                                        display: 'flex',
                                        borderTop: '1px solid #2a2a2a',
                                        background: '#1a1a1a',
                                        padding: '8px 0'
                                    }}
                                >
                                    <button style={styles.actionButton}>
                                        <DashboardOutlined />
                                        <span>Tổng quan</span>
                                    </button>
                                    <button style={styles.actionButton}>
                                        <TeamOutlined />
                                        <span>Thành viên</span>
                                    </button>
                                    <button style={styles.actionButton}>
                                        <FileTextOutlined />
                                        <span>Đơn hàng</span>
                                    </button>
                                    <button
                                        style={{
                                            ...styles.actionButton,
                                            color: '#2dc275'
                                        }}
                                        onClick={() =>
                                            navigate(
                                                `/organizer/events/edit/${event.id}`
                                            )
                                        }
                                    >
                                        <EditOutlined />
                                        <span>Chỉnh sửa</span>
                                    </button>
                                </div>
                            </div>
                        </Col>
                    ))
                )}
            </Row>

            <div style={{ marginTop: '40px', textAlign: 'right' }}>
                <Pagination
                    current={currentPage}
                    onChange={setCurrentPage}
                    total={filteredEvents.length}
                    pageSize={pageSize}
                    showSizeChanger={false}
                />
            </div>

            <style>{`
                .event-card-hover:hover {
                    box-shadow: 0 0 20px rgba(45, 194, 117, 0.3) !important;
                    border-color: #2dc275 !important;
                    transform: translateY(-5px);
                }
            `}</style>
        </div>
    );
};

export default EventManagement;
