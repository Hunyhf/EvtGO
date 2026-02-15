import React, { useState, useEffect, useMemo } from 'react';
import { callFetchAllEvents, callDeleteEvent } from '@apis/eventApi';
import {
    SearchOutlined,
    CalendarOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import styles from './EventManagement.module.scss';
import dayjs from 'dayjs';

const EventManagement = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('upcoming'); // upcoming, past, pending
    const navigate = useNavigate();

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const response = await callFetchAllEvents();
            const data = response?.data?.content || response?.data || [];
            setEvents(data);
        } catch (error) {
            console.error('Lỗi khi lấy danh sách sự kiện:', error);
        } finally {
            setLoading(false);
        }
    };

    // Logic phân loại và tìm kiếm
    const filteredEvents = useMemo(() => {
        const now = dayjs();

        return events.filter(event => {
            const matchSearch = event.name
                .toLowerCase()
                .includes(searchTerm.toLowerCase());
            if (!matchSearch) return false;

            const eventDate = dayjs(event.startDate);

            switch (activeTab) {
                case 'upcoming':
                    return event.published && eventDate.isAfter(now);
                case 'past':
                    return eventDate.isBefore(now);
                case 'pending':
                    return !event.published;
                default:
                    return true;
            }
        });
    }, [events, searchTerm, activeTab]);

    const handleDelete = async id => {
        if (window.confirm('Bạn có chắc chắn muốn xóa sự kiện này?')) {
            try {
                await callDeleteEvent(id);
                fetchEvents();
            } catch (error) {
                console.error('Xóa thất bại:', error);
            }
        }
    };

    return (
        <div className={styles.container}>
            {/* Top Bar: Tìm kiếm và Phân loại */}
            <div className={styles.topBar}>
                <div className={styles.searchWrapper}>
                    <SearchOutlined className={styles.searchIcon} />
                    <input
                        type='text'
                        placeholder='Tìm kiếm sự kiện của bạn...'
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className={styles.tabGroup}>
                    <button
                        className={
                            activeTab === 'upcoming' ? styles.activeTab : ''
                        }
                        onClick={() => setActiveTab('upcoming')}
                    >
                        Sự kiện sắp tới
                    </button>
                    <button
                        className={activeTab === 'past' ? styles.activeTab : ''}
                        onClick={() => setActiveTab('past')}
                    >
                        Sự kiện đã qua
                    </button>
                    <button
                        className={
                            activeTab === 'pending' ? styles.activeTab : ''
                        }
                        onClick={() => setActiveTab('pending')}
                    >
                        Chờ duyệt
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className={styles.content}>
                <div className={styles.headerTitle}>
                    <h3>
                        {activeTab === 'upcoming'
                            ? 'Sắp diễn ra'
                            : activeTab === 'past'
                              ? 'Đã kết thúc'
                              : 'Đang chờ hệ thống duyệt'}{' '}
                        ({filteredEvents.length})
                    </h3>
                    {/* Nút tạo sự kiện đã được gỡ bỏ khỏi đây */}
                </div>

                {loading ? (
                    <div className={styles.loading}>Đang tải...</div>
                ) : (
                    <div className={styles.eventGrid}>
                        {filteredEvents.map(event => (
                            <div key={event.id} className={styles.eventCard}>
                                <div className={styles.eventInfo}>
                                    <h4>{event.name}</h4>
                                    <p>
                                        <CalendarOutlined />{' '}
                                        {dayjs(event.startDate).format(
                                            'DD/MM/YYYY HH:mm'
                                        )}
                                    </p>
                                    <p className={styles.location}>
                                        {event.location}
                                    </p>
                                </div>
                                <div className={styles.eventActions}>
                                    <button
                                        onClick={() =>
                                            navigate(
                                                `/organizer/edit/${event.id}`
                                            )
                                        }
                                    >
                                        Sửa
                                    </button>
                                    <button
                                        className={styles.delBtn}
                                        onClick={() => handleDelete(event.id)}
                                    >
                                        Xóa
                                    </button>
                                </div>
                            </div>
                        ))}
                        {filteredEvents.length === 0 && (
                            <div className={styles.empty}>
                                Không tìm thấy sự kiện nào trong mục này.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default EventManagement;
