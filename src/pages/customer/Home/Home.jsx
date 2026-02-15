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
import Nav from '@components/Nav/Nav.jsx';
import EventCard from '@components/EventCard/EventCard.jsx';
import categoryApi from '@apis/categoryApi';
import { BANNER_DATA, TRENDING_DATA } from './constants';

const cx = classNames.bind(styles);

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
                // 1. Lấy danh sách thể loại thật từ API
                const categoryRes = await categoryApi.getAll();
                const genres = categoryRes.result || categoryRes.data || [];

                // 2. Tạo logic gắn data mock cho từng thể loại
                const dataWithEvents = genres.map((genre, index) => {
                    // Tạo mảng 4 sự kiện giả cho mỗi thể loại để hiển thị
                    const mockEvents = Array.from({ length: 4 }, (_, i) => ({
                        id: `${genre.id}-${i}`,
                        title: `Sự kiện ${genre.name} tiêu biểu ${i + 1}`,
                        date: `2${i}/10/2024`,
                        price: i % 2 === 0 ? 500000 : 0,
                        url: `https://picsum.photos/400/250?random=${index * 10 + i}`
                    }));

                    return {
                        ...genre,
                        events: mockEvents
                    };
                });

                setSections(dataWithEvents);
            } catch (error) {
                console.error('Lỗi khi tải dữ liệu trang chủ:', error);
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
                <section className={cx('bannerContainer')}>
                    <Swiper {...swiperConfig}>
                        {BANNER_DATA.map(banner => (
                            <SwiperSlide key={banner.id}>
                                <div className={cx('bannerItem')}>
                                    <img src={banner.url} alt='Banner' />
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
                                    <img src={item.url} alt={item.title} />
                                </div>
                            ))}
                        </div>
                        <button
                            className={cx('controlBtn', 'next')}
                            onClick={() => handleScroll('right')}
                        >
                            ❯
                        </button>
                    </div>
                </section>

                {/* Hiển thị danh sách các Genre động với "Xem thêm" */}
                {sections.map(genre => (
                    <section key={genre.id} className={cx('genreSection')}>
                        <header className={cx('sectionHeaderGenre')}>
                            <h3 className={cx('sectionTitle')}>{genre.name}</h3>
                            <Link
                                to={`/category/${genre.id}`}
                                className={cx('viewMore')}
                            >
                                Xem thêm
                            </Link>
                        </header>

                        <div className={cx('eventGridResponsive')}>
                            {genre.events.map(event => (
                                <div key={event.id} className={cx('gridItem')}>
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
