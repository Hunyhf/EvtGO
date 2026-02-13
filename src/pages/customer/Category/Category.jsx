import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './Category.module.scss';
import EventCard from '../../../components/EventCard/EventCard';

const cx = classNames.bind(styles);

// 1. Tạo dữ liệu giả (Mock API)
const generateMockEvents = () => {
    const locations = ['Hồ Chí Minh', 'Hà Nội', 'Đà Lạt', 'Khác'];
    const categoriesList = ['Âm nhạc', 'Workshop', 'Thể thao', 'Nghệ thuật'];

    return Array.from({ length: 65 }).map((_, index) => {
        // Tạo ngày ngẫu nhiên trong tương lai (từ hôm nay đến 30 ngày sau)
        const dateOffset = Math.floor(Math.random() * 30);
        const eventDate = new Date();
        eventDate.setDate(eventDate.getDate() + dateOffset);

        return {
            id: index + 1,
            title: `Sự kiện âm nhạc và giải trí số ${index + 1}`,
            url: `https://picsum.photos/seed/${index}/300/200`, // Ảnh ngẫu nhiên
            price: index % 4 === 0 ? 0 : 150000 + index * 10000, // Cứ 4 event thì có 1 event miễn phí
            date: eventDate.toLocaleDateString('vi-VN'),
            rawDate: eventDate.getTime(), // Dùng để sắp xếp
            location: locations[Math.floor(Math.random() * locations.length)],
            category:
                categoriesList[
                    Math.floor(Math.random() * categoriesList.length)
                ]
        };
    });
};

const LOCATIONS = ['Toàn quốc', 'Hồ Chí Minh', 'Hà Nội', 'Đà Lạt', 'Khác'];
const CATEGORIES = ['Âm nhạc', 'Workshop', 'Thể thao', 'Nghệ thuật'];
const ITEMS_PER_PAGE = 20;

