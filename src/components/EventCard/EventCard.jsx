import { memo } from 'react';
import classNames from 'classnames/bind';
import styles from './EventCard.module.scss';

const cx = classNames.bind(styles);

const EventCard = ({ data }) => {
    return (
        <div className={cx('event-card')}>
            <div className={cx('event-image')}>
                <img src={data.url} alt={data.title} loading='lazy' />
            </div>
            <div className={cx('event-info')}>
                <h4 className={cx('event-title')}>{data.title}</h4>
                <span className={cx('event-date')}>{data.date}</span>
            </div>
        </div>
    );
};

export default memo(EventCard);
