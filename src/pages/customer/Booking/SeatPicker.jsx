import React, { useState, useEffect, useMemo } from 'react';
import { Typography, Divider, Tag, Spin, App, Modal } from 'antd'; // Thêm Modal
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

    // State mới để lưu ID các ghế được gợi ý/cảnh báo
    const [recommendedSeats, setRecommendedSeats] = useState([]);

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

    // ==========================================
    // LOGIC GỢI Ý VÀ CẢNH BÁO GHẾ (Chuyển từ BE sang)
    // ==========================================
    useEffect(() => {
        if (selectedSeats.length === 0) {
            setRecommendedSeats([]);
            return;
        }

        const targetZone = selectedSeats[0].zone || 'Khu vực chung';
        const selectedLabels = selectedSeats.map(s => s.seatLabel);

        // Lọc các ghế trống trong cùng Zone
        const availableSeats = seats.filter(
            s =>
                s.status === 'AVAILABLE' &&
                (s.zone || 'Khu vực chung') === targetZone
        );

        // Lấy danh sách các ghế ĐÃ CÓ NGƯỜI HOẶC ĐANG CHỌN
        const occupiedLabels = seats
            .filter(
                s =>
                    s.status !== 'AVAILABLE' &&
                    (s.zone || 'Khu vực chung') === targetZone
            )
            .map(s => s.seatLabel);
        const allOccupied = [...occupiedLabels, ...selectedLabels];

        let recommendations = [];
        let isWarning = false;
        let msgText = '';

        // Logic 1: Gợi ý ghế trống nằm chen giữa các ghế đã chọn (VD: Chọn A1, A3 -> Cảnh báo chừa A2)
        for (const label of selectedLabels) {
            const row = label.replace(/[0-9]/g, '');
            const colStr = label.replace(/[^0-9]/g, '');
            if (!row || !colStr) continue;
            const col = parseInt(colStr, 10);

            const left1 = row + (col - 1);
            const left2 = row + (col - 2);
            const right1 = row + (col + 1);
            const right2 = row + (col + 2);

            if (
                selectedLabels.includes(left2) &&
                !selectedLabels.includes(left1)
            ) {
                const seat = availableSeats.find(s => s.seatLabel === left1);
                if (seat && !recommendations.find(r => r.id === seat.id))
                    recommendations.push(seat);
            }
            if (
                selectedLabels.includes(right2) &&
                !selectedLabels.includes(right1)
            ) {
                const seat = availableSeats.find(s => s.seatLabel === right1);
                if (seat && !recommendations.find(r => r.id === seat.id))
                    recommendations.push(seat);
            }
        }

        if (recommendations.length > 0) {
            isWarning = true;
            msgText = `⚠️ Cảnh báo: Vui lòng không để trống 1 ghế lẻ (${recommendations.map(r => r.seatLabel).join(', ')}) ở giữa các ghế đã chọn!`;
        }

        // Logic 2: Cảnh báo "Chừa ghế trống vô duyên" (VD: A1, A2 có người, chọn A4 -> Cảnh báo chừa A3)
        if (!isWarning) {
            for (const label of selectedLabels) {
                const row = label.replace(/[0-9]/g, '');
                const colStr = label.replace(/[^0-9]/g, '');
                if (!row || !colStr) continue;
                const col = parseInt(colStr, 10);

                const left1 = row + (col - 1);
                const left2 = row + (col - 2);
                if (
                    !allOccupied.includes(left1) &&
                    allOccupied.includes(left2)
                ) {
                    const seat = availableSeats.find(
                        s => s.seatLabel === left1
                    );
                    if (seat && !recommendations.find(r => r.id === seat.id))
                        recommendations.push(seat);
                }

                const right1 = row + (col + 1);
                const right2 = row + (col + 2);
                if (
                    !allOccupied.includes(right1) &&
                    allOccupied.includes(right2)
                ) {
                    const seat = availableSeats.find(
                        s => s.seatLabel === right1
                    );
                    if (seat && !recommendations.find(r => r.id === seat.id))
                        recommendations.push(seat);
                }
            }

            if (recommendations.length > 0) {
                isWarning = true;
                msgText = `⚠️ Cảnh báo: Vui lòng không để trống 1 ghế lẻ (${recommendations.map(r => r.seatLabel).join(', ')}) cạnh các ghế đã có người ngồi!`;
            }
        }

        // Logic 3: Gợi ý ghế kế bên bình thường
        if (!isWarning) {
            for (const label of selectedLabels) {
                const row = label.replace(/[0-9]/g, '');
                const colStr = label.replace(/[^0-9]/g, '');
                if (!row || !colStr) continue;
                const col = parseInt(colStr, 10);

                const left1 = row + (col - 1);
                const right1 = row + (col + 1);

                const leftSeat = availableSeats.find(
                    s => s.seatLabel === left1
                );
                if (
                    leftSeat &&
                    !recommendations.find(r => r.id === leftSeat.id) &&
                    !selectedLabels.includes(left1)
                ) {
                    recommendations.push(leftSeat);
                }
                const rightSeat = availableSeats.find(
                    s => s.seatLabel === right1
                );
                if (
                    rightSeat &&
                    !recommendations.find(r => r.id === rightSeat.id) &&
                    !selectedLabels.includes(right1)
                ) {
                    recommendations.push(rightSeat);
                }
            }

            if (recommendations.length > 0) {
                recommendations = recommendations.slice(0, 3); // Lấy tối đa 3 ghế gợi ý
            }
        }

        // Cập nhật state và hiển thị thông báo
        setRecommendedSeats(recommendations.map(r => r.id));

        if (isWarning) {
            Modal.warning({
                title: 'Lưu ý chọn ghế',
                content: msgText
            });
        }
    }, [selectedSeats, seats]);
    // ==========================================

    const groupedSeats = useMemo(() => {
        // ... (Giữ nguyên logic groupedSeats cũ của bạn)
        const sortedSeats = [...seats].sort((a, b) => {
            const zoneCompare = (a.zone || '').localeCompare(
                b.zone || '',
                undefined,
                { numeric: true, sensitivity: 'base' }
            );
            if (zoneCompare !== 0) return zoneCompare;
            return (a.seatLabel || '').localeCompare(
                b.seatLabel || '',
                undefined,
                { numeric: true, sensitivity: 'base' }
            );
        });

        return sortedSeats.reduce((groups, seat) => {
            const zoneName = seat.zone || 'Khu vực chung';
            if (!groups[zoneName]) groups[zoneName] = [];
            groups[zoneName].push(seat);
            return groups;
        }, {});
    }, [seats]);

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
            <div className={cx('stageWrapper')}>
                <div className={cx('stage')}>SÂN KHẤU</div>
            </div>

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
                {/* Thêm chú thích cho ghế gợi ý */}
                <div className={cx('legendItem')}>
                    <div className={cx('seat', 'mini', 'recommended')} />
                    <Text>Ghế gợi ý/cảnh báo</Text>
                </div>
            </div>

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
                            // KIỂM TRA XEM GHẾ CÓ NẰM TRONG DANH SÁCH GỢI Ý KHÔNG
                            const isRecommended = recommendedSeats.includes(
                                seat.id
                            );

                            return (
                                <div
                                    key={seat.id}
                                    onClick={() => handleSeatClick(seat)}
                                    // Thêm class recommended
                                    className={cx('seat', {
                                        selected: isSelected,
                                        sold: !isAvailable,
                                        recommended:
                                            isRecommended && !isSelected
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
