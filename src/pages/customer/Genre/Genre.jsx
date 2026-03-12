import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
    DownOutlined,
    CloseCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import classNames from 'classnames/bind';

import styles from './Genre.module.scss';
import EventCard from '@components/EventCard/EventCard';
import { eventApi } from '@apis/eventApi';
import { genresApi } from '@apis/genresApi';
import { ticketApi } from '@apis/ticketApi';
import { getEventImageUrl } from '@utils/imageHelper';
import useModal from '@hooks/useModal'; // 1. Import hook useModal

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
    const [genresList, setGenresList] = useState([]);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalItems, setTotalItems] = useState(0);

    // 2. Sử dụng hook useModal để quản lý trạng thái modal bộ lọc
    const {
        isOpen: isModalOpen,
        open: openModal,
        close: closeModal
    } = useModal(false);

    const pageSize = 20;

    const currentFilters = useMemo(
        () => ({
            genreId: searchParams.get('id') || '',
            genreName: searchParams.get('name') || '',
            q: searchParams.get('q') || '',
            location: searchParams.get('location') || 'Toàn quốc',
            isFree: searchParams.get('isFree') === 'true',
            page: parseInt(searchParams.get('page') || '1', 10),
            date: 'Tất cả các ngày'
        }),
        [searchParams]
    );

    const [tempFilters, setTempFilters] = useState({ ...currentFilters });

    const updateURL = newParams => {
        const params = {
            q: currentFilters.q,
            ...newParams
        };

        const nextParams = new URLSearchParams();

        if (params.q) nextParams.set('q', params.q);
        if (params.genreId) {
            nextParams.set('id', params.genreId);
            const genre = genresList.find(
                g => String(g.id) === String(params.genreId)
            );
            if (genre)
                nextParams.set(
                    'name',
                    genre.name.toLowerCase().replace(/\s+/g, '-')
                );
        }
        if (params.location && params.location !== 'Toàn quốc')
            nextParams.set('location', params.location);
        if (params.isFree) nextParams.set('isFree', 'true');
        if (params.page > 1) nextParams.set('page', params.page.toString());

        setSearchParams(nextParams);
    };

    const fetchEvents = useCallback(async () => {
        setLoading(true);
        try {
            const now = dayjs();
            let filters = [`isPublished:true`];

            if (currentFilters.genreId)
                filters.push(`genre.id:${currentFilters.genreId}`);
            if (currentFilters.q)
                filters.push(`name ~~ '%${currentFilters.q}%'`);
            if (currentFilters.location !== 'Toàn quốc')
                filters.push(`location ~~ '%${currentFilters.location}%'`);

            const apiParams = {
                page: currentFilters.page - 1,
                size: pageSize,
                filter: filters.join(' and ')
            };

            const res = await eventApi.getAll(apiParams);
            const eventsList = res?.result || res?.content || [];

            const mappedData = await Promise.all(
                eventsList.map(async e => {
                    let standardPrice = 0;
                    try {
                        const ticketRes = await ticketApi.getAll({
                            filter: `event.id:${e.id} and ticketType:'STANDARD'`
                        });
                        const tickets =
                            ticketRes?.result || ticketRes?.content || [];
                        if (tickets.length > 0)
                            standardPrice = tickets[0].price;
                    } catch (err) {
                        /* ignore */
                    }

                    const posterObj =
                        e.images?.find(img => img.isCover) || e.images?.[0];
                    const fullStartTime = e.startDate
                        ? `${e.startDate} ${e.startTime || '00:00:00'}`
                        : e.startTime;
                    const endEvent = dayjs(
                        e.endDate
                            ? `${e.endDate} ${e.endTime || '23:59:59'}`
                            : e.endTime
                    );

                    return {
                        ...e,
                        title: e.name,
                        price: standardPrice,
                        fullStartTime,
                        isPast: now.isAfter(endEvent),
                        date: dayjs(fullStartTime).isValid()
                            ? dayjs(fullStartTime).format('DD/MM/YYYY')
                            : 'Sắp diễn ra',
                        url: getEventImageUrl(e.id, posterObj?.url)
                    };
                })
            );

            setEvents(mappedData);
            setTotalItems(res?.meta?.total || 0);
        } catch (error) {
            console.error('Search error:', error);
            setEvents([]);
        } finally {
            setLoading(false);
        }
    }, [currentFilters]);

    const sortedEvents = useMemo(() => {
        const upcoming = events
            .filter(e => !e.isPast)
            .sort(
                (a, b) =>
                    dayjs(a.fullStartTime).unix() -
                    dayjs(b.fullStartTime).unix()
            );
        const past = events
            .filter(e => e.isPast)
            .sort(
                (a, b) =>
                    dayjs(b.fullStartTime).unix() -
                    dayjs(a.fullStartTime).unix()
            );
        return [...upcoming, ...past];
    }, [events]);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    useEffect(() => {
        genresApi
            .getAll()
            .then(res => setGenresList(res?.result || res?.data || []));
    }, []);

    return (
        <div className={cx('genrePage')}>
            <div className={cx('container')}>
                <div className={cx('toolbar')}>
                    <div className={cx('titleSection')}>
                        <span className={cx('neonText')}>
                            {currentFilters.q
                                ? `Kết quả cho: "${currentFilters.q}"`
                                : 'Khám phá sự kiện'}
                        </span>
                        {currentFilters.q && (
                            <CloseCircleOutlined
                                className={cx('clearSearch')}
                                onClick={() => updateURL({ q: '', page: 1 })}
                            />
                        )}
                    </div>

                    <div className={cx('controls')}>
                        <div
                            className={cx('pill')}
                            onClick={() => {
                                setTempFilters({ ...currentFilters });
                                openModal(); // Sử dụng hàm mở từ hook
                            }}
                        >
                            <FilterOutlined /> <span>Bộ lọc</span>
                        </div>

                        {currentFilters.genreId && (
                            <Tag
                                className={cx('genreTag')}
                                closable
                                onClose={() =>
                                    updateURL({ genreId: '', page: 1 })
                                }
                            >
                                {genresList.find(
                                    g =>
                                        String(g.id) ===
                                        String(currentFilters.genreId)
                                )?.name || 'Thể loại'}
                            </Tag>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div className={cx('loadingContainer')}>
                        <Spin size='large' tip='Đang tìm kiếm...' />
                    </div>
                ) : (
                    <>
                        {sortedEvents.length > 0 ? (
                            <div className={cx('eventsGrid')}>
                                {sortedEvents.map(event => (
                                    <EventCard key={event.id} data={event} />
                                ))}
                            </div>
                        ) : (
                            <div className={cx('emptyContainer')}>
                                <Empty description='Không tìm thấy sự kiện nào' />
                            </div>
                        )}

                        <div className={cx('paginationContainer')}>
                            <Pagination
                                current={currentFilters.page}
                                total={totalItems}
                                pageSize={pageSize}
                                onChange={p => updateURL({ page: p })}
                                showSizeChanger={false}
                            />
                        </div>
                    </>
                )}
            </div>

            <Modal
                title='Bộ lọc sự kiện'
                open={isModalOpen} // Trạng thái từ hook
                onCancel={closeModal} // Hàm đóng từ hook
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
                            onClick={() =>
                                setTempFilters({
                                    location: 'Toàn quốc',
                                    genreId: '',
                                    isFree: false,
                                    q: currentFilters.q
                                })
                            }
                        >
                            Thiết lập lại
                        </Button>
                        <Button
                            type='primary'
                            onClick={() => {
                                updateURL({ ...tempFilters, page: 1 });
                                closeModal(); // Đóng modal sau khi áp dụng
                            }}
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
