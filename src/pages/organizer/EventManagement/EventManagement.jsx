import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames/bind';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import {
    SearchOutlined,
    CalendarOutlined,
    EditOutlined,
    DeleteOutlined,
    InboxOutlined
} from '@ant-design/icons';

import { callFetchAllEvents, callDeleteEvent } from '@apis/eventApi';
import styles from './EventManagement.module.scss';

const cx = classNames.bind(styles);

const EventManagement = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('upcoming'); // upcoming, past, pending
    const navigate = useNavigate();

    // 1. Tối ưu hàm fetch với useCallback và xử lý dữ liệu unwrapped từ axiosClient
    const fetchEvents = useCallback(async () => {
        setLoading(true);
        try {
            const response = await callFetchAllEvents();
            // axiosClient đã unwrapped data, response thường là mảng hoặc object chứa content
            const data = response?.content || response || [];
            setEvents(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Lỗi khi lấy danh sách sự kiện:', error);
            // axiosClient thường đã có toast lỗi toàn cục, nhưng có thể bổ sung nếu cần
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    // 2. Tối ưu Logic lọc sự kiện với useMemo và kiểm tra an toàn dữ liệu
    const filteredEvents = useMemo(() => {
        const now = dayjs();

        return events.filter(event => {
            const name = event?.name?.toLowerCase() || '';
            const matchSearch = name.includes(searchTerm.toLowerCase());
            if (!matchSearch) return false;

            const eventDate = dayjs(event?.startDate);

            switch (activeTab) {
                case 'upcoming':
                    // Đã duyệt và ngày diễn ra sau hiện tại
                    return event?.published && eventDate.isAfter(now);
                case 'past':
                    // Đã diễn ra
                    return eventDate.isBefore(now);
                case 'pending':
                    // Chưa được duyệt
                    return !event?.published;
                default:
                    return true;
            }
        });
    }, [events, searchTerm, activeTab]);

    const handleDelete = async id => {
        if (window.confirm('Bạn có chắc chắn muốn xóa sự kiện này?')) {
            try {
                await callDeleteEvent(id);
                toast.success('Xóa sự kiện thành công!');
                fetchEvents();
            } catch (error) {
                console.error('Xóa thất bại:', error);
            }
        }
    };

    return (
        <div className={cx('container')}>
            {/* Top Bar: Tìm kiếm và Phân loại */}
            <div className={cx('topBar')}>
                <div className={cx('searchWrapper')}>
                    <SearchOutlined className={cx('searchIcon')} />
                    <input
                        type='text'
                        placeholder='Tìm kiếm sự kiện của bạn...'
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className={cx('tabGroup')}>
                    {['upcoming', 'past', 'pending'].map(tab => (
                        <button
                            key={tab}
                            className={cx({ activeTab: activeTab === tab })}
                            onClick={() => setActiveTab(tab)}
                        >
                            {tab === 'upcoming'
                                ? 'Sự kiện sắp tới'
                                : tab === 'past'
                                  ? 'Sự kiện đã qua'
                                  : 'Chờ duyệt'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className={cx('content')}>
                <div className={cx('headerTitle')}>
                    <h3>
                        {activeTab === 'upcoming'
                            ? 'Sắp diễn ra'
                            : activeTab === 'past'
                              ? 'Đã kết thúc'
                              : 'Đang chờ hệ thống duyệt'}{' '}
                        ({filteredEvents.length})
                    </h3>
                </div>

                {loading ? (
                    <div className={cx('loading')}>Đang tải dữ liệu...</div>
                ) : (
                    <div className={cx('eventGrid')}>
                        {filteredEvents.map(event => (
                            <div key={event.id} className={cx('eventCard')}>
                                <div className={cx('eventInfo')}>
                                    <h4 title={event.name}>{event.name}</h4>
                                    <p>
                                        <CalendarOutlined />{' '}
                                        {dayjs(event.startDate).format(
                                            'DD/MM/YYYY HH:mm'
                                        )}
                                    </p>
                                    <p className={cx('location')}>
                                        {event.location}
                                    </p>
                                </div>
                                <div className={cx('eventActions')}>
                                    <button
                                        onClick={() =>
                                            navigate(
                                                `/organizer/edit/${event.id}`
                                            )
                                        }
                                    >
                                        <EditOutlined /> Sửa
                                    </button>
                                    <button
                                        className={cx('delBtn')}
                                        onClick={() => handleDelete(event.id)}
                                    >
                                        <DeleteOutlined /> Xóa
                                    </button>
                                </div>
                            </div>
                        ))}

                        {!loading && filteredEvents.length === 0 && (
                            <div className={cx('empty')}>
                                <InboxOutlined
                                    style={{ fontSize: 40, marginBottom: 10 }}
                                />
                                <p>Không tìm thấy sự kiện nào trong mục này.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default EventManagement;
