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
        <div className={cx('eventCard')}>
            <div className={cx('eventImage')}>
                <img src={data.url} alt={data.title} loading='lazy' />
            </div>
            <div className={cx('eventInfo')}>
                <h4 className={cx('eventTitle')}>{data.title}</h4>
                <div className={cx('eventDetails')}>
                    {/* Giá tiền ở trên với màu primary */}
                    <span className={cx('eventPrice')}>
                        {formatPrice(data.price)}
                    </span>
                    {/* Thời gian ở dưới */}
                    <span className={cx('eventDate')}>{data.date}</span>
                </div>
            </div>
        </div>
    );
};

export default memo(EventCard);
