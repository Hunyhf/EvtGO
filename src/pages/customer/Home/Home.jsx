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
import { ticketApi } from '@apis/ticketApi';
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
                const now = dayjs(); // Lấy thời điểm hiện tại để so sánh

                const genresRes = await genresApi.getAll();
                const genres = Array.isArray(genresRes)
                    ? genresRes
                    : genresRes?.result || [];

                const sectionsWithRealData = await Promise.all(
                    genres.map(async genre => {
                        try {
                            const res = await eventApi.getAll({
                                page: 0,
                                size: 10, // Tăng size một chút để có dữ liệu sort
                                filter: `isPublished:true and genre.id:${genre.id}`
                            });

                            const eventsList =
                                res?.result?.content || res?.result || [];

                            // 1. Map dữ liệu và lấy giá vé
                            const mappedEvents = await Promise.all(
                                eventsList.map(async e => {
                                    let standardPrice = 0;
                                    try {
                                        const ticketRes =
                                            await ticketApi.getAll({
                                                filter: `event.id:${e.id} and ticketType:'STANDARD'`
                                            });
                                        const tickets =
                                            ticketRes?.result ||
                                            ticketRes?.content ||
                                            [];
                                        if (tickets.length > 0)
                                            standardPrice = tickets[0].price;
                                    } catch (err) {
                                        console.error(err);
                                    }

                                    const posterObj =
                                        e.images?.find(img => img.isCover) ||
                                        e.images?.[0];

                                    // Tạo mốc thời gian kết thúc để check quá khứ
                                    const endEvent = dayjs(
                                        e.endDate
                                            ? `${e.endDate} ${e.endTime || '23:59:59'}`
                                            : e.startDate
                                    );
                                    const startEvent = dayjs(
                                        `${e.startDate} ${e.startTime || '00:00:00'}`
                                    );

                                    return {
                                        ...e,
                                        title: e.name,
                                        price: standardPrice,
                                        url: getEventImageUrl(
                                            e.id,
                                            posterObj?.url
                                        ),
                                        isPast: now.isAfter(endEvent), // Check nếu đã kết thúc
                                        startMoment: startEvent
                                    };
                                })
                            );

                            // 2. Logic Sắp xếp theo yêu cầu của bạn
                            const sortedEvents = mappedEvents.sort((a, b) => {
                                // Nếu một cái đã qua, một cái chưa: Cái chưa qua lên trước
                                if (a.isPast !== b.isPast) {
                                    return a.isPast ? 1 : -1;
                                }

                                // Nếu cùng là tương lai: Sắp xếp gần nhất đứng trước (tăng dần)
                                if (!a.isPast) {
                                    return (
                                        a.startMoment.unix() -
                                        b.startMoment.unix()
                                    );
                                }

                                // Nếu cùng là quá khứ: Sắp xếp mới kết thúc đứng trước (giảm dần)
                                return (
                                    b.startMoment.unix() - a.startMoment.unix()
                                );
                            });

                            return { ...genre, events: sortedEvents };
                        } catch (error) {
                            return { ...genre, events: [] };
                        }
                    })
                );

                setSections(sectionsWithRealData);
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
