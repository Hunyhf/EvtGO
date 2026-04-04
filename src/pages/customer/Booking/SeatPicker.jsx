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

    // ✅ SẮP XẾP + NHÓM GHẾ
    const groupedSeats = useMemo(() => {
        const sortedSeats = [...seats].sort((a, b) => {
            // Sắp xếp theo zone
            const zoneCompare = (a.zone || '').localeCompare(
                b.zone || '',
                undefined,
                {
                    numeric: true,
                    sensitivity: 'base'
                }
            );
            if (zoneCompare !== 0) return zoneCompare;

            // Sắp xếp theo seatLabel trong cùng zone
            return (a.seatLabel || '').localeCompare(
                b.seatLabel || '',
                undefined,
                {
                    numeric: true,
                    sensitivity: 'base'
                }
            );
        });

        return sortedSeats.reduce((groups, seat) => {
            const zoneName = seat.zone || 'Khu vực chung';
            if (!groups[zoneName]) groups[zoneName] = [];
            groups[zoneName].push(seat);
            return groups;
        }, {});
    }, [seats]);

    // ✅ SẮP XẾP TÊN ZONE
    const sortedZoneNames = useMemo(() => {
        return Object.keys(groupedSeats).sort((a, b) =>
            a.localeCompare(b, undefined, { numeric: true })
        );
    }, [groupedSeats]);

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
            {/* Sân khấu */}
            <div className={cx('stageWrapper')}>
                <div className={cx('stage')}>SÂN KHẤU</div>
            </div>

            {/* Chú thích */}
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

            {/* Render theo thứ tự zone đã sort */}
            {sortedZoneNames.map(zone => (
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
