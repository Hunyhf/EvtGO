import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Row,
    Col,
    Typography,
    Space,
    Button,
    Divider,
    Spin,
    Empty,
    App
} from 'antd';
import {
    CalendarOutlined,
    EnvironmentOutlined,
    ArrowLeftOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import classNames from 'classnames/bind';

import styles from './Booking.module.scss';
import { eventApi } from '@apis/eventApi';
import { ticketApi } from '@apis/ticketApi';
import orderApi from '@apis/orderApi';
import seatApi from '@apis/seatApi';
import { AuthContext } from '@contexts/AuthContext';
import ticketIcon from '@icons/svgs/ticketIcon.svg';

import SeatPicker from './SeatPicker';

dayjs.locale('vi');
const cx = classNames.bind(styles);
const { Title, Text } = Typography;

const TICKET_LABELS = {
    VIP: 'VÉ VIP',
    STANDARD: 'VÉ TIÊU CHUẨN',
    NORMAL: 'VÉ THƯỜNG'
};

const Booking = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { message } = App.useApp();
    const { isAuthenticated } = useContext(AuthContext);

    const [event, setEvent] = useState(null);
    const [tickets, setTickets] = useState([]);
    const [quantities, setQuantities] = useState({});
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [isSeatedEvent, setIsSeatedEvent] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [resEvent, resTicket, resSeats] = await Promise.all([
                    eventApi.getById(id),
                    ticketApi.getAll({ filter: `event.id:${id}` }),
                    seatApi.getSeatsByEventId(id).catch(() => [])
                ]);

                const eventData = resEvent?.result || resEvent;
                setEvent(eventData);

                const ticketList =
                    resTicket?.result?.content ||
                    resTicket?.result ||
                    resTicket?.data ||
                    [];
                setTickets(Array.isArray(ticketList) ? ticketList : []);

                const initQty = {};
                (Array.isArray(ticketList) ? ticketList : []).forEach(
                    t => (initQty[t.id] = 0)
                );
                setQuantities(initQty);

                const seatData = resSeats?.data || resSeats || [];
                if (Array.isArray(seatData) && seatData.length > 0) {
                    setIsSeatedEvent(true);
                } else {
                    setIsSeatedEvent(false);
                }
            } catch (error) {
                console.error('>>> Fetch Error:', error);
                message.error('Không thể tải thông tin sự kiện.');
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchData();
    }, [id, message]);

    const totalTicketsCount = useMemo(() => {
        if (isSeatedEvent) return selectedSeats.length;
        return Object.values(quantities).reduce((a, b) => a + b, 0);
    }, [isSeatedEvent, selectedSeats, quantities]);

    const totalPrice = useMemo(() => {
        if (isSeatedEvent) {
            return selectedSeats.reduce((sum, s) => sum + (s.price || 0), 0);
        }
        return tickets.reduce(
            (sum, t) => sum + (quantities[t.id] || 0) * t.price,
            0
        );
    }, [isSeatedEvent, selectedSeats, quantities, tickets]);

    const handleQtyChange = (ticketId, value) => {
        setQuantities(prev => ({ ...prev, [ticketId]: value }));
    };

    const handleSeatSelection = seats => {
        setSelectedSeats(seats);
    };

    const handleCheckout = async () => {
        if (!isAuthenticated) {
            message.warning('Vui lòng đăng nhập để mua vé');
            return;
        }

        try {
            setSubmitting(true);

            let orderItems = [];
            if (isSeatedEvent) {
                // LUỒNG XỬ LÝ GHẾ: Cần tìm TicketId tương ứng cho mỗi ghế
                for (const s of selectedSeats) {
                    const zoneType = s.zone?.trim().toUpperCase() || '';

                    // --- LOGIC TÌM VÉ CẢI TIẾN ---
                    // 1. Ưu tiên khớp theo GIÁ TIỀN (Chính xác nhất)
                    // 2. Dự phòng: Khớp theo Tên khu vực/Loại vé
                    const matchedTicket =
                        tickets.find(t => t.price === s.price) ||
                        tickets.find(t => {
                            const typeName =
                                t.ticketType?.trim().toUpperCase() || '';
                            return (
                                zoneType.includes(typeName) ||
                                typeName.includes(zoneType)
                            );
                        });

                    if (!matchedTicket) {
                        console.error('Dữ liệu không khớp:', {
                            seatPrice: s.price,
                            seatZone: s.zone,
                            availableTickets: tickets
                        });
                        message.error(
                            `Lỗi dữ liệu: Không tìm thấy loại vé có giá ${s.price?.toLocaleString()}đ tương ứng với khu vực ${s.zone}.`
                        );
                        setSubmitting(false);
                        return;
                    }

                    orderItems.push({
                        seatId: s.id,
                        ticketId: matchedTicket.id,
                        quantity: 1
                    });
                }
            } else {
                // LUỒNG XỬ LÝ VÉ THƯỜNG
                orderItems = tickets
                    .filter(t => quantities[t.id] > 0)
                    .map(t => ({
                        ticketId: t.id,
                        quantity: quantities[t.id],
                        ticketType: t.ticketType, // Bổ sung thêm dòng này để lấy tên loại vé
                        price: t.price // Bổ sung thêm dòng này để tính toán giá tiền bên Checkout
                    }));
            }

            const orderData = {
                items: orderItems,
                isSeated: isSeatedEvent
            };

            const res = await orderApi.createOrder(orderData);

            if (res) {
                const resData = res.result || res;
                navigate(`/booking/${id}/checkout`, {
                    state: {
                        event,
                        selectedItems: isSeatedEvent
                            ? selectedSeats
                            : orderItems,
                        totalPrice,
                        orderId: resData.id,
                        isSeated: isSeatedEvent
                    }
                });
            }
        } catch (error) {
            console.error('Lỗi tạo đơn hàng:', error);
            const errorMsg =
                error.response?.data?.message || 'Không thể khởi tạo đơn hàng.';
            message.error(errorMsg);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading)
        return (
            <div
                className={cx('loader')}
                style={{ padding: '100px 0', textAlign: 'center' }}
            >
                <Spin size='large' tip='Đang tải dữ liệu...' />
            </div>
        );

    if (!event)
        return (
            <div className={cx('error')} style={{ padding: '50px' }}>
                <Empty description='Không tìm thấy sự kiện' />
            </div>
        );

    const startTime = dayjs(
        `${event.startDate} ${event.startTime || '00:00:00'}`
    );
    const endTime = event.endTime
        ? dayjs(`${event.startDate} ${event.endTime}`)
        : null;

    return (
        <div className={cx('bookingContainer')}>
            <div className={cx('header')}>
                <Button
                    type='link'
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate(-1)}
                >
                    Trở về
                </Button>
                <Title level={3}>
                    {isSeatedEvent ? 'Chọn vị trí ghế' : 'Chọn loại vé'}
                </Title>
            </div>

            <Row gutter={[32, 32]}>
                <Col xs={24} lg={16}>
                    {isSeatedEvent ? (
                        <SeatPicker
                            eventId={id}
                            onSelectionChange={handleSeatSelection}
                        />
                    ) : (
                        <div className={cx('ticketList')}>
                            {tickets.length > 0 ? (
                                tickets.map((ticket, index) => (
                                    <div key={ticket.id}>
                                        <div className={cx('ticketCard')}>
                                            <div className={cx('ticketInfo')}>
                                                <Title
                                                    level={5}
                                                    className={cx('ticketName')}
                                                >
                                                    {TICKET_LABELS[
                                                        ticket.ticketType
                                                    ] || ticket.ticketType}
                                                </Title>
                                                <Text
                                                    className={cx(
                                                        'ticketPrice'
                                                    )}
                                                >
                                                    {ticket.price?.toLocaleString(
                                                        'vi-VN'
                                                    )}{' '}
                                                    đ
                                                </Text>
                                                <div
                                                    style={{
                                                        fontSize: '12px',
                                                        color: '#8c8c8c'
                                                    }}
                                                >
                                                    Còn lại:{' '}
                                                    {ticket.totalQuantity -
                                                        ticket.soldQuantity}{' '}
                                                    vé
                                                </div>
                                            </div>

                                            <div className={cx('qtySelector')}>
                                                <Button
                                                    disabled={
                                                        quantities[
                                                            ticket.id
                                                        ] === 0 || submitting
                                                    }
                                                    onClick={() =>
                                                        handleQtyChange(
                                                            ticket.id,
                                                            quantities[
                                                                ticket.id
                                                            ] - 1
                                                        )
                                                    }
                                                >
                                                    -
                                                </Button>
                                                <span
                                                    className={cx('qtyCounter')}
                                                >
                                                    {quantities[ticket.id] || 0}
                                                </span>
                                                <Button
                                                    disabled={
                                                        submitting ||
                                                        quantities[ticket.id] >=
                                                            ticket.totalQuantity -
                                                                ticket.soldQuantity
                                                    }
                                                    onClick={() =>
                                                        handleQtyChange(
                                                            ticket.id,
                                                            (quantities[
                                                                ticket.id
                                                            ] || 0) + 1
                                                        )
                                                    }
                                                >
                                                    +
                                                </Button>
                                            </div>
                                        </div>
                                        {index < tickets.length - 1 && (
                                            <Divider dashed />
                                        )}
                                    </div>
                                ))
                            ) : (
                                <Empty description='Hết vé' />
                            )}
                        </div>
                    )}
                </Col>

                <Col xs={24} lg={8}>
                    <div className={cx('summaryCard')}>
                        <Title level={4}>{event.name}</Title>
                        <Space direction='vertical' className={cx('meta')}>
                            <div>
                                <CalendarOutlined /> {startTime.format('HH:mm')}
                                {endTime ? ` - ${endTime.format('HH:mm')}` : ''}
                                {` | ${startTime.format('DD/MM/YYYY')}`}
                            </div>
                            <div>
                                <EnvironmentOutlined />{' '}
                                {event.location || 'Chưa có địa điểm'}
                            </div>

                            {totalTicketsCount > 0 && (
                                <div className={cx('selectedQuantity')}>
                                    <img
                                        src={ticketIcon}
                                        alt='ticket'
                                        className={cx('ticketIcon')}
                                    />
                                    <Text
                                        strong
                                        className={cx('ticketCountText')}
                                    >
                                        x {totalTicketsCount} vé đã chọn
                                    </Text>
                                </div>
                            )}
                        </Space>

                        <Divider />

                        {isSeatedEvent && selectedSeats.length > 0 && (
                            <div className={cx('seatDetails')}>
                                <Text strong>Vị trí:</Text>
                                <div
                                    style={{
                                        marginTop: '8px',
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: '4px'
                                    }}
                                >
                                    {selectedSeats.map(s => (
                                        <Text code key={s.id}>
                                            {s.zone}-{s.seatLabel}
                                        </Text>
                                    ))}
                                </div>
                                <Divider />
                            </div>
                        )}

                        <div className={cx('totalRow')}>
                            <Text strong>Tổng thanh toán</Text>
                            <Title level={4} type='success'>
                                {totalPrice.toLocaleString('vi-VN')} đ
                            </Title>
                        </div>
                        <Button
                            type='primary'
                            block
                            size='large'
                            disabled={totalTicketsCount === 0}
                            loading={submitting}
                            onClick={handleCheckout}
                            style={{
                                background: '#2dc275',
                                borderColor: '#2dc275',
                                height: '50px'
                            }}
                        >
                            {totalTicketsCount > 0
                                ? 'Tiếp tục'
                                : 'Vui lòng chọn vé/ghế'}
                        </Button>
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default Booking;
