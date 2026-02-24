// src/components/EventCard/EventCard.jsx
import { memo } from 'react';
import { Link } from 'react-router-dom'; // Thêm import Link
import classNames from 'classnames/bind';
import dayjs from 'dayjs';
import styles from './EventCard.module.scss';

const cx = classNames.bind(styles);

const EventCard = ({ data }) => {
    // Normalize dữ liệu để tương thích mock/API
    const imageSrc =
        data.poster ||
        data.url ||
        'https://via.placeholder.com/400x250?text=No+Image';

    const eventName = data.name || data.title || 'Sự kiện không tên';

    const rawDate =
        data.startDate && data.startTime
            ? `${data.startDate} ${data.startTime}`
            : data.date || data.startTime;

    // Format giá hiển thị
    const formatPrice = price => {
        if (price == null || price === 0) return 'Miễn phí';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    // Format ngày nếu hợp lệ
    const parsedDate = dayjs(rawDate);
    const displayDate = parsedDate.isValid()
        ? parsedDate.format('DD/MM/YYYY')
        : rawDate;

    return (
        // Bọc toàn bộ Card bằng Link trỏ đến /event/:id
        <Link
            to={`/event/${data.id}`}
            className={cx('eventCard')}
            onClick={() => window.scrollTo(0, 0)} // Tự động cuộn lên đầu trang khi chuyển trang
        >
            <div className={cx('eventImage')}>
                <img src={imageSrc} alt={eventName} loading='lazy' />
            </div>
            <div className={cx('eventInfo')}>
                <h4 className={cx('eventTitle')}>{eventName}</h4>
                <div className={cx('eventDetails')}>
                    <span className={cx('eventPrice')}>
                        {formatPrice(data.price)}
                    </span>
                    <span className={cx('eventDate')}>{displayDate}</span>
                </div>
            </div>
        </Link>
    );
};

export default memo(EventCard);
