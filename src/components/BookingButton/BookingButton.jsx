import React from 'react';
import { Button } from 'antd';
import classNames from 'classnames/bind';
import styles from './BookingButton.module.scss';

const cx = classNames.bind(styles);

const BookingButton = ({
    isPast,
    isUpcoming, // Thêm prop mới
    onClick,
    label = 'MUA VÉ NGAY',
    pastLabel = 'ĐÃ DIỄN RA',
    upcomingLabel = 'SẮP MỞ BÁN', // Nhãn mặc định cho trạng thái sắp bán
    variant = 'primary',
    className,
    ...props
}) => {
    // Xác định nhãn hiển thị dựa trên trạng thái
    const getButtonLabel = () => {
        if (isPast) return pastLabel;
        if (isUpcoming) return upcomingLabel;
        return label;
    };

    // Nút sẽ bị vô hiệu hóa nếu đã qua hoặc chưa mở bán
    const isDisabled = isPast || isUpcoming;

    return (
        <Button
            shape='round'
            disabled={isDisabled}
            onClick={onClick}
            className={cx('bookingBtn', variant, className, {
                isPastBtn: isPast,
                isUpcomingBtn: isUpcoming // Class CSS riêng cho sắp mở bán
            })}
            {...props}
        >
            {getButtonLabel()}
        </Button>
    );
};

export default BookingButton;
