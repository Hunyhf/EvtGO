import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Modal, Radio, Switch, Tag, Button, Spin } from 'antd';
import {
    CalendarOutlined,
    FilterOutlined,
    DownOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import classNames from 'classnames/bind';

import styles from './Genre.module.scss';
import EventCard from '@components/EventCard/EventCard';
import { eventApi } from '@apis/eventApi';
import { genresApi } from '@apis/genresApi';

const cx = classNames.bind(styles);

const BASE_URL_IMAGE = 'http://localhost:8080/api/v1/files';

const LOCATIONS = [
    'Toàn quốc',
    'Hồ Chí Minh',
    'Hà Nội',
    'Đà Lạt',
    'Vị trí khác'
];

function Genre() {
    const [searchParams] = useSearchParams();
    const urlGenreId = searchParams.get('id');
    const urlSearchQuery = searchParams.get('q') || '';

    const [events, setEvents] = useState([]);
    const [genresList, setGenresList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [filters, setFilters] = useState({
        location: 'Toàn quốc',
        genreId: urlGenreId || '',
        isFree: false,
        date: 'Tất cả các ngày'
    });

    const [tempFilters, setTempFilters] = useState({ ...filters });

    useEffect(() => {
        if (urlGenreId) {
            setFilters(prev => ({ ...prev, genreId: urlGenreId }));
            setTempFilters(prev => ({ ...prev, genreId: urlGenreId }));
        }
    }, [urlGenreId]);

    useEffect(() => {
        const loadGenres = async () => {
            const res = await genresApi.getAll();
            setGenresList(
                res?.result || res?.data || (Array.isArray(res) ? res : [])
            );
        };
        loadGenres();
    }, []);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const now = dayjs();
            const params = {
                page: 1,
                size: 50,
                search: urlSearchQuery
            };

            const res = await eventApi.getAll(params);
            const rawData =
                res?.result ||
                res?.content ||
                res?.data ||
                (Array.isArray(res) ? res : []);

            const realDataFiltered = rawData.filter(e => {
                const isApproved = e.published === true;
                const matchGenre =
                    !filters.genreId ||
                    String(e.genreId) === String(filters.genreId);
                const eventStartTime = dayjs(
                    `${e.startDate} ${e.startTime || '00:00:00'}`
                );

                return isApproved && matchGenre && eventStartTime.isAfter(now);
            });

            if (realDataFiltered.length > 0) {
                const mappedRealData = realDataFiltered.map(e => {
                    const posterObj =
                        e.images?.find(img => img.isCover) || e.images?.[0];
                    const startDateObj = dayjs(e.startDate);

                    return {
                        ...e,
                        title: e.name,
                        date: startDateObj.format('DD/MM/YYYY'),
                        month: startDateObj.format('MMM').toUpperCase(),
                        url: posterObj?.url
                            ? `${BASE_URL_IMAGE}/${posterObj.url}`
                            : 'https://placehold.co/400x600?text=No+Image'
                    };
                });
                setEvents(mappedRealData);
            } else {
                setEvents(
                    Array.from({ length: 8 }, (_, i) => ({
                        id: `mock-${i}`,
                        title: `Sự kiện ${genresList.find(g => String(g.id) === String(filters.genreId))?.name || 'Trải nghiệm'} #${i + 1}`,
                        date: '20/03/2026',
                        month: 'MAR',
                        url: `https://picsum.photos/400/250?random=${i + 50}`,
                        price: filters.isFree ? 0 : 450000 + i * 20000
                    }))
                );
            }
        } catch (e) {
            console.error('>>> [Genre] Error:', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, [filters, urlSearchQuery, genresList]);

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
                <div className={cx('toolbar')}>
                    <div className={cx('titleSection')}>
                        <span className={cx('neonText')}>
                            {urlSearchQuery
                                ? `Kết quả tìm kiếm: "${urlSearchQuery}"`
                                : 'Khám phá sự kiện'}
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
                            <Tag
                                color='cyan'
                                closable
                                onClose={() =>
                                    setFilters(f => ({ ...f, genreId: '' }))
                                }
                                style={{
                                    borderRadius: 20,
                                    padding: '2px 12px'
                                }}
                            >
                                {
                                    genresList.find(
                                        g =>
                                            String(g.id) ===
                                            String(filters.genreId)
                                    )?.name
                                }
                            </Tag>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div
                        className={cx('center')}
                        style={{ padding: '100px 0' }}
                    >
                        <Spin size='large' tip='Đang tìm kiếm sự kiện...' />
                    </div>
                ) : (
                    <div className={cx('eventsGrid')}>
                        {events.map(event => (
                            <EventCard key={event.id} data={event} />
                        ))}
                    </div>
                )}
            </div>

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

                    <div className={cx('filterSection', 'flexBetween')}>
                        <h4>Sự kiện Miễn phí</h4>
                        <Switch
                            checked={tempFilters.isFree}
                            onChange={val =>
                                setTempFilters({ ...tempFilters, isFree: val })
                            }
                        />
                    </div>

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
                        </div>
                    </div>

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
