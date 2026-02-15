import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import classNames from 'classnames/bind';
import styles from './Category.module.scss';
import EventCard from '@components/EventCard/EventCard';

const cx = classNames.bind(styles);

// Dữ liệu giả (Giữ nguyên logic của bạn)
const generateMockEvents = () => {
    const locations = ['Hồ Chí Minh', 'Hà Nội', 'Đà Lạt', 'Khác'];
    const categoriesList = ['Âm nhạc', 'Workshop', 'Thể thao', 'Nghệ thuật'];

    return Array.from({ length: 65 }).map((_, index) => {
        const dateOffset = Math.floor(Math.random() * 30);
        const eventDate = new Date();
        eventDate.setDate(eventDate.getDate() + dateOffset);

        return {
            id: index + 1,
            title: `Sự kiện âm nhạc và giải trí số ${index + 1}`,
            url: `https://picsum.photos/seed/${index}/300/200`,
            price: index % 4 === 0 ? 0 : 150000 + index * 10000,
            date: eventDate.toLocaleDateString('vi-VN'),
            rawDate: eventDate.getTime(),
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
    const searchQuery = searchParams.get('q') || '';

    const [allEvents, setAllEvents] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);

    const [tempFilters, setTempFilters] = useState({
        location: 'Toàn quốc',
        isFree: false,
        category: '',
        date: ''
    });

    const [appliedFilters, setAppliedFilters] = useState({
        location: 'Toàn quốc',
        isFree: false,
        category: '',
        date: ''
    });

    useEffect(() => {
        const data = generateMockEvents();
        const sortedData = data.sort((a, b) => a.rawDate - b.rawDate);
        setAllEvents(sortedData);
    }, []);

    const filteredEvents = useMemo(() => {
        return allEvents.filter(event => {
            if (
                searchQuery &&
                !event.title.toLowerCase().includes(searchQuery.toLowerCase())
            ) {
                return false;
            }
            if (
                appliedFilters.location !== 'Toàn quốc' &&
                event.location !== appliedFilters.location
            ) {
                return false;
            }
            if (appliedFilters.isFree && event.price > 0) {
                return false;
            }
            if (
                appliedFilters.category &&
                event.category !== appliedFilters.category
            ) {
                return false;
            }
            if (appliedFilters.date) {
                const filterDate = new Date(
                    appliedFilters.date
                ).toLocaleDateString('vi-VN');
                if (event.date !== filterDate) return false;
            }
            return true;
        });
    }, [allEvents, appliedFilters, searchQuery]);

    const totalPages = Math.ceil(filteredEvents.length / ITEMS_PER_PAGE);
    const displayedEvents = filteredEvents.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handleApplyFilter = () => {
        setAppliedFilters(tempFilters);
        setCurrentPage(1);
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
        <div className={cx('categoryContainer')}>
            {' '}
            {/* Đổi từ category-container */}
            <aside className={cx('sidebar')}>
                <div className={cx('filterGroup')}>
                    {' '}
                    {/* Đổi từ filter-group */}
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
                    <h3 className={cx('filterTitle')}>Giá vé</h3>
                    <label className={cx('filterItem')}>
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

                <div className={cx('filterGroup')}>
                    <h3 className={cx('filterTitle')}>Thể loại</h3>
                    <select
                        className={cx('filterSelect')}
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
                {' '}
                {/* Đổi từ main-content */}
                <h2 className={cx('pageTitle')}>
                    {searchQuery
                        ? `Kết quả tìm kiếm cho: "${searchQuery}"`
                        : 'Tất cả sự kiện sắp diễn ra'}
                </h2>
                <div className={cx('eventsGrid')}>
                    {displayedEvents.length > 0 ? (
                        displayedEvents.map(event => (
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
                        {Array.from({ length: totalPages }).map((_, idx) => (
                            <button
                                key={idx}
                                className={cx('pageBtn', {
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
