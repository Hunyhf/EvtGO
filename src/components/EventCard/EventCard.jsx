import { memo } from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import dayjs from 'dayjs';
import styles from './EventCard.module.scss';

const cx = classNames.bind(styles);

const EventCard = ({ data }) => {
    /**
     * Dữ liệu trả về từ DB là kiểu DateTime,
     * nên ta chỉ cần parse trực tiếp startTime và endTime
     */
    const fullStart = data.startTime ? dayjs(data.startTime) : null;
    const fullEnd = data.endTime ? dayjs(data.endTime) : null;

    /**
     * Kiểm tra sự kiện đã kết thúc chưa
     */
    const isPast = fullEnd
        ? dayjs().isAfter(fullEnd)
        : fullStart
          ? dayjs().isAfter(fullStart.endOf('day'))
          : false;

    const imageSrc =
        data.poster ||
        data.url ||
        'https://via.placeholder.com/400x250?text=No+Image';

    const eventName = data.name || data.title || 'Sự kiện không tên';

    const formatPrice = price => {
        if (price == null || price === 0) return 'Miễn phí';

        const formatted = new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);

        return `Giá từ: ${formatted}`;
    };

    /**
     * Format ngày hiển thị theo DD/MM/YYYY HH:mm
     * Hiển thị thêm giờ sẽ chuyên nghiệp hơn cho sự kiện
     */
    const displayDate =
        fullStart && fullStart.isValid()
            ? fullStart.format('DD/MM/YYYY HH:mm')
            : data.date || 'Chưa rõ ngày';

    return (
        <Link
            to={`/event/${data.id}`}
            className={cx('eventCard', { isPastCard: isPast })}
            onClick={() => window.scrollTo(0, 0)}
        >
            <div className={cx('eventImage')}>
                <img src={imageSrc} alt={eventName} loading='lazy' />
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