function Category() {
    const locationHook = useLocation();
    const searchParams = new URLSearchParams(locationHook.search);
    const searchQuery = searchParams.get('q') || ''; // Lấy từ khóa từ Header nếu có

    // States
    const [allEvents, setAllEvents] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);

    // States cho form filter (chưa áp dụng)
    const [tempFilters, setTempFilters] = useState({
        location: 'Toàn quốc',
        isFree: false,
        category: '',
        date: ''
    });

    // States filter đang được áp dụng
    const [appliedFilters, setAppliedFilters] = useState({
        location: 'Toàn quốc',
        isFree: false,
        category: '',
        date: ''
    });

    // Gọi Mock API lần đầu
    useEffect(() => {
        const fetchEvents = () => {
            const data = generateMockEvents();
            // Sắp xếp thời gian từ gần nhất đến xa nhất so với hiện tại
            const sortedData = data.sort((a, b) => a.rawDate - b.rawDate);
            setAllEvents(sortedData);
        };
        fetchEvents();
    }, []);

    // Xử lý Lọc dữ liệu
    const filteredEvents = useMemo(() => {
        return allEvents.filter(event => {
            // 1. Lọc theo từ khóa tìm kiếm (Header)
            if (
                searchQuery &&
                !event.title.toLowerCase().includes(searchQuery.toLowerCase())
            ) {
                return false;
            }
            // 2. Lọc theo vị trí
            if (
                appliedFilters.location !== 'Toàn quốc' &&
                event.location !== appliedFilters.location
            ) {
                return false;
            }
            // 3. Lọc theo giá (Miễn phí)
            if (appliedFilters.isFree && event.price > 0) {
                return false;
            }
            // 4. Lọc theo thể loại
            if (
                appliedFilters.category &&
                event.category !== appliedFilters.category
            ) {
                return false;
            }
            // 5. Lọc theo ngày chọn
            if (appliedFilters.date) {
                const filterDate = new Date(
                    appliedFilters.date
                ).toLocaleDateString('vi-VN');
                if (event.date !== filterDate) return false;
            }
            return true;
        });
    }, [allEvents, appliedFilters, searchQuery]);

    // Phân trang (20 items/page)
    const totalPages = Math.ceil(filteredEvents.length / ITEMS_PER_PAGE);
    const displayedEvents = filteredEvents.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // Xử lý Actions
    const handleApplyFilter = () => {
        setAppliedFilters(tempFilters);
        setCurrentPage(1); // Reset về trang 1 khi filter
    };

    const handleResetFilter = () => {
        const defaultFilters = {
            location: 'Toàn quốc',
            isFree: false,
            category: '',
            date: ''
        };
        setTempFilters(defaultFilters);
        setAppliedFilters(defaultFilters);
        setCurrentPage(1);
    };

    return (
        <div className={cx('category-container')}>
            {/* CỘT TRÁI: FILTER */}
            <aside className={cx('sidebar')}>
                <div className={cx('filter-group')}>
                    <h3 className={cx('filter-title')}>Vị trí</h3>
                    <ul className={cx('filter-list')}>
                        {LOCATIONS.map(loc => (
                            <li key={loc} className={cx('filter-item')}>
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

                <div className={cx('filter-group')}>
                    <h3 className={cx('filter-title')}>Giá vé</h3>
                    <label className={cx('filter-item')}>
                        <input
                            type='checkbox'
                            checked={tempFilters.isFree}
                            onChange={e =>
                                setTempFilters({
                                    ...tempFilters,
                                    isFree: e.target.checked
                                })
                            }
                        />
                        <span>Sự kiện Miễn phí</span>
                    </label>
                </div>

                <div className={cx('filter-group')}>
                    <h3 className={cx('filter-title')}>Thể loại</h3>
                    <select
                        className={cx('filter-select')}
                        value={tempFilters.category}
                        onChange={e =>
                            setTempFilters({
                                ...tempFilters,
                                category: e.target.value
                            })
                        }
                    >
                        <option value=''>Tất cả thể loại</option>
                        {CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>
                                {cat}
                            </option>
                        ))}
                    </select>
                </div>

                <div className={cx('filter-group')}>
                    <h3 className={cx('filter-title')}>Chọn ngày</h3>
                    <input
                        type='date'
                        className={cx('filter-date')}
                        value={tempFilters.date}
                        onChange={e =>
                            setTempFilters({
                                ...tempFilters,
                                date: e.target.value
                            })
                        }
                    />
                </div>

                <div className={cx('filter-actions')}>
                    <button
                        className={cx('btn-reset')}
                        onClick={handleResetFilter}
                    >
                        Thiết lập lại
                    </button>
                    <button
                        className={cx('btn-apply')}
                        onClick={handleApplyFilter}
                    >
                        Áp dụng
                    </button>
                </div>
            </aside>

            {/* CỘT PHẢI: DANH SÁCH SỰ KIỆN */}
            <main className={cx('main-content')}>
                <h2 className={cx('page-title')}>
                    {searchQuery
                        ? `Kết quả tìm kiếm cho: "${searchQuery}"`
                        : 'Tất cả sự kiện sắp diễn ra'}
                </h2>
                <div className={cx('events-grid')}>
                    {displayedEvents.length > 0 ? (
                        displayedEvents.map(event => (
                            <EventCard key={event.id} data={event} />
                        ))
                    ) : (
                        <p className={cx('empty-msg')}>
                            Không tìm thấy sự kiện nào phù hợp.
                        </p>
                    )}
                </div>

                {/* Phân trang */}
                {totalPages > 1 && (
                    <div className={cx('pagination')}>
                        {Array.from({ length: totalPages }).map((_, idx) => (
                            <button
                                key={idx}
                                className={cx('page-btn', {
                                    active: currentPage === idx + 1
                                })}
                                onClick={() => setCurrentPage(idx + 1)}
                            >
                                {idx + 1}
                            </button>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}

export default Category;
