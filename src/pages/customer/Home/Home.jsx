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
import { getEventImageUrl } from '@utils/imageHelper';

const cx = classNames.bind(styles);

/**
 * Tạo slug từ chuỗi tiếng Việt
 * - Chuẩn hóa Unicode
 * - Xóa ký tự đặc biệt
 * - Thay khoảng trắng bằng dấu "-"
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
    /**
     * Ref dùng để điều khiển scroll ngang của Trending Section
     */
    const trendingRef = useRef(null);

    /**
     * State lưu danh sách các section theo thể loại
     */
    const [sections, setSections] = useState([]);

    /**
     * State kiểm soát trạng thái loading dữ liệu
     */
    const [loading, setLoading] = useState(true);

    /**
     * Tải dữ liệu trang Home:
     * - Lấy danh sách thể loại
     * - Lấy toàn bộ sự kiện
     * - Lọc sự kiện đã duyệt và chưa diễn ra
     * - Gom sự kiện theo từng thể loại
     */
    useEffect(() => {
        const loadHomeData = async () => {
            try {
                setLoading(true);

                const now = dayjs();

                const [genresRes, eventsRes] = await Promise.all([
                    genresApi.getAll(),
                    eventApi.getAll({ page: 1, size: 200 })
                ]);

                const genres = Array.isArray(genresRes)
                    ? genresRes
                    : genresRes?.result || [];

                const allRawEvents =
                    eventsRes?.result ||
                    eventsRes?.content ||
                    eventsRes?.data ||
                    [];

                /**
                 * Lọc sự kiện hợp lệ:
                 * - Đã được duyệt (published === true)
                 * - Thời gian bắt đầu còn trong tương lai
                 */
                const validRealEvents = allRawEvents.filter(e => {
                    const isApproved = e.published === true;

                    const eventTime = dayjs(
                        `${e.startDate} ${e.startTime || '00:00:00'}`
                    );

                    return isApproved && eventTime.isAfter(now);
                });

                /**
                 * Xây dựng danh sách section theo từng thể loại
                 */
                const dataWithEvents = genres.map((genre, index) => {
                    const realEventsInGenre = validRealEvents
                        .filter(e => String(e.genreId) === String(genre.id))
                        .map(e => {
                            const posterObj =
                                e.images?.find(img => img.isCover) ||
                                e.images?.[0];

                            return {
                                ...e,
                                title: e.name,
                                date: `${e.startDate} ${
                                    e.startTime || '00:00:00'
                                }`,
                                startTime: null,
                                price: 0,
                                url: getEventImageUrl(e.id, posterObj?.url)
                            };
                        });

                    /**
                     * Nếu có dữ liệu thực → lấy tối đa 4 sự kiện
                     * Nếu không có → tạo mock để tránh UI trống
                     */
                    let finalEvents = [];

                    if (realEventsInGenre.length > 0) {
                        finalEvents = realEventsInGenre.slice(0, 4);
                    } else {
                        finalEvents = Array.from({ length: 4 }, (_, i) => ({
                            id: `mock-${genre.id}-${i}`,
                            title: `Sự kiện ${genre.name} tiêu biểu ${i + 1}`,
                            date: '25/12/2026',
                            price: i % 2 === 0 ? 250000 : 0,
                            url: `https://picsum.photos/400/250?random=${
                                index * 10 + i
                            }`
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

    /**
     * Điều khiển scroll ngang của Trending Section
     */
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
            {/* Thanh điều hướng chính */}
            <Nav />

            <div className={cx('wrapper')}>
                {/* Section Banner hiển thị slider quảng cáo */}
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

                {/* Section hiển thị sự kiện xu hướng */}
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

                {/* Section hiển thị sự kiện theo từng thể loại */}
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
