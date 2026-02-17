import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Modal, Radio, Switch, Tag, Button, Empty, Spin } from 'antd';
import {
    CalendarOutlined,
    FilterOutlined,
    DownOutlined,
    SearchOutlined
} from '@ant-design/icons';
import classNames from 'classnames/bind';

import styles from './Genre.module.scss';
import EventCard from '@components/EventCard/EventCard';
import { eventApi } from '@apis/eventApi';
import { genresApi } from '@apis/genresApi';

const cx = classNames.bind(styles);

const LOCATIONS = [
    'Toàn quốc',
    'Hồ Chí Minh',
    'Hà Nội',
    'Đà Lạt',
    'Vị trí khác'
];

function Genre() {
    const [searchParams, setSearchParams] = useSearchParams();
    const urlGenreId = searchParams.get('id');
    const urlSearchQuery = searchParams.get('q') || '';

    // State dữ liệu & UI
    const [events, setEvents] = useState([]);
    const [genresList, setGenresList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // State lọc (Applied & Temp)
    const [filters, setFilters] = useState({
        location: 'Toàn quốc',
        genreId: urlGenreId || '',
        isFree: false,
        date: 'Tất cả các ngày'
    });

    const [tempFilters, setTempFilters] = useState({ ...filters });

    useEffect(() => {
        const loadGenres = async () => {
            const res = await genresApi.getAll();
            setGenresList(res?.result || res?.data || []);
        };
        loadGenres();
    }, []);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const params = {
                page: 1,
                size: 12,
                genreId: filters.genreId,
                search: urlSearchQuery,
                sort: 'startTime,asc'
            };
            const res = await eventApi.getAll(params);
            const data = res?.result?.content || res?.data || [];

            // Mock Fallback nếu DB trống
            if (data.length === 0) {
                setEvents(
                    Array.from({ length: 8 }, (_, i) => ({
                        id: `mock-${i}`,
                        name: `Sự kiện Trải nghiệm #${i + 1}`,
                        startTime: '2026-03-20T19:00:00',
                        poster: `https://picsum.photos/400/250?random=${i + 20}`,
                        price: filters.isFree ? 0 : 450000 + i * 20000
                    }))
                );
            } else {
                setEvents(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, [filters, urlSearchQuery]);

    const handleApply = () => {
        setFilters({ ...tempFilters });
        setIsModalOpen(false);
    };

    const handleReset = () => {
        setTempFilters({
            location: 'Toàn quốc',
            genreId: '',
            isFree: false,
            date: 'Tất cả các ngày'
        });
    };

    return (
        <div className={cx('genrePage')}>
            <div className={cx('container')}>
                {/* TOP TOOLBAR */}
                <div className={cx('toolbar')}>
                    <div className={cx('titleSection')}>
                        <span className={cx('neonText')}>
                            Kết quả tìm kiếm:
                        </span>
                    </div>

                    <div className={cx('controls')}>
                        <div className={cx('pill')}>
                            <CalendarOutlined />
                            <span>{filters.date}</span>
                            <DownOutlined style={{ fontSize: 10 }} />
                        </div>

                        <div
                            className={cx('pill')}
                            onClick={() => setIsModalOpen(true)}
                        >
                            <FilterOutlined />
                            <span>Bộ lọc</span>
                        </div>

                        {filters.genreId && (
                            <div className={cx('pill', 'active')}>
                                {genresList.find(
                                    g =>
                                        String(g.id) === String(filters.genreId)
                                )?.name || 'Đang chọn'}
                            </div>
                        )}
                    </div>
                </div>

                {/* GRID DỮ LIỆU */}
                {loading ? (
                    <div className={cx('center')}>
                        <Spin size='large' />
                    </div>
                ) : (
                    <div className={cx('eventsGrid')}>
                        {events.map(event => (
                            <EventCard key={event.id} data={event} />
                        ))}
                    </div>
                )}
            </div>

            {/* FLOATING FILTER MODAL */}
            <Modal
                title={<span className={cx('modalTitle')}>Bộ lọc sự kiện</span>}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
                width={500}
                centered
                className={cx('customModal')}
            >
                <div className={cx('modalBody')}>
                    {/* Location */}
                    <div className={cx('filterSection')}>
                        <h4>Vị trí</h4>
                        <Radio.Group
                            value={tempFilters.location}
                            onChange={e =>
                                setTempFilters({
                                    ...tempFilters,
                                    location: e.target.value
                                })
                            }
                            className={cx('verticalRadio')}
                        >
                            {LOCATIONS.map(loc => (
                                <Radio key={loc} value={loc}>
                                    {loc}
                                </Radio>
                            ))}
                        </Radio.Group>
                    </div>

                    {/* Price */}
                    <div className={cx('filterSection', 'flexBetween')}>
                        <h4>Sự kiện Miễn phí</h4>
                        <Switch
                            checked={tempFilters.isFree}
                            onChange={val =>
                                setTempFilters({ ...tempFilters, isFree: val })
                            }
                        />
                    </div>

                    {/* Categories */}
                    <div className={cx('filterSection')}>
                        <h4>Thể loại</h4>
                        <div className={cx('chipGroup')}>
                            {genresList.map(genre => (
                                <div
                                    key={genre.id}
                                    className={cx('chip', {
                                        active:
                                            String(tempFilters.genreId) ===
                                            String(genre.id)
                                    })}
                                    onClick={() =>
                                        setTempFilters({
                                            ...tempFilters,
                                            genreId: genre.id
                                        })
                                    }
                                >
                                    {genre.name}
                                </div>
                            ))}
                            <div className={cx('chip')}>Khác</div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className={cx('modalFooter')}>
                        <Button
                            className={cx('btnReset')}
                            onClick={handleReset}
                        >
                            Thiết lập lại
                        </Button>
                        <Button
                            className={cx('btnApply')}
                            onClick={handleApply}
                        >
                            Áp dụng
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

export default Genre;
