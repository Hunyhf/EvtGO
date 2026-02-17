import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
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
const ITEMS_PER_PAGE = 12; // Số lượng item mỗi trang

function Genre() {
    const [searchParams, setSearchParams] = useSearchParams();

    // Lấy params từ URL (nếu có)
    const urlGenreId = searchParams.get('id');
    const urlSearchQuery = searchParams.get('q') || '';

    // State dữ liệu
    const [events, setEvents] = useState([]);
    const [genresList, setGenresList] = useState([]); // Danh sách thể loại từ API
    const [loading, setLoading] = useState(false);

    // State phân trang
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    // State bộ lọc (Temp là giá trị đang chọn chưa bấm Áp dụng)
    const [tempFilters, setTempFilters] = useState({
        location: 'Toàn quốc',
        isFree: false,
        genreId: urlGenreId || '', // Dùng genreId thay vì tên category
        date: ''
    });

    // State bộ lọc (Applied là giá trị đã bấm Áp dụng để gọi API)
    const [appliedFilters, setAppliedFilters] = useState({
        location: 'Toàn quốc',
        isFree: false,
        genreId: urlGenreId || '',
        date: '',
        search: urlSearchQuery
    });

    // 1. Fetch danh sách Thể loại (Genres) khi mount
    useEffect(() => {
        const fetchGenres = async () => {
            try {
                const res = await genresApi.getAll();
                if (res && res.result) {
                    setGenresList(res.result);
                }
            } catch (error) {
                console.error('Lỗi lấy danh sách thể loại:', error);
            }
        };
        fetchGenres();
    }, []);

    // 2. Đồng bộ URL search params vào filters khi URL thay đổi
    useEffect(() => {
        setAppliedFilters(prev => ({
            ...prev,
            genreId: urlGenreId || prev.genreId,
            search: urlSearchQuery || prev.search
        }));

        // Cập nhật luôn temp filters để UI đồng bộ
        setTempFilters(prev => ({
            ...prev,
            genreId: urlGenreId || prev.genreId
        }));
    }, [urlGenreId, urlSearchQuery]);

    // 3. Fetch Events khi filters hoặc page thay đổi
    useEffect(() => {
        const fetchEvents = async () => {
            setLoading(true);
            try {
                // Chuẩn bị params gọi API
                const params = {
                    page: currentPage, // Backend thường là page index (0 hoặc 1 tùy cấu hình, giả sử Spring Boot mặc định là 1 trong code custom của bạn hoặc bạn cần -1 nếu là JPA Pageable)
                    size: ITEMS_PER_PAGE,
                    search: appliedFilters.search,
                    sort: 'startDate,asc' // Sắp xếp theo ngày
                };

                // Thêm các filter nếu có giá trị
                if (appliedFilters.genreId) {
                    params.genreId = appliedFilters.genreId;
                }

                if (
                    appliedFilters.location &&
                    appliedFilters.location !== 'Toàn quốc'
                ) {
                    params.location = appliedFilters.location;
                }

                if (appliedFilters.date) {
                    // Format date theo yêu cầu backend (VD: YYYY-MM-DD)
                    params.startDate = appliedFilters.date;
                }

                // Gọi API
                const res = await eventApi.getAll(params);

                if (res && res.result) {
                    // Xử lý dữ liệu trả về từ ResultPaginationDTO
                    setEvents(res.result.content || res.result); // content nếu là Page, hoặc array trực tiếp

                    // Cập nhật phân trang
                    const meta = res.result.meta || {};
                    setTotalPages(meta.pages || 1);
                    setTotalElements(meta.total || 0);
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
        setAppliedFilters(prev => ({
            ...prev,
            ...tempFilters
        }));
        setCurrentPage(1); // Reset về trang 1 khi filter
    };

    const handleResetFilter = () => {
        const defaultFilters = {
            location: 'Toàn quốc',
            isFree: false,
            genreId: '',
            date: ''
        };
        setTempFilters(defaultFilters);
        setAppliedFilters(prev => ({
            ...prev,
            ...defaultFilters,
            search: '' // Reset cả search text
        }));
        // Xóa params trên URL
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
            {/* Đổi class từ categoryContainer sang genre-container cho đúng file scss mới */}

            <aside className={cx('sidebar')}>
                {/* --- LOCATION FILTER --- */}
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

                {/* --- PRICE FILTER (Nếu backend hỗ trợ lọc theo giá) --- */}
                {/* Tạm ẩn nếu chưa có API filter giá, hoặc giữ để làm UI */}
                {/* <div className={cx('filterGroup')}>
                    <h3 className={cx('filterTitle')}>Giá vé</h3>
                    <label className={cx('filterItem')}>
                        <input
                            type='checkbox'
                            checked={tempFilters.isFree}
                            onChange={e =>
                                setTempFilters({ ...tempFilters, isFree: e.target.checked })
                            }
                        />
                        <span>Sự kiện Miễn phí</span>
                    </label>
                </div> 
                */}

                {/* --- GENRE FILTER (Đã tích hợp API) --- */}
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

                {/* --- DATE FILTER --- */}
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

                {/* --- ACTIONS --- */}
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

                        {/* --- PAGINATION --- */}
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
