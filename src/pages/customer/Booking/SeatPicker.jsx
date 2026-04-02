import React, { useState, useEffect, useMemo } from 'react';
import { Typography, Divider, Tag, Spin, App } from 'antd';
import seatApi from '@apis/seatApi';
import styles from './SeatPicker.module.scss';
import classNames from 'classnames/bind';

const cx = classNames.bind(styles);
const { Text } = Typography;

const SeatPicker = ({ eventId, onSelectionChange }) => {
    const { message } = App.useApp();
    const [seats, setSeats] = useState([]);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSeats = async () => {
            try {
                setLoading(true);
                const res = await seatApi.getSeatsByEventId(eventId);
                const data = res.data || res;
                setSeats(Array.isArray(data) ? data : []);
            } catch (error) {
                message.error('Không thể tải sơ đồ ghế!');
            } finally {
                setLoading(false);
            }
        };
        if (eventId) fetchSeats();
    }, [eventId, message]);

    const groupedSeats = useMemo(() => {
        return seats.reduce((groups, seat) => {
            const zoneName = seat.zone || 'Khu vực chung';
            if (!groups[zoneName]) groups[zoneName] = [];
            groups[zoneName].push(seat);
            return groups;
        }, {});
    }, [seats]);

    const handleSeatClick = seat => {
        if (seat.status !== 'AVAILABLE') return;

        const isSelected = selectedSeats.some(s => s.id === seat.id);
        let newSelection;

        if (isSelected) {
            newSelection = selectedSeats.filter(s => s.id !== seat.id);
        } else {
            if (selectedSeats.length >= 6) {
                message.warning('Tối đa 6 ghế mỗi đơn hàng');
                return;
            }
            newSelection = [...selectedSeats, seat];
        }

        setSelectedSeats(newSelection);
        onSelectionChange?.(newSelection);
    };

    if (loading) {
        return (
            <div className={cx('loadingBox')}>
                <Spin tip='Đang tải sơ đồ ghế...' size='large' />
            </div>
        );
    }

    return (
        <div className={cx('seatPicker')}>
            <div className={cx('stageWrapper')}>
                <div className={cx('stage')}>SÂN KHẤU </div>
            </div>

            {/* Chú thích màu sắc */}
            <div className={cx('legend')}>
                <div className={cx('legendItem')}>
                    <div className={cx('seat', 'mini')} />
                    <Text>Ghế trống</Text>
                </div>
                <div className={cx('legendItem')}>
                    <div className={cx('seat', 'mini', 'selected')} />
                    <Text>Đang chọn</Text>
                </div>
                <div className={cx('legendItem')}>
                    <div className={cx('seat', 'mini', 'sold')} />
                    <Text>Đã bán</Text>
                </div>
            </div>

            {/* Danh sách ghế theo Zone */}
            {Object.keys(groupedSeats).map(zone => (
                <div key={zone} className={cx('zoneContainer')}>
                    <Divider orientation='left' className={cx('zoneHeader')}>
                        <Tag color='gold'>{zone}</Tag>
                    </Divider>
                    <div className={cx('seatGrid')}>
                        {groupedSeats[zone].map(seat => {
                            const isSelected = selectedSeats.some(
                                s => s.id === seat.id
                            );
                            const isAvailable = seat.status === 'AVAILABLE';

                            return (
                                <div
                                    key={seat.id}
                                    onClick={() => handleSeatClick(seat)}
                                    className={cx('seat', {
                                        selected: isSelected,
                                        sold: !isAvailable
                                    })}
                                    title={`${seat.seatLabel} - ${seat.price?.toLocaleString()}đ`}
                                >
                                    {seat.seatLabel}
                                </div>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default SeatPicker;
