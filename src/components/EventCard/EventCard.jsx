// src/components/EventCard/EventCard.jsx
import { memo } from 'react';
import classNames from 'classnames/bind';
import dayjs from 'dayjs'; // Senior tip: Dùng thư viện quản lý date để tránh lỗi hiển thị
import styles from './EventCard.module.scss';

const cx = classNames.bind(styles);

const EventCard = ({ data }) => {
    // 1. CHUẨN HÓA DỮ LIỆU (Normalization)
    // Tự động lấy field đúng dù dữ liệu là Mock hay API thật
    const imageSrc =
        data.poster ||
        data.url ||
        'https://via.placeholder.com/400x250?text=No+Image';
    const eventName = data.name || data.title || 'Sự kiện không tên';
    const rawDate = data.startTime || data.date;

    // 2. FORMAT HIỂN THỊ
    const formatPrice = price => {
        if (price === 0 || !price) return 'Miễn phí';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    // Định dạng ngày tháng: Nếu là ISO string (từ API) thì format đẹp, nếu là string thường thì giữ nguyên
    const displayDate = dayjs(rawDate).isValid()
        ? dayjs(rawDate).format('DD/MM/YYYY - HH:mm')
        : rawDate;

    return (
        <div className={cx('eventCard')}>
            <div className={cx('eventImage')}>
                {/* FIX: Sử dụng imageSrc đã được chuẩn hóa ở trên */}
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
