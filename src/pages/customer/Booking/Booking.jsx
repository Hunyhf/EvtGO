// src/pages/customer/Booking/Booking.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Row,
    Col,
    Typography,
    Space,
    Button,
    Divider,
    message,
    Spin,
    Empty
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
import orderApi from '@apis/orderApi'; // Import orderApi
import { AuthContext } from '@contexts/AuthContext';
// Import icon vé từ assets
import ticketIcon from '@icons/svgs/ticketIcon.svg';

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
    const { isAuthenticated } = useContext(AuthContext);

    const [event, setEvent] = useState(null);
    const [tickets, setTickets] = useState([]);
    const [quantities, setQuantities] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [resEvent, resTicket] = await Promise.all([
                    eventApi.getById(id),
                    ticketApi.getAll({ filter: `event.id:${id}` })
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
            } catch (error) {
                console.error('>>> Fetch Error:', error);
                message.error('Không thể tải thông tin vé.');
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchData();
    }, [id]);

    const handleQtyChange = (ticketId, value) => {
        setQuantities(prev => ({ ...prev, [ticketId]: value }));
    };

    const totalTickets = Object.values(quantities).reduce((a, b) => a + b, 0);
    const totalPrice = tickets.reduce(
        (sum, t) => sum + (quantities[t.id] || 0) * t.price,
        0
    );

    // THAY ĐỔI LOGIC TẠI ĐÂY: Gọi API trước khi chuyển trang
    const handleCheckout = async () => {
        if (!isAuthenticated) {
            message.warning('Vui lòng đăng nhập để mua vé');
            return;
        }

        try {
            setSubmitting(true);

            const selectedTicketsData = tickets
                .filter(t => quantities[t.id] > 0)
                .map(t => ({
                    ticketId: t.id,
                    quantity: quantities[t.id],
                    price: t.price
                }));

            // Chuẩn bị dữ liệu gửi lên BE (Dùng 'items' để tránh lỗi 400 như trước)
            const orderData = {
                eventId: Number(id),
                totalPrice: totalPrice,
                items: selectedTicketsData
            };

            // Gọi API lưu đơn hàng vào DB (Status: PENDING)
            const res = await orderApi.createOrder(orderData);

            if (res) {
                // Nếu thành công, chuyển sang Checkout và truyền data kèm orderId
                navigate(`/booking/${id}/checkout`, {
                    state: {
                        event,
                        selectedTickets: selectedTicketsData,
                        totalPrice,
                        orderId: res.id || res.result?.id // Truyền ID đơn hàng để Checkout xử lý tiếp
                    }
                });
            }
        } catch (error) {
            console.error('Lỗi tạo đơn hàng:', error);
            const errorMsg =
                error.response?.data?.message ||
                'Không thể khởi tạo đơn hàng. Vui lòng thử lại.';
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
                <Spin size='large' tip='Đang tải...' />
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
                <Title level={3}>Chọn loại vé</Title>
            </div>

            <Row gutter={[32, 32]}>
                <Col xs={24} lg={16}>
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
                                            <Text className={cx('ticketPrice')}>
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
                                                    quantities[ticket.id] ===
                                                        0 || submitting
                                                }
                                                onClick={() =>
                                                    handleQtyChange(
                                                        ticket.id,
                                                        quantities[ticket.id] -
                                                            1
                                                    )
                                                }
                                            >
                                                {' '}
                                                -{' '}
                                            </Button>
                                            <span className={cx('qtyCounter')}>
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
                                                        quantities[ticket.id] +
                                                            1
                                                    )
                                                }
                                            >
                                                {' '}
                                                +{' '}
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

                            {totalTickets > 0 && (
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
                                        x {totalTickets} vé đã chọn
                                    </Text>
                                </div>
                            )}
                        </Space>
                        <Divider />
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
                            disabled={totalTickets === 0}
                            loading={submitting}
                            onClick={handleCheckout}
                        >
                            {totalTickets > 0
                                ? 'Thanh toán ngay'
                                : 'Vui lòng chọn vé'}
                        </Button>
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default Booking;
