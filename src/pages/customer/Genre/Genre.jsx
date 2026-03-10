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
    DownOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import classNames from 'classnames/bind';

import styles from './Genre.module.scss';
import EventCard from '@components/EventCard/EventCard';
import { eventApi } from '@apis/eventApi';
import { genresApi } from '@apis/genresApi';
import { ticketApi } from '@apis/ticketApi';
import { getEventImageUrl } from '@utils/imageHelper';

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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [totalItems, setTotalItems] = useState(0);

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

    // --- LOGIC SẮP XẾP QUAN TRỌNG ---
    const sortedEvents = useMemo(() => {
        if (!events || events.length === 0) return [];

        // 1. Chia mảng thành 2 nhóm: Chưa diễn ra và Đã diễn ra
        const upcomingEvents = events.filter(e => !e.isPast);
        const pastEvents = events.filter(e => e.isPast);

        // 2. Sắp xếp nhóm Chưa diễn ra: Ngày gần hiện tại nhất lên đầu (Tăng dần)
        upcomingEvents.sort((a, b) => {
            const timeA = dayjs(a.fullStartTime).unix();
            const timeB = dayjs(b.fullStartTime).unix();
            return timeA - timeB;
        });

        // 3. Sắp xếp nhóm Đã diễn ra: Mới kết thúc gần đây lên đầu (Giảm dần)
        pastEvents.sort((a, b) => {
            const timeA = dayjs(a.fullStartTime).unix();
            const timeB = dayjs(b.fullStartTime).unix();
            return timeB - timeA;
        });

        // 4. Kết hợp: Sắp diễn ra trước, Đã qua sau
        return [...upcomingEvents, ...pastEvents];
    }, [events]);

    useEffect(() => {
        const loadGenres = async () => {
            try {
                const res = await genresApi.getAll();
                setGenresList(
                    res?.result || res?.data || (Array.isArray(res) ? res : [])
                );
            } catch (err) {
                console.error('Lỗi tải thể loại', err);
            }
        };
        loadGenres();
    }, []);

    const updateQueryParams = (newFilters, newPage = 1) => {
        const params = new URLSearchParams();
        if (newFilters.q) params.set('q', newFilters.q);

        if (newFilters.genreId) {
            params.set('id', newFilters.genreId);
            const genreObj = genresList.find(
                g => String(g.id) === String(newFilters.genreId)
            );
            const slugName = genreObj
                ? genreObj.name.toLowerCase().replace(/\s+/g, '-')
                : newFilters.genreName;
            params.set('name', slugName);
        }

        if (newFilters.location !== 'Toàn quốc')
            params.set('location', newFilters.location);
        if (newFilters.isFree) params.set('isFree', 'true');
        if (newPage > 1) params.set('page', newPage.toString());

        setSearchParams(params);
    };

    const fetchEvents = useCallback(async () => {
        setLoading(true);
        try {
            const now = dayjs();
            let filterString = `isPublished:true`;

            if (currentFilters.genreId) {
                filterString += ` and genre.id:${currentFilters.genreId}`;
            }

            if (currentFilters.q) {
                filterString += ` and name ~~ '%${currentFilters.q}%'`;
            }

            if (
                currentFilters.location &&
                currentFilters.location !== 'Toàn quốc'
            ) {
                filterString += ` and location ~~ '%${currentFilters.location}%'`;
            }

            const apiParams = {
                page: currentFilters.page - 1,
                size: pageSize,
                filter: filterString
                // Không sort ở API nữa vì ta sẽ tự sort ở FE theo logic phức tạp hơn
            };

            const res = await eventApi.getAll(apiParams);
            if (res?.meta) setTotalItems(res.meta.total);

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
                        if (tickets.length > 0) {
                            standardPrice = tickets[0].price;
                        }
                    } catch (ticketErr) {
                        console.error(
                            `Lỗi lấy giá vé cho event ${e.id}:`,
                            ticketErr
                        );
                    }

                    const posterObj =
                        e.images?.find(img => img.isCover) || e.images?.[0];
                    const fullStartTime = e.startDate
                        ? `${e.startDate} ${e.startTime || '00:00:00'}`
                        : e.startTime;

                    const startEvent = dayjs(fullStartTime);
                    const endEvent = dayjs(
                        e.endDate
                            ? `${e.endDate} ${e.endTime || '23:59:59'}`
                            : e.endTime
                    );

                    // Xác định trạng thái Đã qua (Logic Data: false - true hoặc hết thời gian)
                    const isPast =
                        (!e.isPublished && e.isActive) || now.isAfter(endEvent);

                    return {
                        ...e,
                        title: e.name,
                        price: standardPrice,
                        fullStartTime, // Lưu lại để dùng cho sort
                        isAutoActive:
                            e.isPublished &&
                            now.isAfter(startEvent) &&
                            now.isBefore(endEvent),
                        isPast: isPast,
                        date: startEvent.isValid()
                            ? startEvent.format('DD/MM/YYYY')
                            : 'Sắp diễn ra',
                        url: getEventImageUrl(e.id, posterObj?.url)
                    };
                })
            );

            setEvents(mappedData);
        } catch (e) {
            console.error('Fetch Events Error:', e);
            setEvents([]);
        } finally {
            setLoading(false);
        }
    }, [currentFilters]);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    return (
        <div className={cx('genrePage')}>
            <div className={cx('container')}>
                <div className={cx('toolbar')}>
                    <div className={cx('titleSection')}>
                        <span className={cx('neonText')}>
                            {currentFilters.q
                                ? `Kết quả: "${currentFilters.q}"`
                                : 'Khám phá sự kiện'}
                        </span>
                    </div>

                    <div className={cx('controls')}>
                        <div className={cx('pill')}>
                            <CalendarOutlined />{' '}
                            <span>{currentFilters.date}</span>{' '}
                            <DownOutlined style={{ fontSize: 10 }} />
                        </div>
                        <div
                            className={cx('pill')}
                            onClick={() => {
                                setTempFilters({ ...currentFilters });
                                setIsModalOpen(true);
                            }}
                        >
                            <FilterOutlined /> <span>Bộ lọc</span>
                        </div>

                        {currentFilters.genreId && (
                            <Tag
                                className={cx('genreTag')}
                                closable
                                onClose={() =>
                                    updateQueryParams(
                                        { ...currentFilters, genreId: '' },
                                        1
                                    )
                                }
                            >
                                {genresList.find(
                                    g =>
                                        String(g.id) ===
                                        String(currentFilters.genreId)
                                )?.name ||
                                    currentFilters.genreName.replace(/-/g, ' ')}
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

                        {sortedEvents.length > 0 && (
                            <div className={cx('paginationContainer')}>
                                <Pagination
                                    current={currentFilters.page}
                                    total={totalItems}
                                    pageSize={pageSize}
                                    onChange={p =>
                                        updateQueryParams(currentFilters, p)
                                    }
                                    showSizeChanger={false}
                                />
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Modal Bộ lọc */}
            <Modal
                title='Bộ lọc sự kiện'
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
                centered
                width={500}
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
                            className={cx('btnReset')}
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
                            className={cx('btnApply')}
                            onClick={() => {
                                updateQueryParams(tempFilters, 1);
                                setIsModalOpen(false);
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
