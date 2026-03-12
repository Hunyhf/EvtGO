// src/pages/customer/Home/Home.jsx
import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { Empty } from 'antd'; // Sử dụng component Empty để hiển thị khi không có dữ liệu
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
import { getEventImageUrl } from '@utils/imageHelper';

const cx = classNames.bind(styles);

/**
 * Tạo slug từ chuỗi tiếng Việt
 */
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

/**
 * Cấu hình chung cho Swiper Banner
 */
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

                // 1. Lấy tất cả danh sách thể loại
                const genresRes = await genresApi.getAll();
                const genres = Array.isArray(genresRes)
                    ? genresRes
                    : genresRes?.result || [];

                // 2. Gọi API lấy sự kiện cho TẤT CẢ các thể loại
                const sectionsWithRealData = await Promise.all(
                    genres.map(async genre => {
                        try {
                            const res = await eventApi.getAll({
                                page: 0,
                                size: 4,
                                filter: `isPublished:true and genre.id:${genre.id}`
                            });

                            const eventsList =
                                res?.result?.content || res?.result || [];

                            const mappedEvents = eventsList.map(e => {
                                const posterObj =
                                    e.images?.find(img => img.isCover) ||
                                    e.images?.[0];
                                return {
                                    ...e,
                                    title: e.name,
                                    price: e.minPrice || 0,
                                    url: getEventImageUrl(e.id, posterObj?.url)
                                };
                            });

                            return {
                                ...genre,
                                events: mappedEvents
                            };
                        } catch (error) {
                            console.error(
                                `Lỗi tải cho genre ${genre.id}:`,
                                error
                            );
                            return { ...genre, events: [] };
                        }
                    })
                );

                // Lưu toàn bộ danh sách, không lọc bỏ genre trống nữa
                setSections(sectionsWithRealData);
            } catch (error) {
                console.error('>>> [Home] Lỗi tải dữ liệu tổng thể:', error);
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
            current.scrollTo({ left: leftPos, behavior: 'smooth' });
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

                {/* Dynamic Genre Sections */}
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

                                {genre.events.length > 0 ? (
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
                                ) : (
                                    <div className={cx('emptyState')}>
                                        <Empty
                                            description={
                                                <span style={{ color: '#aaa' }}>
                                                    Chưa có sự kiện nào cho thể
                                                    loại này
                                                </span>
                                            }
                                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                                        />
                                    </div>
                                )}
                            </section>
                        );
                    })
                )}
            </div>
        </main>
    );
}

export default Home;
