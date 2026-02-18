// src/pages/customer/Home/Home.jsx
import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import dayjs from 'dayjs';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import styles from './Home.module.scss';
import Nav from '@components/Nav/Nav.jsx';
import EventCard from '@components/EventCard/EventCard.jsx';
import { genresApi } from '@apis/genresApi';
import { eventApi } from '@apis/eventApi';
import { BANNER_DATA, TRENDING_DATA } from './constants';

const cx = classNames.bind(styles);

const BASE_URL_IMAGE = 'http://localhost:8080/api/v1/files';

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
                const now = dayjs();

                // 1. Gọi API lấy Thể loại và Sự kiện
                const [genresRes, eventsRes] = await Promise.all([
                    genresApi.getAll(),
                    eventApi.getAll({ page: 1, size: 200 }) // Lấy số lượng lớn để phân loại
                ]);

                const genres = Array.isArray(genresRes)
                    ? genresRes
                    : genresRes?.result || [];
                const allRawEvents =
                    eventsRes?.result ||
                    eventsRes?.content ||
                    eventsRes?.data ||
                    [];

                // 2. Lọc sự kiện thực: Đã DUYỆT và CHƯA DIỄN RA
                const validRealEvents = allRawEvents.filter(e => {
                    const isApproved = e.published === true;
                    const eventTime = dayjs(
                        `${e.startDate} ${e.startTime || '00:00:00'}`
                    );
                    return isApproved && eventTime.isAfter(now);
                });

                // 3. Xây dựng các Section
                const dataWithEvents = genres.map((genre, index) => {
                    // Tìm các sự kiện thực thuộc Genre này
                    const realEventsInGenre = validRealEvents
                        .filter(e => String(e.genreId) === String(genre.id))
                        .map(e => {
                            const posterObj =
                                e.images?.find(img => img.isCover) ||
                                e.images?.[0];
                            return {
                                ...e,
                                title: e.name,
                                date: dayjs(e.startDate).format('DD/MM/YYYY'),
                                price: 0,
                                url: posterObj?.url
                                    ? `${BASE_URL_IMAGE}/${posterObj.url}`
                                    : 'https://placehold.co/400x250?text=No+Image'
                            };
                        });

                    // Logic: Nếu có dữ liệu thực thì dùng, nếu không thì dùng Mock API cho đỡ trống
                    let finalEvents = [];
                    if (realEventsInGenre.length > 0) {
                        finalEvents = realEventsInGenre.slice(0, 4);
                    } else {
                        // TẠO MOCK DATA NẾU DANH MỤC TRỐNG
                        finalEvents = Array.from({ length: 4 }, (_, i) => ({
                            id: `mock-${genre.id}-${i}`,
                            title: `Sự kiện ${genre.name} tiêu biểu ${i + 1}`,
                            date: '25/12/2026',
                            price: i % 2 === 0 ? 250000 : 0,
                            url: `https://picsum.photos/400/250?random=${index * 10 + i}`
                        }));
                    }

                    return {
                        ...genre,
                        events: finalEvents
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
            const scrollAmount = current.clientWidth * 0.8;
            const leftPos =
                direction === 'left'
                    ? current.scrollLeft - scrollAmount
                    : current.scrollLeft + scrollAmount;

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
                        >
                            ❯
                        </button>
                    </div>
                </section>

                {/* Genres Sections */}
                {loading ? (
                    <div
                        className={cx('loadingState')}
                        style={{
                            textAlign: 'center',
                            padding: '60px',
                            color: '#fff'
                        }}
                    >
                        Đang tải danh sách sự kiện...
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
