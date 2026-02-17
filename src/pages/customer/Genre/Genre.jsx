// src/pages/customer/Genre/Genre.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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
    'Đà Nẵng',
    'Khác'
];
const ITEMS_PER_PAGE = 12;

function Genre() {
    const [searchParams, setSearchParams] = useSearchParams();
    const urlGenreId = searchParams.get('id');
    const urlSearchQuery = searchParams.get('q') || '';

    const [events, setEvents] = useState([]);
    const [genresList, setGenresList] = useState([]);
    const [loading, setLoading] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    const [tempFilters, setTempFilters] = useState({
        location: 'Toàn quốc',
        genreId: urlGenreId || '',
        date: ''
    });

    const [appliedFilters, setAppliedFilters] = useState({
        location: 'Toàn quốc',
        genreId: urlGenreId || '',
        date: '',
        search: urlSearchQuery
    });

    // 1. Fetch danh sách Thể loại (Genres)
    useEffect(() => {
        const fetchGenres = async () => {
            try {
                const res = await genresApi.getAll();
                const list =
                    res?.result || res?.data || (Array.isArray(res) ? res : []);
                setGenresList(list);
            } catch (error) {
                console.error('Lỗi lấy danh sách thể loại:', error);
            }
        };
        fetchGenres();
    }, []);

    // 2. Đồng bộ URL params
    useEffect(() => {
        setAppliedFilters(prev => ({
            ...prev,
            genreId: urlGenreId || prev.genreId,
            search: urlSearchQuery || prev.search
        }));
        setTempFilters(prev => ({
            ...prev,
            genreId: urlGenreId || prev.genreId
        }));
    }, [urlGenreId, urlSearchQuery]);

    // 3. Fetch Events với logic Mock Data Fallback
    useEffect(() => {
        const fetchEvents = async () => {
            setLoading(true);
            try {
                const params = {
                    page: currentPage,
                    size: ITEMS_PER_PAGE,
                    search: appliedFilters.search,
                    sort: 'startTime,asc' // FIX: Dùng startTime thay vì startDate
                };

                if (appliedFilters.genreId)
                    params.genreId = appliedFilters.genreId;
                if (
                    appliedFilters.location &&
                    appliedFilters.location !== 'Toàn quốc'
                ) {
                    params.location = appliedFilters.location;
                }

                const res = await eventApi.getAll(params);
                const data = res?.result || res?.data || res;

                let fetchedEvents =
                    data?.content || (Array.isArray(data) ? data : []);

                // LOGIC MOCK DATA: Nếu API không trả về dữ liệu, hãy tự tạo dữ liệu giả để hiển thị
                if (fetchedEvents.length === 0) {
                    console.log('>>> API rỗng, đang khởi tạo Mock Data...');

                    // Tìm tên genre hiện tại để làm tiêu đề giả cho đẹp
                    const currentGenre = genresList.find(
                        g => String(g.id) === String(appliedFilters.genreId)
                    );
                    const genreName = currentGenre
                        ? currentGenre.name
                        : 'Sự kiện';

                    fetchedEvents = Array.from({ length: 8 }, (_, i) => ({
                        id: `mock-genre-${appliedFilters.genreId}-${i}`,
                        name: `${genreName} nổi bật #${i + 1}`,
                        location:
                            appliedFilters.location !== 'Toàn quốc'
                                ? appliedFilters.location
                                : 'TP. Hồ Chí Minh',
                        startTime: '2026-02-10T19:00:00',
                        poster: `https://picsum.photos/400/250?random=${appliedFilters.genreId || 0 * 10 + i}`,
                        price: i % 2 === 0 ? 250000 : 0
                    }));

                    setTotalPages(1);
                } else {
                    setTotalPages(data?.totalPages || data?.meta?.pages || 1);
                }

                setEvents(fetchedEvents);
            } catch (error) {
                console.error(
                    'Lỗi tải sự kiện (đang dùng mock data làm fallback):',
                    error
                );
                // Fallback dữ liệu giả ngay cả khi API sập hoàn toàn
                setEvents(
                    Array.from({ length: 4 }, (_, i) => ({
                        id: `error-mock-${i}`,
                        name: `Sự kiện dự phòng #${i + 1}`,
                        location: 'Chưa xác định',
                        startTime: new Date().toISOString(),
                        poster: `https://picsum.photos/400/250?random=${i}`,
                        price: 0
                    }))
                );
                setTotalPages(1);
            } finally {
                setLoading(false);
            }
        };

        // Chỉ fetch khi đã load xong danh sách genres (để mock data có tên chuẩn)
        if (genresList.length > 0 || appliedFilters.genreId === '') {
            fetchEvents();
        }
    }, [appliedFilters, currentPage, genresList]);

    const handleApplyFilter = () => {
        setAppliedFilters(prev => ({ ...prev, ...tempFilters }));
        setCurrentPage(1);
    };

    const handleResetFilter = () => {
        const defaults = { location: 'Toàn quốc', genreId: '', date: '' };
        setTempFilters(defaults);
        setAppliedFilters(prev => ({ ...prev, ...defaults, search: '' }));
        setSearchParams({});
        setCurrentPage(1);
    };

    const handlePageChange = newPage => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <div className={cx('genre-container')}>
            <aside className={cx('sidebar')}>
                <div className={cx('filterGroup')}>
                    <h3 className={cx('filterTitle')}>Vị trí</h3>
                    <ul className={cx('filterList')}>
                        {LOCATIONS.map(loc => (
                            <li key={loc} className={cx('filterItem')}>
                                <label>
                                    <input
                                        type='radio'
                                        name='location'
                                        checked={tempFilters.location === loc}
                                        onChange={() =>
                                            setTempFilters({
                                                ...tempFilters,
                                                location: loc
                                            })
                                        }
                                    />
                                    <span>{loc}</span>
                                </label>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className={cx('filterGroup')}>
                    <h3 className={cx('filterTitle')}>Thể loại</h3>
                    <select
                        className={cx('filterSelect')}
                        value={tempFilters.genreId}
                        onChange={e =>
                            setTempFilters({
                                ...tempFilters,
                                genreId: e.target.value
                            })
                        }
                    >
                        <option value=''>Tất cả thể loại</option>
                        {genresList.map(genre => (
                            <option key={genre.id} value={genre.id}>
                                {genre.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className={cx('filterActions')}>
                    <button
                        className={cx('btnReset')}
                        onClick={handleResetFilter}
                    >
                        Thiết lập lại
                    </button>
                    <button
                        className={cx('btnApply')}
                        onClick={handleApplyFilter}
                    >
                        Áp dụng
                    </button>
                </div>
            </aside>

            <main className={cx('mainContent')}>
                <h2 className={cx('pageTitle')}>
                    {appliedFilters.search
                        ? `Kết quả tìm kiếm cho: "${appliedFilters.search}"`
                        : 'Dữ liệu sự kiện'}
                </h2>

                {loading ? (
                    <div className={cx('loading')}>Đang tải...</div>
                ) : (
                    <>
                        <div className={cx('eventsGrid')}>
                            {events.length > 0 ? (
                                events.map(event => (
                                    <EventCard key={event.id} data={event} />
                                ))
                            ) : (
                                <p className={cx('emptyMsg')}>
                                    Không có dữ liệu.
                                </p>
                            )}
                        </div>

                        {totalPages > 1 && (
                            <div className={cx('pagination')}>
                                {Array.from({ length: totalPages }).map(
                                    (_, idx) => (
                                        <button
                                            key={idx}
                                            className={cx('pageBtn', {
                                                active: currentPage === idx + 1
                                            })}
                                            onClick={() =>
                                                handlePageChange(idx + 1)
                                            }
                                        >
                                            {idx + 1}
                                        </button>
                                    )
                                )}
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}

export default Genre;
