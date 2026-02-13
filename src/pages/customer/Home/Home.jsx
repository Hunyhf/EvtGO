import { useRef } from 'react';
import classNames from 'classnames/bind';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import styles from './Home.module.scss';
import Nav from '@components/Nav/Nav.jsx';
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

    const handleScroll = direction => {
        const { current } = trendingRef;
        if (current) {
            // Cuộn theo chiều rộng của khung hiển thị để mượt mà hơn
            const scrollAmount = current.clientWidth;
            if (direction === 'left') {
                current.scrollLeft -= scrollAmount;
            } else {
                current.scrollLeft += scrollAmount;
            }
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

                    {/* Container chứa cả list ảnh và nút bấm đè lên */}
                    <div className={cx('trending-content')}>
                        <button
                            className={cx('control-btn', 'prev')}
                            onClick={() => handleScroll('left')}
                            aria-label='Previous'
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
                            aria-label='Next'
                        >
                            ❯
                        </button>
                    </div>
                </section>
            </div>
        </main>
    );
}

export default Home;
