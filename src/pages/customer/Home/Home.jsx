import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Empty } from 'antd';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import styles from './Home.module.scss';
import Nav from '@components/Nav/Nav.jsx';
import EventCard from '@components/EventCard/EventCard.jsx';
import { useHomeData } from '@hooks/useHomeData';
import { slugify } from '@utils/stringUtils';
import { BANNER_DATA, swiperConfig } from './constants';
import { eventApi } from '@apis/eventApi';
import { getEventImageUrl } from '@utils/imageHelper';

const cx = classNames.bind(styles);

function Home() {
    const trendingRef = useRef(null);
    const { sections, loading } = useHomeData();

    // State lưu danh sách sự kiện trending
    const [trendingEvents, setTrendingEvents] = useState([]);
    const [loadingTrending, setLoadingTrending] = useState(true);

    // Gọi API lấy danh sách trending khi component mount
    useEffect(() => {
        const fetchTrending = async () => {
            setLoadingTrending(true);
            const data = await eventApi.getUnifiedTrending(); // Chỉ 1 dòng duy nhất
            setTrendingEvents(data);
            setLoadingTrending(false);
        };
        fetchTrending();
    }, []);
    // Xử lý scroll ngang danh sách trending
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
            <section className={cx('bannerContainer')}>
                {loadingTrending ? (
                    <div className={cx('loadingState')}>Đang tải banner...</div>
                ) : trendingEvents.length > 0 ? (
                    <Swiper {...swiperConfig}>
                        {trendingEvents.slice(0, 10).map(event => {
                            // Lấy tên file ảnh đầu tiên (nếu có) giống như ở phần trending
                            const fileName = event.images?.[0]?.url || null;

                            // Tạo URL ảnh đầy đủ từ backend
                            const eventImageUrl = getEventImageUrl(
                                event.id,
                                fileName
                            );

                            return (
                                <SwiperSlide key={event.id}>
                                    <div className={cx('bannerItem')}>
                                        <Link to={`/event/${event.id}`}>
                                            <img
                                                src={eventImageUrl}
                                                alt={event.name}
                                                loading='lazy'
                                                onError={e => {
                                                    e.target.src =
                                                        'https://placehold.co/1200x400?text=No+Image';
                                                }}
                                            />
                                        </Link>
                                    </div>
                                </SwiperSlide>
                            );
                        })}
                    </Swiper>
                ) : null}
            </section>
            <div className={cx('wrapper')}>
                {/* Banner slider */}

                {/* Danh sách sự kiện trending */}
                {!loadingTrending && trendingEvents.length > 0 && (
                    <section className={cx('trendingSection')}>
                        <header className={cx('sectionHeader')}>
                            <h3 className={cx('sectionTitle')}>
                                Sự kiện đang xu hướng
                            </h3>
                        </header>

                        <div className={cx('trendingContent')}>
                            {/* Nút scroll trái */}
                            <button
                                className={cx('controlBtn', 'prev')}
                                onClick={() => handleScroll('left')}
                            >
                                ❮
                            </button>

                            {/* Danh sách ảnh sự kiện */}
                            <div
                                className={cx('eventGridManual')}
                                ref={trendingRef}
                            >
                                {trendingEvents.map(event => {
                                    // Lấy tên file ảnh đầu tiên (nếu có)
                                    const fileName =
                                        event.images?.[0]?.url || null;

                                    // Tạo URL ảnh đầy đủ từ backend
                                    const eventImageUrl = getEventImageUrl(
                                        event.id,
                                        fileName
                                    );

                                    return (
                                        <div
                                            key={event.id}
                                            className={cx('trendingImgWrapper')}
                                        >
                                            <Link to={`/event/${event.id}`}>
                                                <img
                                                    src={eventImageUrl}
                                                    alt={event.name}
                                                    loading='lazy'
                                                    // Ảnh fallback khi lỗi
                                                    onError={e => {
                                                        e.target.src =
                                                            'https://placehold.co/600x400?text=No+Image';
                                                    }}
                                                />
                                            </Link>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Nút scroll phải */}
                            <button
                                className={cx('controlBtn', 'next')}
                                onClick={() => handleScroll('right')}
                            >
                                ❯
                            </button>
                        </div>
                    </section>
                )}

                {/* Danh sách sự kiện theo thể loại */}
                {loading ? (
                    <div className={cx('loadingState')}>
                        Đang tải danh sách sự kiện...
                    </div>
                ) : (
                    sections.map(genre => {
                        const genreSlug = genre.slug || slugify(genre.name);

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
                                        to={`/genre/${genreSlug}`}
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
                                                <span>Chưa có sự kiện nào</span>
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
