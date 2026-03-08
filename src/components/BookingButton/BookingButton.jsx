// src/components/BookingButton/BookingButton.jsx
import React from 'react';
import { Button } from 'antd';
import classNames from 'classnames/bind';
import styles from './BookingButton.module.scss';

const cx = classNames.bind(styles);

const BookingButton = ({
    isPast, // Trạng thái sự kiện đã diễn ra
    isUpcoming, // Trạng thái sự kiện sắp mở bán
    isSoldOut, // Trạng thái vé đã bán hết (QUAN TRỌNG)
    onClick,
    label = 'MUA VÉ NGAY',
    pastLabel = 'ĐÃ DIỄN RA',
    upcomingLabel = 'SẮP MỞ BÁN',
    soldOutLabel = 'HẾT VÉ',
    variant = 'primary',
    className,
    ...props
}) => {
    /**
     * Hàm xác định nhãn hiển thị dựa trên độ ưu tiên:
     * 1. Nếu đã qua ngày diễn ra -> Hiện "ĐÃ DIỄN RA"
     * 2. Nếu chưa qua ngày nhưng đã hết vé -> Hiện "HẾT VÉ"
     * 3. Nếu chưa mở bán -> Hiện "SẮP MỞ BÁN"
     * 4. Mặc định -> Hiện "MUA VÉ NGAY"
     */
    const getButtonLabel = () => {
        if (isPast) return pastLabel;
        if (isSoldOut) return soldOutLabel;
        if (isUpcoming) return upcomingLabel;
        return label;
    };

    /**
     * Nút sẽ bị vô hiệu hóa (không bấm được) nếu rơi vào 1 trong 3 trạng thái trên
     */
    const isDisabled = isPast || isUpcoming || isSoldOut;

    return (
        <Button
            shape='round'
            disabled={isDisabled}
            onClick={onClick}
            // Thêm class 'isSoldOutBtn' để bạn có thể tùy chỉnh CSS (ví dụ: đổi sang màu xám/đen)
            className={cx('bookingBtn', variant, className, {
                isPastBtn: isPast,
                isUpcomingBtn: isUpcoming,
                isSoldOutBtn: isSoldOut
            })}
            {...props}
        >
            {getButtonLabel()}
        </Button>
    );
};

export default BookingButton;
