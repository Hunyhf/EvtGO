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
    PlusOutlined,
    ClockCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

import { eventApi } from '@apis/eventApi';

const { Title } = Typography;

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
    const [activeTab, setActiveTab] = useState('upcoming'); // Mặc định xem sự kiện Sắp tới
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 6;

    // --- FETCH DATA ---
    const fetchEvents = useCallback(async () => {
        setLoading(true);
        try {
            const response = await eventApi.getAll();
            const rawData =
                response?.content || response?.result || response?.data || [];

            const mappedData = (Array.isArray(rawData) ? rawData : []).map(
                e => {
                    const posterObj =
                        e.images?.find(img => img.isCover === true) ||
                        e.images?.[0];
                    const posterUrl = posterObj?.url
                        ? `${BASE_URL_IMAGE}/${posterObj.url}`
                        : 'https://placehold.co/300x400?text=No+Image';

                    // Ghép thời gian đầy đủ để so sánh
                    const fullStartStr = e.startDate
                        ? `${e.startDate} ${e.startTime || '00:00:00'}`
                        : null;

                    return {
                        ...e,
                        posterUrl,
                        fullStartTime: fullStartStr,
                        // Đồng bộ field 'published' từ Backend
                        isApproved: e.published === true
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

    // --- FILTER LOGIC (QUAN TRỌNG) ---
    const filteredEvents = useMemo(() => {
        const now = dayjs();
        let result = events;

        // 1. Lọc theo ô tìm kiếm
        if (searchText) {
            const lowerSearch = searchText.toLowerCase();
            result = result.filter(
                e =>
                    (e.name && e.name.toLowerCase().includes(lowerSearch)) ||
                    (e.location &&
                        e.location.toLowerCase().includes(lowerSearch))
            );
        }

        // 2. Phân loại theo Tab (Giống logic Admin)
        switch (activeTab) {
            case 'upcoming':
                // Đã duyệt VÀ chưa đến giờ tổ chức
                result = result.filter(
                    e => e.isApproved && dayjs(e.fullStartTime).isAfter(now)
                );
                break;
            case 'pending':
                // Chưa duyệt VÀ chưa quá hạn
                result = result.filter(
                    e => !e.isApproved && dayjs(e.fullStartTime).isAfter(now)
                );
                break;
            case 'past':
                // Đã quá giờ tổ chức (Bất kể duyệt hay chưa)
                result = result.filter(e =>
                    dayjs(e.fullStartTime).isBefore(now)
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
                        Đang tải dữ liệu...
                    </div>
                ) : currentData.length === 0 ? (
                    <div
                        style={{
                            color: '#9ca6b0',
                            textAlign: 'center',
                            width: '100%'
                        }}
                    >
                        Không tìm thấy sự kiện nào trong mục này.
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
                                            <img
                                                src={event.posterUrl}
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
                                                    background:
                                                        'rgba(0,0,0,0.6)',
                                                    color: '#fff',
                                                    padding: '4px 8px',
                                                    borderRadius: '4px',
                                                    fontSize: '12px',
                                                    fontWeight: 'bold'
                                                }}
                                            >
                                                {event.genreName || 'Sự kiện'}
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
                                                        fontSize: '18px'
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
                                                            event.fullStartTime
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
                                                        {event.location ||
                                                            'Địa chỉ đang cập nhật'}
                                                    </div>
                                                </Space>
                                            </div>
                                            <div style={{ marginTop: '8px' }}>
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
                                            <EditOutlined
                                                style={{ fontSize: '18px' }}
                                            />
                                            <span>Chỉnh sửa</span>
                                        </button>
                                    </div>
                                </div>
                            </Col>
                        );
                    })
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
                .action-btn:hover {
                    color: #fff !important;
                    background: rgba(255,255,255,0.05) !important;
                }
            `}</style>
        </div>
    );
};

export default EventManagement;
