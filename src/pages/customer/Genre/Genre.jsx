import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useParams, useNavigate } from 'react-router-dom';
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
import { FilterOutlined, CloseCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import classNames from 'classnames/bind';

import styles from './Genre.module.scss';
import EventCard from '@components/EventCard/EventCard';
import { eventApi } from '@apis/eventApi';
import { genresApi } from '@apis/genresApi';
import { ticketApi } from '@apis/ticketApi';
import { getEventImageUrl } from '@utils/imageHelper';
import { slugify } from '@utils/stringUtils'; // Quan trọng: Thêm slugify để so khớp
import useModal from '@hooks/useModal';

const cx = classNames.bind(styles);
const LOCATIONS = [
    'Toàn quốc',
    'Hồ Chí Minh',
    'Hà Nội',
    'Đà Lạt',
    'Vị trí khác'
];

function Genre() {
    const { slug } = useParams(); // Lấy slug từ URL (ví dụ: /genre/nhac-song)
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [genresList, setGenresList] = useState([]);

    const [allEvents, setAllEvents] = useState([]);
    const [loading, setLoading] = useState(false);

    const {
        isOpen: isModalOpen,
        open: openModal,
        close: closeModal
    } = useModal(false);

    const pageSize = 12;

    // 1. Tìm thông tin thể loại hiện tại dựa trên slug từ danh sách genresList
    const currentGenre = useMemo(() => {
        if (!slug || genresList.length === 0) return null;
        // So khớp dựa trên slug có sẵn hoặc tạo slug tạm thời từ name để so sánh
        return genresList.find(g => (g.slug || slugify(g.name)) === slug);
    }, [slug, genresList]);

    // 2. Cấu hình filters lấy ID từ currentGenre tìm được
    const currentFilters = useMemo(
        () => ({
            genreId: currentGenre?.id || '',
            q: searchParams.get('q') || '',
            location: searchParams.get('location') || 'Toàn quốc',
            isFree: searchParams.get('isFree') === 'true',
            page: parseInt(searchParams.get('page') || '1', 10),
            date: 'Tất cả các ngày'
        }),
        [currentGenre, searchParams]
    );

    const [tempFilters, setTempFilters] = useState({ ...currentFilters });

    // Cập nhật URL cho các filter khác (q, location, isFree, page)
    const updateURL = newParams => {
        const params = { ...currentFilters, ...newParams };
        const nextParams = new URLSearchParams();

        if (params.q) nextParams.set('q', params.q);
        if (params.location && params.location !== 'Toàn quốc')
            nextParams.set('location', params.location);
        if (params.isFree) nextParams.set('isFree', 'true');
        if (params.page > 1) nextParams.set('page', params.page.toString());

        setSearchParams(nextParams);
    };

    // 3. Hàm điều hướng khi thay đổi thể loại trong Modal
    const handleGenreChange = genre => {
        const newSlug = genre.slug || slugify(genre.name);
        const search = searchParams.toString();
        // Chuyển sang URL mới với slug của thể loại đã chọn
        navigate(`/genre/${newSlug}${search ? `?${search}` : ''}`);
    };

    const fetchEvents = useCallback(async () => {
        // Chỉ bắt đầu fetch khi đã có danh sách genres để map slug sang ID
        if (genresList.length === 0 && slug) return;

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

            const res = await eventApi.getAll({
                size: 1000,
                filter: filters.join(' and ')
            });
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
                    } catch (err) {}

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

            const sortedData = mappedData.sort((a, b) => {
                const timeA = dayjs(a.fullStartTime).unix();
                const timeB = dayjs(b.fullStartTime).unix();
                if (!a.isPast && !b.isPast) return timeA - timeB;
                if (a.isPast && b.isPast) return timeB - timeA;
                return a.isPast ? 1 : -1;
            });

            setAllEvents(sortedData);
        } catch (error) {
            console.error('Search error:', error);
            setAllEvents([]);
        } finally {
            setLoading(false);
        }
    }, [
        currentFilters.genreId,
        currentFilters.q,
        currentFilters.location,
        genresList,
        slug
    ]);

    useEffect(() => {
        genresApi
            .getAll()
            .then(res => setGenresList(res?.result || res?.data || []));
    }, []);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    const paginatedEvents = useMemo(() => {
        const startIndex = (currentFilters.page - 1) * pageSize;
        return allEvents.slice(startIndex, startIndex + pageSize);
    }, [allEvents, currentFilters.page]);

    return (
        <div className={cx('genrePage')}>
            <div className={cx('container')}>
                <div className={cx('toolbar')}>
                    <div className={cx('titleSection')}>
                        <span className={cx('neonText')}>
                            {currentGenre
                                ? currentGenre.name
                                : currentFilters.q
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
                                openModal();
                            }}
                        >
                            <FilterOutlined /> <span>Bộ lọc</span>
                        </div>

                        {currentGenre && (
                            <Tag
                                className={cx('genreTag')}
                                closable
                                onClose={() => navigate('/genre')}
                            >
                                {currentGenre.name}
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
                        {paginatedEvents.length > 0 ? (
                            <div className={cx('eventsGrid')}>
                                {paginatedEvents.map(event => (
                                    <EventCard key={event.id} data={event} />
                                ))}
                            </div>
                        ) : (
                            <div className={cx('emptyContainer')}>
                                <Empty description='Không tìm thấy sự kiện nào' />
                            </div>
                        )}

                        {allEvents.length > 0 && (
                            <div className={cx('paginationContainer')}>
                                <Pagination
                                    current={currentFilters.page}
                                    total={allEvents.length}
                                    pageSize={pageSize}
                                    onChange={p => updateURL({ page: p })}
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
                onCancel={closeModal}
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
                                    onClick={() => handleGenreChange(genre)}
                                >
                                    {genre.name}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={cx('modalFooter')}>
                        <Button
                            onClick={() => {
                                setTempFilters({
                                    location: 'Toàn quốc',
                                    genreId: '',
                                    isFree: false,
                                    q: currentFilters.q
                                });
                                navigate('/genre');
                            }}
                        >
                            Thiết lập lại
                        </Button>
                        <Button
                            type='primary'
                            onClick={() => {
                                updateURL({ ...tempFilters, page: 1 });
                                closeModal();
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
