// src/pages/customer/Home/Home.jsx
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Empty } from 'antd';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import styles from './Home.module.scss';
import Nav from '@components/Nav/Nav.jsx';
import EventCard from '@components/EventCard/EventCard.jsx';
import { useHomeData } from '@hooks/useHomeData';
import { slugify } from '@utils/stringUtils';
import { BANNER_DATA, TRENDING_DATA, swiperConfig } from './constants';

const cx = classNames.bind(styles);

function Home() {
    const trendingRef = useRef(null);

    // Sử dụng custom hook để lấy dữ liệu
    const { sections, loading } = useHomeData();

    /**
     * Xử lý scroll ngang cho phần Trending
     */
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
                    <div className={cx('loadingState')}>
                        Đang tải danh sách sự kiện...
                    </div>
                ) : (
                    sections.map(genre => {
                        // Tạo slug an toàn (ưu tiên slug từ DB, nếu không có thì dùng slugify từ name)
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
                                    {/* CẬP NHẬT TẠI ĐÂY: Chuyển sang dùng slug thay vì ID */}
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
                                                <span>
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
