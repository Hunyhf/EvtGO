// src/pages/customer/Home/Home.jsx
import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import styles from './Home.module.scss';
import Nav from '@components/Nav/Nav.jsx';
import EventCard from '@components/EventCard/EventCard.jsx';
import categoryApi from '@apis/categoryApi';
import { BANNER_DATA, TRENDING_DATA } from './constants';

const cx = classNames.bind(styles);

// --- HÀM HỖ TRỢ TẠO SLUG ---
// Chuyển "Thể thao" -> "the-thao"
const createSlug = str => {
    if (!str) return '';
    return str
        .toLowerCase()
        .normalize('NFD') // Tách các dấu ra khỏi chữ cái
        .replace(/[\u0300-\u036f]/g, '') // Xóa các dấu vừa tách
        .replace(/[đĐ]/g, 'd') // Xử lý riêng chữ đ
        .replace(/([^0-9a-z-\s])/g, '') // Xóa ký tự đặc biệt
        .replace(/(\s+)/g, '-') // Thay khoảng trắng bằng dấu -
        .replace(/-+/g, '-') // Xử lý trường hợp nhiều dấu - liên tiếp
        .replace(/^-+|-+$/g, ''); // Xóa dấu - ở đầu và cuối
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
                const categoryRes = await categoryApi.getAll();
                const genres = categoryRes.result || categoryRes.data || [];

                const dataWithEvents = genres.map((genre, index) => {
                    const mockEvents = Array.from({ length: 4 }, (_, i) => ({
                        id: `mock-${genre.id}-${i}`,
                        title: `Sự kiện ${genre.name} nổi bật ${i + 1}`,
                        date: '10/02/2026',
                        price: i % 2 === 0 ? 500000 : 0,
                        url: `https://picsum.photos/400/250?random=${index * 5 + i}`
                    }));

                    return {
                        ...genre,
                        events: mockEvents
                    };
                });

                setSections(dataWithEvents);
            } catch (error) {
                console.error('Lỗi khi tải dữ liệu genres:', error);
            } finally {
                setLoading(false);
            }
        };
        loadHomeData();
    }, []);

    const handleScroll = direction => {
        const { current } = trendingRef;
        if (current) {
            const scrollAmount = current.clientWidth;
            current.scrollLeft +=
                direction === 'left' ? -scrollAmount : scrollAmount;
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
                                    <img src={banner.url} alt='Banner' />
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
                                    <img src={item.url} alt={item.title} />
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

                {/* HIỂN THỊ CÁC PHẦN THEO GENRE TỪ API */}
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        Đang tải...
                    </div>
                ) : (
                    sections.map(genre => {
                        // Tạo slug từ tên thể loại để đưa vào URL
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
                                    {/* Cập nhật đường dẫn dạng query param ?name=slug */}
                                    <Link
                                        to={`/category?name=${genreSlug}`}
                                        className={cx('viewMore')}
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
