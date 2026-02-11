import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import classNames from 'classnames/bind';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import styles from './Home.module.scss';
import Nav from '@components/Nav/Nav.jsx';

const cx = classNames.bind(styles);

// --- Mock Data ---
const BANNER_DATA = [
    {
        id: 1,
        url: 'https://images.tkbcdn.com/2/614/350/ts/ds/99/bf/cc/3e72843901a98a50e12e855d3334b6b6.png'
    },
    {
        id: 2,
        url: 'https://images.tkbcdn.com/2/614/350/ts/ds/99/bf/cc/3e72843901a98a50e12e855d3334b6b6.png'
    },
    {
        id: 3,
        url: 'https://images.tkbcdn.com/2/614/350/ts/ds/99/bf/cc/3e72843901a98a50e12e855d3334b6b6.png'
    }
];

const TRENDING_DATA = Array.from({ length: 10 }).map((_, index) => ({
    id: index + 1,
    url: 'https://images.tkbcdn.com/2/614/350/ts/ds/4c/33/45/0e36aee3253a98d8bbc82d8ad2462722.png',
    title: `Sự kiện âm nhạc cực hot ${index + 1}`,
    date: '10/02/2026'
}));

const EventCard = ({ data }) => (
    <div className={cx('event-card')}>
        <div className={cx('event-image')}>
            <img src={data.url} alt={data.title} loading='lazy' />
        </div>
        <div className={cx('event-info')}>
            <h4 className={cx('event-title')}>{data.title}</h4>
            <span className={cx('event-date')}>{data.date}</span>
        </div>
    </div>
);

function Home() {
    return (
        <div className={cx('home')}>
            <Nav />
            <div className={cx('wrapper')}>
                <section className={cx('banner-container')}>
                    <Swiper
                        modules={[Navigation, Pagination, Autoplay]}
                        spaceBetween={20}
                        slidesPerView={1}
                        loop
                        autoplay={{ delay: 3500 }}
                        navigation
                        pagination={{ clickable: true }}
                        breakpoints={{ 768: { slidesPerView: 2 } }}
                    >
                        {BANNER_DATA.map(banner => (
                            <SwiperSlide key={banner.id}>
                                <div className={cx('banner-item')}>
                                    <img src={banner.url} alt='Banner' />
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </section>

                <section className={cx('trending-section')}>
                    <h3 className={cx('section-title')}>
                        Sự kiện đang xu hướng
                    </h3>
                    <div className={cx('event-grid')}>
                        {TRENDING_DATA.map(item => (
                            <EventCard key={item.id} data={item} />
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}

export default Home;
