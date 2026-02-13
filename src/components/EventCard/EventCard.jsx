import { memo } from 'react';
import classNames from 'classnames/bind';
import styles from './EventCard.module.scss';

const cx = classNames.bind(styles);

const EventCard = ({ data }) => {
    // Hàm định dạng tiền tệ Việt Nam
    const formatPrice = price => {
        if (!price || price === 0) return 'Miễn phí';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    return (
        <div className={cx('event-card')}>
            <div className={cx('event-image')}>
                <img src={data.url} alt={data.title} loading='lazy' />
            </div>
            <div className={cx('event-info')}>
                <h4 className={cx('event-title')}>{data.title}</h4>
                <div className={cx('event-details')}>
                    {/* Giá tiền ở trên với màu primary */}
                    <span className={cx('event-price')}>
                        {formatPrice(data.price)}
                    </span>
                    {/* Thời gian ở dưới */}
                    <span className={cx('event-date')}>{data.date}</span>
                </div>
            </div>
        </div>
    );
};

export default memo(EventCard);
