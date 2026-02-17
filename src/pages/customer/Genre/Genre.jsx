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

    // Lấy params khởi tạo từ URL
    const urlGenreId = searchParams.get('id');
    const urlSearchQuery = searchParams.get('q') || '';

    // State dữ liệu
    const [events, setEvents] = useState([]);
    const [genresList, setGenresList] = useState([]);
    const [loading, setLoading] = useState(false);

    // State phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    // State bộ lọc
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

    // 1. Load danh sách thể loại ban đầu
    useEffect(() => {
        const fetchGenres = async () => {
            try {
                const res = await genresApi.getAll();
                // Map dữ liệu linh hoạt theo cấu trúc RestResponse
                const list =
                    res?.result || res?.data || (Array.isArray(res) ? res : []);
                setGenresList(list);
            } catch (error) {
                console.error('Lỗi lấy danh sách thể loại:', error);
            }
        };
        fetchGenres();
    }, []);

    // 2. Đồng bộ khi URL thay đổi (VD: User bấm từ trang Home)
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

    // 3. Fetch Events (FIX BUG 500 TẠI ĐÂY)
    useEffect(() => {
        const fetchEvents = async () => {
            setLoading(true);
            try {
                const params = {
                    page: currentPage,
                    size: ITEMS_PER_PAGE,
                    search: appliedFilters.search,
                    // FIX: Đổi 'startDate' -> 'startTime' khớp với Entity Event trong Java
                    sort: 'startTime,asc'
                };

                if (appliedFilters.genreId)
                    params.genreId = appliedFilters.genreId;
                if (
                    appliedFilters.location &&
                    appliedFilters.location !== 'Toàn quốc'
                ) {
                    params.location = appliedFilters.location;
                }
                if (appliedFilters.date) params.startDate = appliedFilters.date;

                const res = await eventApi.getAll(params);

                // Tối ưu cách đọc ResultPaginationDTO từ Backend
                const data = res?.result || res?.data || res;

                if (data) {
                    // Nếu BE trả về Page object (có trường content)
                    setEvents(
                        data.content || (Array.isArray(data) ? data : [])
                    );

                    // Cập nhật phân trang từ meta hoặc trực tiếp từ Page object
                    const meta = data.meta || {};
                    setTotalPages(meta.pages || data.totalPages || 0);
                } else {
                    setEvents([]);
                }
            } catch (error) {
                console.error('Lỗi tải sự kiện:', error);
                setEvents([]);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, [appliedFilters, currentPage]);

    // --- HANDLERS ---
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

                <div className={cx('filterGroup')}>
                    <h3 className={cx('filterTitle')}>Chọn ngày</h3>
                    <input
                        type='date'
                        className={cx('filterDate')}
                        value={tempFilters.date}
                        onChange={e =>
                            setTempFilters({
                                ...tempFilters,
                                date: e.target.value
                            })
                        }
                    />
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
                        : 'Tất cả sự kiện sắp diễn ra'}
                </h2>

                {loading ? (
                    <div className={cx('loading')}>Đang tải sự kiện...</div>
                ) : (
                    <>
                        <div className={cx('eventsGrid')}>
                            {events.length > 0 ? (
                                events.map(event => (
                                    <EventCard key={event.id} data={event} />
                                ))
                            ) : (
                                <p className={cx('emptyMsg')}>
                                    Không tìm thấy sự kiện nào phù hợp.
                                </p>
                            )}
                        </div>

                        {totalPages > 1 && (
                            <div className={cx('pagination')}>
                                <button
                                    className={cx('pageBtn')}
                                    disabled={currentPage === 1}
                                    onClick={() =>
                                        handlePageChange(currentPage - 1)
                                    }
                                >
                                    &lt;
                                </button>
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
                                <button
                                    className={cx('pageBtn')}
                                    disabled={currentPage === totalPages}
                                    onClick={() =>
                                        handlePageChange(currentPage + 1)
                                    }
                                >
                                    &gt;
                                </button>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}

export default Genre;
