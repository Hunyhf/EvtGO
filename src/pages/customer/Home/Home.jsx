// src/pages/customer/Home/Home.jsx
import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import styles from './Home.module.scss';
import Nav from '@components/Nav/Nav.jsx'; // Nếu Nav export default thì giữ nguyên
import EventCard from '@components/EventCard/EventCard.jsx';
// FIX: Dùng Named Import vì genresApi.js không export default
import { genresApi } from '@apis/genresApi';
import { BANNER_DATA, TRENDING_DATA } from './constants';

const cx = classNames.bind(styles);

// NOTE: Nên tách hàm này ra file utils/stringUtils.js để dùng chung với Nav.jsx (DRY)
const createSlug = str => {
    if (!str) return '';
    return str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[đĐ]/g, 'd')
        .replace(/([^0-9a-z-\s])/g, '')
        .replace(/(\s+)/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
};

const swiperConfig = {
    modules: [Navigation, Pagination, Autoplay],
    spaceBetween: 20,
    slidesPerView: 1,
    loop: true,
    autoplay: { delay: 3500, disableOnInteraction: false },
    navigation: true,
    pagination: { clickable: true },
    breakpoints: {
        768: { slidesPerView: 2 },
        1024: { slidesPerView: 2, spaceBetween: 30 }
    }
};

function Home() {
    const trendingRef = useRef(null);
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadHomeData = async () => {
            try {
                setLoading(true);
                // Gọi API lấy danh sách thể loại
                const res = await genresApi.getAll(); // Đã fix import nên gọi được

                // Safety check: Đảm bảo luôn là mảng
                const genres = Array.isArray(res) ? res : res?.result || [];

                // Map dữ liệu fake event (Giữ nguyên logic cũ của bạn)
                const dataWithEvents = genres.map((genre, index) => {
                    const mockEvents = Array.from({ length: 4 }, (_, i) => ({
                        id: `mock-${genre.id}-${i}`,
                        title: `Sự kiện ${genre.name} nổi bật ${i + 1}`,
                        date: '10/02/2026',
                        price: i % 2 === 0 ? 500000 : 0,
                        url: `https://picsum.photos/400/250?random=${index * 5 + i}`
                    }));

                    return {
                        ...genre,
                        events: mockEvents
                    };
                });

                setSections(dataWithEvents);
            } catch (error) {
                console.error('>>> [Home] Lỗi tải dữ liệu:', error);
            } finally {
                setLoading(false);
            }
        };

        loadHomeData();
    }, []);

    const handleScroll = direction => {
        const { current } = trendingRef;
        if (current) {
            const scrollAmount = current.clientWidth * 0.8; // Scroll 80% chiều rộng để UX tốt hơn
            const leftPos =
                direction === 'left'
                    ? current.scrollLeft - scrollAmount
                    : current.scrollLeft + scrollAmount;

            // UX: Scroll mượt
            current.scrollTo({
                left: leftPos,
                behavior: 'smooth'
            });
        }
    };

    return (
        <main className={cx('home')}>
            <Nav />

            <div className={cx('wrapper')}>
                {/* Banner Section */}
                <section className={cx('bannerContainer')}>
                    <Swiper {...swiperConfig}>
                        {BANNER_DATA.map(banner => (
                            <SwiperSlide key={banner.id}>
                                <div className={cx('bannerItem')}>
                                    <img
                                        src={banner.url}
                                        alt='Banner'
                                        loading='lazy'
                                    />
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </section>

                {/* Trending Section */}
                <section className={cx('trendingSection')}>
                    <header className={cx('sectionHeader')}>
                        <h3 className={cx('sectionTitle')}>
                            Sự kiện đang xu hướng
                        </h3>
                    </header>
                    <div className={cx('trendingContent')}>
                        <button
                            className={cx('controlBtn', 'prev')}
                            onClick={() => handleScroll('left')}
                            aria-label='Previous slide'
                        >
                            ❮
                        </button>
                        <div
                            className={cx('eventGridManual')}
                            ref={trendingRef}
                        >
                            {TRENDING_DATA.map(item => (
                                <div
                                    key={item.id}
                                    className={cx('trendingImgWrapper')}
                                >
                                    <img
                                        src={item.url}
                                        alt={item.title}
                                        loading='lazy'
                                    />
                                </div>
                            ))}
                        </div>
                        <button
                            className={cx('controlBtn', 'next')}
                            onClick={() => handleScroll('right')}
                            aria-label='Next slide'
                        >
                            ❯
                        </button>
                    </div>
                </section>

                {/* Genres Sections */}
                {loading ? (
                    <div
                        className={cx('loadingState')}
                        style={{ textAlign: 'center', padding: '40px' }}
                    >
                        Đang tải dữ liệu...
                    </div>
                ) : (
                    sections.map(genre => {
                        const genreSlug = createSlug(genre.name);

                        return (
                            <section
                                key={genre.id}
                                className={cx('genreSection')}
                            >
                                <header className={cx('sectionHeaderGenre')}>
                                    <h3 className={cx('sectionTitle')}>
                                        {genre.name}
                                    </h3>
                                    <Link
                                        // FIX: Đồng bộ URL với Nav.jsx (/genre?id=...)
                                        to={`/genre?id=${genre.id}&name=${genreSlug}`}
                                        className={cx('viewMore')}
                                        onClick={() => window.scrollTo(0, 0)}
                                    >
                                        Xem thêm
                                    </Link>
                                </header>

                                <div className={cx('eventGridResponsive')}>
                                    {genre.events.map(event => (
                                        <div
                                            key={event.id}
                                            className={cx('gridItem')}
                                        >
                                            <EventCard data={event} />
                                        </div>
                                    ))}
                                </div>
                            </section>
                        );
                    })
                )}
            </div>
        </main>
    );
}

export default Home;
