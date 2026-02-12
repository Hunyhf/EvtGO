import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import classNames from 'classnames/bind';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import styles from './Home.module.scss';
import Nav from '@components/Nav/Nav.jsx';
import EventCard from '@components/EventCard/EventCard.jsx';
import { BANNER_DATA, TRENDING_DATA } from './constants';

const cx = classNames.bind(styles);

function Home() {
    // Cấu hình Swiper tách biệt để dễ bảo trì
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

    return (
        <main className={cx('home')}>
            <Nav />

            <div className={cx('wrapper')}>
                {/* Banner Section */}
                <section
                    className={cx('banner-container')}
                    aria-label='Featured Banners'
                >
                    <Swiper {...swiperConfig}>
                        {BANNER_DATA.map(banner => (
                            <SwiperSlide key={banner.id}>
                                <div className={cx('banner-item')}>
                                    <img
                                        src={banner.url}
                                        alt={`Promotion ${banner.id}`}
                                    />
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
                        {/* Có thể thêm nút "Xem tất cả" tại đây */}
                    </header>

                    <div className={cx('event-grid')}>
                        {TRENDING_DATA.map(item => (
                            <EventCard key={item.id} data={item} />
                        ))}
                    </div>
                </section>
            </div>
        </main>
    );
}

export default Home;
