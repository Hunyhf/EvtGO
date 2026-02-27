import { memo } from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames/bind';
import dayjs from 'dayjs';
import styles from './EventCard.module.scss';

const cx = classNames.bind(styles);

/**
 * Component hiển thị thẻ sự kiện dùng cho danh sách / grid
 * Tự động xác định trạng thái đã diễn ra hay chưa
 */
const EventCard = ({ data }) => {
    /**
     * Xác định thời điểm bắt đầu đầy đủ (ngày + giờ)
     * Nếu không có giờ bắt đầu thì mặc định 00:00:00
     */
    const fullStart = data.startDate
        ? dayjs(`${data.startDate} ${data.startTime || '00:00:00'}`)
        : null;

    /**
     * Xác định thời điểm kết thúc nếu có
     */
    const fullEnd =
        data.endTime && data.startDate
            ? dayjs(`${data.startDate} ${data.endTime}`)
            : null;

    /**
     * Kiểm tra sự kiện đã kết thúc chưa
     * - Nếu có giờ kết thúc → so sánh với thời điểm hiện tại
     * - Nếu không có giờ kết thúc → coi như kết thúc cuối ngày
     */
    const isPast = fullEnd
        ? dayjs().isAfter(fullEnd)
        : fullStart
          ? dayjs().isAfter(fullStart.endOf('day'))
          : false;

    /**
     * Xác định ảnh hiển thị (ưu tiên poster → url → ảnh mặc định)
     */
    const imageSrc =
        data.poster ||
        data.url ||
        'https://via.placeholder.com/400x250?text=No+Image';

    /**
     * Xác định tên sự kiện (fallback nếu thiếu dữ liệu)
     */
    const eventName = data.name || data.title || 'Sự kiện không tên';

    /**
     * Format giá vé theo định dạng tiền tệ VND
     */
    const formatPrice = price => {
        if (price == null || price === 0) return 'Miễn phí';

        const formatted = new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);

        return `Giá từ: ${formatted}`;
    };

    /**
     * Format ngày hiển thị theo DD/MM/YYYY
     */
    const displayDate =
        fullStart && fullStart.isValid()
            ? fullStart.format('DD/MM/YYYY')
            : data.date || 'Chưa rõ ngày';

    return (
        <Link
            to={`/event/${data.id}`}
            className={cx('eventCard', { isPastCard: isPast })}
            onClick={() => window.scrollTo(0, 0)}
        >
            <div className={cx('eventImage')}>
                <img src={imageSrc} alt={eventName} loading='lazy' />

                {/* Hiển thị nhãn nếu sự kiện đã diễn ra */}
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
