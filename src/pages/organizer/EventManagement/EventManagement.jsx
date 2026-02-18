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
    Pagination
} from 'antd';
import {
    SearchOutlined,
    EditOutlined,
    CalendarOutlined,
    EnvironmentOutlined,
    DashboardOutlined,
    TeamOutlined,
    FileTextOutlined,
    PlusOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { eventApi } from '@apis/eventApi';

const { Title } = Typography;

// Base URL từ môi trường, FE giao tiếp qua API Endpoint
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

/**
 * 🟢 SMART COMPONENT: EventImage
 * Xử lý hiển thị ảnh và tự động đổi ảnh fallback nếu xảy ra lỗi 404/500
 */
const EventImage = ({ src, alt, eventId }) => {
    const FALLBACK = 'https://placehold.co/300x400?text=No+Image';
    const [imgSrc, setImgSrc] = useState(src);

    useEffect(() => {
        setImgSrc(src);
    }, [src]);

    return (
        <img
            src={imgSrc || FALLBACK}
            alt={alt || 'Event image'}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={() => {
                console.warn(
                    `>>> [EventImage] Lỗi tải ảnh Event ID: ${eventId}`
                );
                setImgSrc(FALLBACK);
            }}
            loading='lazy'
        />
    );
};

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
    const [activeTab, setActiveTab] = useState('upcoming');
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 6;

    /**
     * 🛠 Helper: Ghép URL ảnh theo cấu trúc 3 tham số mới
     * URL mong muốn: /api/v1/files/events/{eventId}/{fileName}
     */
    const getFirstImagePoster = (images, eventId) => {
        const firstImage = images?.[0];
        if (!firstImage?.url) return null;

        // Nếu là URL tuyệt đối dùng luôn
        if (firstImage.url.startsWith('http')) return firstImage.url;

        // ✅ KHÔNG DÙNG encodeURIComponent. Để dấu "/" tự nhiên cho 3 tham số PathVariable.
        return `${API_URL}/api/v1/files/events/${eventId}/${firstImage.url}`;
    };

    /**
     * Fetch và chuẩn hóa dữ liệu
     */
    const fetchEvents = useCallback(async () => {
        setLoading(true);
        try {
            const response = await eventApi.getAll();
            const rawData = response?.data?.result || response?.result || [];

            const mappedData = (Array.isArray(rawData) ? rawData : []).map(
                e => ({
                    ...e,
                    // Tạo URL ảnh chuẩn cho từng Event
                    posterUrl: getFirstImagePoster(e.images, e.id),
                    fullStartTime: e.startDate
                        ? `${e.startDate} ${e.startTime || '00:00:00'}`
                        : null,
                    isApproved: e.published === true
                })
            );

            setEvents(mappedData);
        } catch (error) {
            console.error('>>> [EventManagement] Fetch Error:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    /**
     * Lọc danh sách (Performance: useMemo)
     */
    const filteredEvents = useMemo(() => {
        const now = dayjs();
        let result = events;

        if (searchText) {
            const lowerSearch = searchText.toLowerCase();
            result = result.filter(
                e =>
                    e.name?.toLowerCase().includes(lowerSearch) ||
                    e.location?.toLowerCase().includes(lowerSearch)
            );
        }

        switch (activeTab) {
            case 'upcoming':
                return result.filter(
                    e => e.isApproved && dayjs(e.fullStartTime).isAfter(now)
                );
            case 'pending':
                return result.filter(
                    e => !e.isApproved && dayjs(e.fullStartTime).isAfter(now)
                );
            case 'past':
                return result.filter(e => dayjs(e.fullStartTime).isBefore(now));
            default:
                return result;
        }
    }, [events, searchText, activeTab]);

    const currentData = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredEvents.slice(start, start + pageSize);
    }, [filteredEvents, currentPage]);

    return (
        <div style={styles.container}>
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
                            maxWidth: '400px',
                            border: 'none'
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
                            borderColor: '#2dc275',
                            fontWeight: 600
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
                        style={{
                            color: '#2dc275',
                            borderColor: '#2dc275',
                            background: 'transparent',
                            fontWeight: 600
                        }}
                    >
                        Tạo sự kiện
                    </Button>
                </div>

                <Space size={12} wrap>
                    {[
                        { key: 'upcoming', label: 'Sắp tới' },
                        { key: 'pending', label: 'Chờ duyệt' },
                        { key: 'past', label: 'Đã qua' }
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

            <Row gutter={[24, 24]}>
                {loading ? (
                    <div
                        style={{
                            color: '#fff',
                            textAlign: 'center',
                            width: '100%',
                            padding: '40px'
                        }}
                    >
                        Đang tải dữ liệu...
                    </div>
                ) : currentData.length === 0 ? (
                    <div
                        style={{
                            color: '#9ca6b0',
                            textAlign: 'center',
                            width: '100%',
                            padding: '40px'
                        }}
                    >
                        Không có dữ liệu phù hợp.
                    </div>
                ) : (
                    currentData.map(event => {
                        const isPast = dayjs(event.fullStartTime).isBefore(
                            dayjs()
                        );
                        return (
                            <Col xs={24} lg={12} key={event.id}>
                                <div
                                    className='event-card-hover'
                                    style={styles.card}
                                >
                                    <div
                                        style={{
                                            display: 'flex',
                                            height: '180px'
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: '180px',
                                                flexShrink: 0,
                                                position: 'relative'
                                            }}
                                        >
                                            {/* ✅ Hiển thị ảnh thông qua Smart Component */}
                                            <EventImage
                                                src={event.posterUrl}
                                                alt={event.name}
                                                eventId={event.id}
                                            />
                                            <div
                                                style={{
                                                    position: 'absolute',
                                                    top: 10,
                                                    left: 10,
                                                    background:
                                                        'rgba(0,0,0,0.6)',
                                                    color: '#fff',
                                                    padding: '4px 8px',
                                                    borderRadius: '4px',
                                                    fontSize: '11px',
                                                    fontWeight: 'bold'
                                                }}
                                            >
                                                {event.genreName || 'SỰ KIỆN'}
                                            </div>
                                        </div>

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
                                                        fontSize: '17px'
                                                    }}
                                                    ellipsis={{ rows: 2 }}
                                                >
                                                    {event.name}
                                                </Title>
                                                {/* Fix Warning: dùng orientation thay cho direction nếu antd yêu cầu */}
                                                <Space
                                                    direction='vertical'
                                                    size={2}
                                                    style={{ display: 'flex' }}
                                                >
                                                    <div
                                                        style={{
                                                            color: '#2dc275',
                                                            fontSize: '13px'
                                                        }}
                                                    >
                                                        <CalendarOutlined
                                                            style={{
                                                                marginRight: 6
                                                            }}
                                                        />
                                                        {dayjs(
                                                            event.fullStartTime
                                                        ).format(
                                                            'HH:mm - DD/MM/YYYY'
                                                        )}
                                                    </div>
                                                    <div
                                                        style={{
                                                            color: '#9ca6b0',
                                                            fontSize: '12px'
                                                        }}
                                                        className='text-ellipsis-1'
                                                    >
                                                        <EnvironmentOutlined
                                                            style={{
                                                                marginRight: 6
                                                            }}
                                                        />
                                                        {event.location}
                                                    </div>
                                                </Space>
                                            </div>
                                            <div>
                                                {isPast ? (
                                                    <Tag color='default'>
                                                        Đã qua
                                                    </Tag>
                                                ) : event.isApproved ? (
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

                                    <div
                                        style={{
                                            display: 'flex',
                                            borderTop: '1px solid #2a2a2a',
                                            background: '#1a1a1a',
                                            padding: '4px 0'
                                        }}
                                    >
                                        <button
                                            style={styles.actionButton}
                                            className='action-btn'
                                        >
                                            <DashboardOutlined />
                                            <span>Tổng quan</span>
                                        </button>
                                        <button
                                            style={styles.actionButton}
                                            className='action-btn'
                                        >
                                            <TeamOutlined />
                                            <span>Thành viên</span>
                                        </button>
                                        <button
                                            style={styles.actionButton}
                                            className='action-btn'
                                        >
                                            <FileTextOutlined />
                                            <span>Đơn hàng</span>
                                        </button>
                                        <button
                                            style={{
                                                ...styles.actionButton,
                                                color: '#2dc275'
                                            }}
                                            className='action-btn'
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
                        );
                    })
                )}
            </Row>

            <div style={{ marginTop: '32px', textAlign: 'right' }}>
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
                    box-shadow: 0 0 15px rgba(45, 194, 117, 0.2) !important;
                    border-color: #2dc275 !important;
                    transform: translateY(-3px);
                    transition: all 0.3s;
                }
                .action-btn:hover { color: #fff !important; background: rgba(255,255,255,0.05) !important; }
                .text-ellipsis-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
            `}</style>
        </div>
    );
};

export default EventManagement;
