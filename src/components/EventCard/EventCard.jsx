// src/components/EventCard/EventCard.jsx
import { memo } from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import dayjs from 'dayjs';
import styles from './EventCard.module.scss';

const cx = classNames.bind(styles);

const EventCard = ({ data }) => {
    const isPast = data.endTime ? dayjs().isAfter(dayjs(data.endTime)) : false;

    const imageSrc =
        data.poster ||
        data.url ||
        'https://via.placeholder.com/400x250?text=No+Image';

    const eventName = data.name || data.title || 'Sự kiện không tên';

    const rawDate =
        data.startDate && data.startTime
            ? `${data.startDate} ${data.startTime}`
            : data.date || data.startTime;

    const formatPrice = price => {
        if (price == null || price === 0) return 'Miễn phí';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    const parsedDate = dayjs(rawDate);
    const displayDate = parsedDate.isValid()
        ? parsedDate.format('DD/MM/YYYY')
        : rawDate;

    return (
        <Link
            to={`/event/${data.id}`}
            className={cx('eventCard', { isPastCard: isPast })} // Thêm class nếu đã diễn ra
            onClick={() => window.scrollTo(0, 0)}
        >
            <div className={cx('eventImage')}>
                <img src={imageSrc} alt={eventName} loading='lazy' />

                {/* 2. Hiển thị nhãn Đã diễn ra ở góc phải */}
                {isPast && <div className={cx('pastLabel')}>Đã diễn ra</div>}
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
