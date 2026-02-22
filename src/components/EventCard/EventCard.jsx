// src/components/EventCard/EventCard.jsx
import { memo } from 'react';
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
    const rawDate = data.startTime || data.date;

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
        ? parsedDate.format('DD/MM/YYYY - HH:mm')
        : rawDate;

    return (
        <div className={cx('eventCard')}>
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
        </div>
    );
};

export default memo(EventCard);
