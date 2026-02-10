import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import classNames from 'classnames/bind';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import styles from './Home.module.scss';
import Nav from '@components/Nav/Nav.jsx';

const cx = classNames.bind(styles);

// Dữ liệu Banner mẫu
const BANNER_DATA = [
    {
        id: 1,
        url: 'https://images.tkbcdn.com/2/614/350/ts/ds/99/bf/cc/3e72843901a98a50e12e855d3334b6b6.png'
    },
    {
        id: 2,
        url: 'https://images.tkbcdn.com/2/614/350/ts/ds/4c/33/45/0e36aee3253a98d8bbc82d8ad2462722.png'
    },
    {
        id: 3,
        url: 'https://images.tkbcdn.com/2/614/350/ts/ds/99/bf/cc/3e72843901a98a50e12e855d3334b6b6.png'
    }
];

function Home() {
    return (
        <div className={cx('home')}>
            <Nav />
            <div className={cx('wrapper')}>
                <div className={cx('banner-container')}>
                    <Swiper
                        modules={[Navigation, Pagination, Autoplay]}
                        spaceBetween={20} // Khoảng cách 2rem giữa các slide
                        slidesPerView={2} // Mặc định hiện 2 ảnh
                        slidesPerGroup={1} // Mỗi lần bấm qua chỉ trượt 1 ảnh
                        navigation // Hiện nút bấm < >
                        pagination={{ clickable: true }} // Hiện dấu chấm điều hướng
                        autoplay={{ delay: 3500 }} // Tự động chạy sau 3.5s
                        loop={true} // Chạy vòng lặp vô tận
                        breakpoints={{
                            0: { slidesPerView: 1 }, // Dưới 768px hiện 1 ảnh
                            768: { slidesPerView: 2 } // Trên 768px hiện 2 ảnh
                        }}
                        className={cx('swiper')}
                    >
                        {BANNER_DATA.map(banner => (
                            <SwiperSlide key={banner.id}>
                                <div className={cx('banner-item')}>
                                    <img
                                        src={banner.url}
                                        alt={`Banner ${banner.id}`}
                                    />
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            </div>
        </div>
    );
}

export default Home;
