import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import styles from './Home.module.scss';
import Nav from '@components/Nav/Nav.jsx';
import EventCard from '@components/EventCard/EventCard.jsx';
import categoryApi from '@apis/categoryApi';
import { BANNER_DATA, TRENDING_DATA } from './constants';

const cx = classNames.bind(styles);

// Cấu hình Banner Swiper
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

    useEffect(() => {
        const loadHomeData = async () => {
            try {
                // 1. Lấy danh mục thực tế từ API
                const categoryRes = await categoryApi.getAll();
                const genres = categoryRes.data || [
                    { id: 'music', name: 'Âm nhạc' },
                    { id: 'theater', name: 'Sân khấu' }
                ];

                // 2. Mock 8 sự kiện để demo hiển thị lưới
                const mockEvents = Array.from({ length: 8 }, (_, i) => ({
                    id: i + 1,
                    title: `Sự kiện tiêu biểu ${i + 1}`,
                    date: `2${i}/10/2024`,
                    price: i % 2 === 0 ? 500000 : 0,
                    url: `https://picsum.photos/400/250?random=${i + 10}`
                }));

                // Gán sự kiện vào từng danh mục
                const dataWithEvents = genres.map(genre => ({
                    ...genre,
                    events: mockEvents
                }));

                setSections(dataWithEvents);
            } catch (error) {
                console.error('Lỗi khi tải dữ liệu:', error);
            }
        };
        loadHomeData();
    }, []);

    const handleScroll = direction => {
        const { current } = trendingRef;
        if (current) {
            const scrollAmount = current.clientWidth;
            current.scrollLeft +=
                direction === 'left' ? -scrollAmount : scrollAmount;
        }
    };

    return (
        <main className={cx('home')}>
            <Nav />

            <div className={cx('wrapper')}>
                {/* Banner Section */}
                <section className={cx('banner-container')}>
                    <Swiper {...swiperConfig}>
                        {BANNER_DATA.map(banner => (
                            <SwiperSlide key={banner.id}>
                                <div className={cx('banner-item')}>
                                    <img src={banner.url} alt='Banner' />
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </section>

                {/* Trending Section */}
                <section className={cx('trending-section')}>
                    <header className={cx('section-header')}>
                        <h3 className={cx('section-title')}>
                            Sự kiện đang xu hướng
                        </h3>
                    </header>
                    <div className={cx('trending-content')}>
                        <button
                            className={cx('control-btn', 'prev')}
                            onClick={() => handleScroll('left')}
                        >
                            ❮
                        </button>
                        <div
                            className={cx('event-grid-manual')}
                            ref={trendingRef}
                        >
                            {TRENDING_DATA.map(item => (
                                <div
                                    key={item.id}
                                    className={cx('trending-img-wrapper')}
                                >
                                    <img src={item.url} alt={item.title} />
                                </div>
                            ))}
                        </div>
                        <button
                            className={cx('control-btn', 'next')}
                            onClick={() => handleScroll('right')}
                        >
                            ❯
                        </button>
                    </div>
                </section>

                {/* --- Genre Sections (Đã cập nhật) --- */}
                {sections.map(genre => (
                    <section key={genre.id} className={cx('genre-section')}>
                        <header className={cx('section-header-genre')}>
                            <h3 className={cx('section-title')}>
                                {genre.name}
                            </h3>
                            <Link
                                to={`/category/${genre.id}`}
                                className={cx('view-more')}
                            >
                                Xem thêm
                            </Link>
                        </header>

                        <div className={cx('event-grid-responsive')}>
                            {genre.events.map(event => (
                                <div key={event.id} className={cx('grid-item')}>
                                    <EventCard data={event} />
                                </div>
                            ))}
                        </div>
                    </section>
                ))}
            </div>
        </main>
    );
}

export default Home;
