import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
    Modal,
    Radio,
    Switch,
    Tag,
    Button,
    Spin,
    Pagination,
    Empty
} from 'antd';
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
import { useGenres } from '@hooks/useGenres';

const cx = classNames.bind(styles);
const BASE_URL_IMAGE =
    import.meta.env.VITE_BASE_IMAGE_URL || 'http://localhost:8080/api/v1/files';

const LOCATIONS = [
    'Toàn quốc',
    'Hồ Chí Minh',
    'Hà Nội',
    'Đà Lạt',
    'Vị trí khác'
];

function Genre() {
    const [searchParams, setSearchParams] = useSearchParams();

    // Đọc filter từ URL ngay từ đầu
    const urlGenreId = searchParams.get('genreId') || '';
    const urlSearchQuery = searchParams.get('q') || '';
    const urlLocation = searchParams.get('location') || 'Toàn quốc';
    const urlIsFree = searchParams.get('isFree') === 'true';

    const { genres: genresList } = useGenres();

    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [totalItems, setTotalItems] = useState(0);

    const currentPage = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = 12;

    // State lưu filter chính thức
    const [filters, setFilters] = useState({
        location: urlLocation,
        genreId: urlGenreId,
        isFree: urlIsFree,
        date: 'Tất cả các ngày'
    });

    // State lưu tạm trong Modal
    const [tempFilters, setTempFilters] = useState({ ...filters });

    // Khi URL thay đổi (nhấn nút Back/Forward hoặc từ Navbar), đồng bộ lại state
    useEffect(() => {
        setFilters({
            location: urlLocation,
            genreId: urlGenreId,
            isFree: urlIsFree,
            date: 'Tất cả các ngày'
        });
    }, [urlGenreId, urlLocation, urlIsFree]);

    const fetchEvents = useCallback(async () => {
        setLoading(true);
        try {
            const now = dayjs();
            let filterString = `isPublished:true`;

            if (filters.genreId) {
                filterString += ` and genre.id:${filters.genreId}`;
            }
            if (urlSearchQuery) {
                filterString += ` and name ~~ '%${urlSearchQuery}%'`;
            }
            if (filters.location && filters.location !== 'Toàn quốc') {
                filterString += ` and location ~~ '%${filters.location}%'`;
            }
            // BỔ SUNG: Logic lọc miễn phí (giả sử field price trong DB)
            if (filters.isFree) {
                // filterString += ` and price:0`;
            }

            const params = {
                page: currentPage - 1,
                size: pageSize,
                filter: filterString
            };

            const res = await eventApi.getAll(params);
            if (res?.meta) setTotalItems(res.meta.total);

            const rawData = res?.result || res?.content || res?.data || [];

            const mappedData = rawData.map(e => {
                const posterObj =
                    e.images?.find(img => img.isCover) || e.images?.[0];
                const startEvent = dayjs(e.startTime || e.startDate);
                const endEvent = dayjs(e.endTime || e.endDate);

                return {
                    ...e,
                    title: e.name,
                    isAutoActive:
                        e.isPublished &&
                        now.isAfter(startEvent) &&
                        now.isBefore(endEvent),
                    isPast: now.isAfter(endEvent),
                    date: startEvent.isValid()
                        ? startEvent.format('HH:mm - DD/MM/YYYY')
                        : 'Sắp diễn ra',
                    month: startEvent.isValid()
                        ? startEvent.format('MMM').toUpperCase()
                        : 'UP',
                    url: posterObj?.url
                        ? `${BASE_URL_IMAGE}/events/${e.id}/${posterObj.url}`
                        : 'https://placehold.co/400x600?text=No+Image'
                };
            });

            setEvents(mappedData);
        } catch (e) {
            console.error(e);
            setEvents([]);
        } finally {
            setLoading(false);
        }
    }, [filters, urlSearchQuery, currentPage]);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    // Hàm cập nhật URL khi áp dụng filter
    const updateQueryParams = (newFilters, newPage = 1) => {
        const params = {};
        if (urlSearchQuery) params.q = urlSearchQuery;
        if (newFilters.genreId) params.genreId = newFilters.genreId;
        if (newFilters.location !== 'Toàn quốc')
            params.location = newFilters.location;
        if (newFilters.isFree) params.isFree = 'true';
        if (newPage > 1) params.page = newPage;

        setSearchParams(params);
    };

    const handleApply = () => {
        setFilters({ ...tempFilters });
        updateQueryParams(tempFilters, 1);
        setIsModalOpen(false);
    };

    const handleReset = () => {
        const resetData = {
            location: 'Toàn quốc',
            genreId: '',
            isFree: false,
            date: 'Tất cả các ngày'
        };
        setTempFilters(resetData);
    };

    const handlePageChange = page => {
        updateQueryParams(filters, page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleRemoveGenre = () => {
        const newFilters = { ...filters, genreId: '' };
        setFilters(newFilters);
        updateQueryParams(newFilters, 1);
    };

    return (
        <div className={cx('genrePage')}>
            <div className={cx('container')}>
                <div className={cx('toolbar')}>
                    <div className={cx('titleSection')}>
                        <span className={cx('neonText')}>
                            {urlSearchQuery
                                ? `Kết quả: "${urlSearchQuery}"`
                                : 'Khám phá sự kiện'}
                        </span>
                    </div>

                    <div className={cx('controls')}>
                        <div
                            className={cx('pill')}
                            onClick={() => setIsModalOpen(true)}
                        >
                            <FilterOutlined />
                            <span>Bộ lọc {filters.isFree && '(Miễn phí)'}</span>
                        </div>

                        {filters.genreId && (
                            <Tag
                                color='cyan'
                                closable
                                onClose={handleRemoveGenre}
                                style={{
                                    borderRadius: 20,
                                    padding: '2px 12px'
                                }}
                            >
                                {genresList.find(
                                    g =>
                                        String(g.id) === String(filters.genreId)
                                )?.name || 'Đang tải...'}
                            </Tag>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div
                        className={cx('center')}
                        style={{ padding: '100px 0' }}
                    >
                        <Spin size='large' />
                    </div>
                ) : (
                    <>
                        {events.length > 0 ? (
                            <div className={cx('eventsGrid')}>
                                {events.map(event => (
                                    <EventCard key={event.id} data={event} />
                                ))}
                            </div>
                        ) : (
                            <div style={{ padding: '50px 0' }}>
                                <Empty description='Không tìm thấy sự kiện nào' />
                            </div>
                        )}

                        {events.length > 0 && (
                            <div
                                style={{
                                    marginTop: 40,
                                    display: 'flex',
                                    justifyContent: 'center',
                                    paddingBottom: 40
                                }}
                            >
                                <Pagination
                                    current={currentPage}
                                    total={totalItems}
                                    pageSize={pageSize}
                                    onChange={handlePageChange}
                                    showSizeChanger={false}
                                />
                            </div>
                        )}
                    </>
                )}
            </div>

            <Modal
                title='Bộ lọc sự kiện'
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
                centered
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
                        >
                            {LOCATIONS.map(loc => (
                                <Radio key={loc} value={loc}>
                                    {loc}
                                </Radio>
                            ))}
                        </Radio.Group>
                    </div>

                    <div
                        className={cx('filterSection', 'flexBetween')}
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}
                    >
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

                    <div
                        className={cx('modalFooter')}
                        style={{ display: 'flex', gap: 10, marginTop: 20 }}
                    >
                        <Button onClick={handleReset} block>
                            Thiết lập lại
                        </Button>
                        <Button type='primary' onClick={handleApply} block>
                            Áp dụng
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}

export default Genre;
