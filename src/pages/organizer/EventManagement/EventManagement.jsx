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
    App
} from 'antd';
import {
    SearchOutlined,
    CalendarOutlined,
    EnvironmentOutlined,
    DashboardOutlined,
    TeamOutlined,
    FileTextOutlined,
    PauseCircleOutlined,
    PlayCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { eventApi } from '@apis/eventApi';
import { getEventImageUrl } from '@utils/imageHelper';

const { Title, Text } = Typography;

// Component hiển thị ảnh sự kiện với fallback
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
            onError={() => setImgSrc(FALLBACK)}
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
    const { message } = App.useApp();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [activeTab, setActiveTab] = useState('upcoming');
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    const fetchEvents = useCallback(async () => {
        setLoading(true);
        try {
            // Sửa lỗi 1: Tăng size để lấy được nhiều dữ liệu hơn (hoặc dùng pagination thực tế)
            // Ở đây tôi tạm thời lấy 100 để bạn thấy được các sự kiện cũ
            const response = await eventApi.getAll({
                size: 100,
                sort: 'id,desc'
            });
            const rawData = response?.data?.result || response?.result || [];

            const mappedData = (Array.isArray(rawData) ? rawData : []).map(
                e => {
                    // Sửa lỗi 3: Dùng đúng field từ BE DTO
                    const isPublishedInDB = e.published; // BE trả về field 'published'
                    const isActive = e.active; // BE trả về field 'active'

                    const fullStartTime = e.startDate
                        ? `${e.startDate} ${e.startTime}`
                        : null;
                    const fullEndTime = e.endDate
                        ? `${e.endDate} ${e.endTime}`
                        : null;

                    const now = dayjs();
                    const startDay = dayjs(fullStartTime);
                    const endDay = fullEndTime ? dayjs(fullEndTime) : startDay;

                    let derivedStatus = 'PENDING';

                    // Sửa lỗi 2: Khớp logic với BE
                    // Nếu thời gian hiện tại đã vượt quá thời gian kết thúc -> PAST
                    if (endDay.isBefore(now)) {
                        derivedStatus = 'PAST';
                    }
                    // Nếu sự kiện đã bắt đầu nhưng chưa kết thúc (BE đã set published = false)
                    else if (startDay.isBefore(now) && now.isBefore(endDay)) {
                        derivedStatus = 'PAST'; // Hoặc bạn có thể thêm status 'ONGOING'
                    } else {
                        // Logic cho các sự kiện tương lai
                        if (isPublishedInDB && isActive) {
                            derivedStatus = 'OPEN';
                        } else if (isPublishedInDB && !isActive) {
                            derivedStatus = 'UPCOMING';
                        } else {
                            derivedStatus = 'PENDING';
                        }
                    }

                    return {
                        ...e,
                        posterUrl: getEventImageUrl(e.id, e.images?.[0]?.url),
                        fullStartTime,
                        fullEndTime,
                        isPublished: isPublishedInDB,
                        isActive,
                        derivedStatus
                    };
                }
            );

            // Sắp xếp: Ưu tiên sự kiện mới nhất lên đầu
            mappedData.sort(
                (a, b) =>
                    dayjs(b.fullStartTime).unix() -
                    dayjs(a.fullStartTime).unix()
            );
            setEvents(mappedData);
        } catch (error) {
            console.error('Fetch Error:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    const handleToggleActive = async id => {
        try {
            await eventApi.toggleActive(id);
            message.success('Cập nhật trạng thái mở bán thành công');
            fetchEvents();
        } catch (error) {
            message.error('Lỗi khi thao tác mở bán');
        }
    };

    const filteredEvents = useMemo(() => {
        let result = [...events];
        if (searchText) {
            const lowerSearch = searchText.toLowerCase();
            result = result.filter(e =>
                e.name?.toLowerCase().includes(lowerSearch)
            );
        }

        switch (activeTab) {
            case 'upcoming':
                result = result.filter(
                    e =>
                        e.derivedStatus === 'OPEN' ||
                        e.derivedStatus === 'UPCOMING'
                );
                break;
            case 'pending':
                result = result.filter(e => e.derivedStatus === 'PENDING');
                break;
            case 'past':
                result = result.filter(e => e.derivedStatus === 'PAST');
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
                        Đang tải...
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
                        const statusConfig = {
                            PENDING: { color: 'default', text: 'CHỜ DUYỆT' },
                            UPCOMING: {
                                color: 'processing',
                                text: 'SẮP MỞ BÁN'
                            },
                            OPEN: { color: 'success', text: 'ĐANG MỞ BÁN' },
                            PAST: { color: 'orange', text: 'ĐÃ DIỄN RA' }
                        };
                        const config = statusConfig[event.derivedStatus] || {
                            color: 'default',
                            text: 'KHÁC'
                        };

                        return (
                            <Col xs={24} lg={12} key={event.id}>
                                <div
                                    className='event-card-hover'
                                    style={styles.card}
                                >
                                    <div
                                        style={{
                                            display: 'flex',
                                            height: '185px'
                                        }}
                                    >
                                        <div
                                            style={{
                                                width: '250px',
                                                flexShrink: 0,
                                                position: 'relative'
                                            }}
                                        >
                                            <EventImage
                                                src={event.posterUrl}
                                                alt={event.name}
                                                eventId={event.id}
                                            />
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
                                                        fontSize: '16px'
                                                    }}
                                                    ellipsis={{ rows: 2 }}
                                                >
                                                    {event.name}
                                                </Title>
                                                <div
                                                    style={{ fontSize: '12px' }}
                                                >
                                                    <div
                                                        style={{
                                                            color: '#2dc275'
                                                        }}
                                                    >
                                                        <CalendarOutlined
                                                            style={{
                                                                marginRight: 6
                                                            }}
                                                        />
                                                        <strong>BĐ:</strong>{' '}
                                                        {dayjs(
                                                            event.fullStartTime
                                                        ).format(
                                                            'HH:mm DD/MM/YYYY'
                                                        )}
                                                    </div>
                                                    <div
                                                        style={{
                                                            color: '#ffc107',
                                                            marginTop: '4px'
                                                        }}
                                                    >
                                                        <CalendarOutlined
                                                            style={{
                                                                marginRight: 6
                                                            }}
                                                        />
                                                        <strong>KT:</strong>{' '}
                                                        {event.fullEndTime
                                                            ? dayjs(
                                                                  event.fullEndTime
                                                              ).format(
                                                                  'HH:mm DD/MM/YYYY'
                                                              )
                                                            : '--'}
                                                    </div>
                                                    <div
                                                        style={{
                                                            color: '#9ca6b0',
                                                            marginTop: '4px'
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
                                                </div>
                                            </div>
                                            <div>
                                                <Tag color={config.color}>
                                                    {config.text}
                                                </Tag>
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
                                            onClick={() =>
                                                navigate(
                                                    `/organizer/events/${event.id}/summary`
                                                )
                                            }
                                        >
                                            <DashboardOutlined />
                                            <span>Tổng quan</span>
                                        </button>

                                        {event.isPublished &&
                                            event.derivedStatus !== 'PAST' && (
                                                <button
                                                    style={{
                                                        ...styles.actionButton,
                                                        color: event.isActive
                                                            ? '#ff4d4f'
                                                            : '#2dc275',
                                                        fontWeight: 'bold'
                                                    }}
                                                    className='action-btn'
                                                    onClick={() =>
                                                        handleToggleActive(
                                                            event.id
                                                        )
                                                    }
                                                >
                                                    {event.isActive ? (
                                                        <PauseCircleOutlined />
                                                    ) : (
                                                        <PlayCircleOutlined />
                                                    )}
                                                    <span>
                                                        {event.isActive
                                                            ? 'Dừng bán'
                                                            : 'Mở bán vé'}
                                                    </span>
                                                </button>
                                            )}

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
                                            onClick={() =>
                                                navigate(
                                                    `/organizer/orders?eventId=${event.id}`
                                                )
                                            }
                                        >
                                            <FileTextOutlined />
                                            <span>Đơn hàng</span>
                                        </button>
                                    </div>
                                </div>
                            </Col>
                        );
                    })
                )}
            </Row>

            <div
                style={{
                    marginTop: '32px',
                    display: 'flex',
                    justifyContent: 'flex-end'
                }}
            >
                <Pagination
                    current={currentPage}
                    onChange={setCurrentPage}
                    total={filteredEvents.length}
                    pageSize={pageSize}
                    showSizeChanger={false}
                />
            </div>

            <style>{`
                .event-card-hover:hover { box-shadow: 0 0 15px rgba(45, 194, 117, 0.2) !important; border-color: #2dc275 !important; transform: translateY(-3px); transition: all 0.3s; }
                .action-btn:hover { color: #fff !important; background: rgba(255,255,255,0.05) !important; }
                .text-ellipsis-1 { display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }
            `}</style>
        </div>
    );
};

export default EventManagement;
