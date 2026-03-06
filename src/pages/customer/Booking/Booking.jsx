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
import classNames from 'classnames/bind';

import styles from './Booking.module.scss';
import { eventApi } from '@apis/eventApi';
import { ticketApi } from '@apis/ticketApi';
import orderApi from '@apis/orderApi';
import { AuthContext } from '@contexts/AuthContext';

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
    const { user, isAuthenticated } = useContext(AuthContext);

    const [event, setEvent] = useState(null);
    const [tickets, setTickets] = useState([]);
    const [quantities, setQuantities] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Gọi API lấy thông tin sự kiện và danh sách vé
                const [resEvent, resTicket] = await Promise.all([
                    eventApi.getById(id),
                    ticketApi.getAll({ filter: `event.id=${id}` })
                ]);

                /**
                 * LƯU Ý QUAN TRỌNG:
                 * axiosClient.js của bạn đã có interceptor:
                 * return response.data?.data !== undefined ? response.data.data : response.data;
                 * * Do đó, resEvent và resTicket chính là nội dung bên trong trường 'data' của BE.
                 */

                // 1. Gán dữ liệu sự kiện
                // resEvent lúc này chính là đối tượng Event (hoặc ResEventDTO)
                setEvent(resEvent);

                // 2. Gán dữ liệu vé
                // resTicket lúc này chính là đối tượng ResultPaginationDTO, chứa mảng 'result'
                const ticketList = resTicket?.result || [];
                setTickets(ticketList);

                // 3. Khởi tạo số lượng chọn mặc định là 0
                const initQty = {};
                ticketList.forEach(t => (initQty[t.id] = 0));
                setQuantities(initQty);
            } catch (error) {
                console.error('>>> Check Fetch Error:', error);
                message.error(
                    'Không thể tải thông tin vé. Vui lòng thử lại sau.'
                );
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

    const handleCheckout = async () => {
        if (!isAuthenticated) {
            message.warning('Vui lòng đăng nhập để tiến hành mua vé');
            return;
        }

        const selectedTickets = tickets
            .filter(t => quantities[t.id] > 0)
            .map(t => ({
                ticketId: t.id,
                quantity: quantities[t.id],
                price: t.price
            }));

        const orderRequest = {
            userId: user?.id,
            items: selectedTickets,
            totalAmount: totalPrice
        };

        try {
            setSubmitting(true);
            const response = await orderApi.createOrder(orderRequest);
            // Kiểm tra response dựa trên cấu trúc interceptor (trả về trực tiếp data)
            if (response) {
                message.success('Tạo đơn hàng thành công!');
                navigate('/my-tickets');
            }
        } catch (error) {
            const errorMsg = error?.message || 'Có lỗi xảy ra khi đặt vé';
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
                <Spin size='large' tip='Đang tải thông tin vé...' />
            </div>
        );

    if (!event)
        return (
            <div className={cx('error')} style={{ padding: '50px' }}>
                <Empty description='Không tìm thấy thông tin sự kiện' />
            </div>
        );

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
                        {tickets && tickets.length > 0 ? (
                            tickets.map((ticket, index) => (
                                <div key={ticket.id}>
                                    <div className={cx('ticketCard')}>
                                        <div className={cx('ticketInfo')}>
                                            <Text
                                                strong
                                                className={cx('ticketName')}
                                            >
                                                {TICKET_LABELS[
                                                    ticket.ticketType
                                                ] || ticket.ticketType}
                                            </Text>
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
                                                    quantities[ticket.id] === 0
                                                }
                                                onClick={() =>
                                                    handleQtyChange(
                                                        ticket.id,
                                                        quantities[ticket.id] -
                                                            1
                                                    )
                                                }
                                            >
                                                -
                                            </Button>
                                            <span className={cx('qtyCounter')}>
                                                {quantities[ticket.id] || 0}
                                            </span>
                                            <Button
                                                disabled={
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
                            <div
                                style={{ textAlign: 'center', padding: '20px' }}
                            >
                                <Empty description='Sự kiện này hiện chưa có vé để bán hoặc đã hết vé.' />
                            </div>
                        )}
                    </div>
                </Col>

                <Col xs={24} lg={8}>
                    <div className={cx('summaryCard')}>
                        <Title level={4}>{event.name}</Title>
                        <Space direction='vertical' className={cx('meta')}>
                            <div>
                                <CalendarOutlined />{' '}
                                {event.startTime
                                    ? dayjs(event.startTime).format(
                                          'HH:mm - DD/MM/YYYY'
                                      )
                                    : 'Chưa cập nhật'}
                            </div>
                            <div>
                                <EnvironmentOutlined />{' '}
                                {event.location || 'Chưa có địa điểm'}
                            </div>
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
