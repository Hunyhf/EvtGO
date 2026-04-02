import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom'; // Thêm Navigate để phòng vệ
import {
    Row,
    Col,
    Typography,
    Button,
    Checkbox,
    Space,
    Divider,
    message,
    App
} from 'antd';
import {
    ArrowLeftOutlined,
    ClockCircleOutlined,
    MailOutlined,
    WalletOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import classNames from 'classnames/bind';
import emailjs from '@emailjs/browser';

import styles from './Checkout.module.scss';
import { AuthContext } from '@contexts/AuthContext';
import orderApi from '@apis/orderApi';
import ticketIcon from '@icons/svgs/ticketIcon.svg';

dayjs.locale('vi');
const cx = classNames.bind(styles);
const { Title, Text } = Typography;

// Mở rộng nhãn vé
const TICKET_LABELS = {
    VIP: 'VÉ VIP',
    STANDARD: 'VÉ TIÊU CHUẨN',
    NORMAL: 'VÉ THƯỜNG'
};

const Checkout = () => {
    const navigate = useNavigate();
    const { state } = useLocation();
    const { user } = useContext(AuthContext);
    const { message } = App.useApp();

    const [timeLeft, setTimeLeft] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [agreed, setAgreed] = useState(false);

    // FIX 1: Lấy đúng tên biến từ Booking.jsx gửi sang
    const event = state?.event;
    const selectedItems = state?.selectedItems || [];
    const totalPrice = state?.totalPrice || 0;
    const orderId = state?.orderId;
    const isSeated = state?.isSeated || false;

    // Tính tổng số lượng (Nếu là ghế thì 1 item = 1 vé)
    const totalQuantity = useMemo(
        () =>
            isSeated
                ? selectedItems.length
                : selectedItems.reduce(
                      (sum, item) => sum + (item.quantity || 0),
                      0
                  ),
        [selectedItems, isSeated]
    );

    const startDateTime = useMemo(
        () =>
            event
                ? dayjs(`${event.startDate} ${event.startTime || '00:00:00'}`)
                : null,
        [event]
    );

    const endDateTime = useMemo(
        () =>
            event?.endTime
                ? dayjs(`${event.startDate} ${event.endTime}`)
                : null,
        [event]
    );

    useEffect(() => {
        if (!orderId) return;
        const storageKey = `checkout_expiration_order_${orderId}`;
        let expirationTime = localStorage.getItem(storageKey);

        if (!expirationTime) {
            expirationTime = Date.now() + 900 * 1000;
            localStorage.setItem(storageKey, expirationTime);
        }

        const calculateTimeLeft = () => {
            const now = Date.now();
            const difference = Math.floor((expirationTime - now) / 1000);
            if (difference <= 0) {
                localStorage.removeItem(storageKey);
                return 0;
            }
            return difference;
        };

        setTimeLeft(calculateTimeLeft());
        const timer = setInterval(() => {
            const remaining = calculateTimeLeft();
            setTimeLeft(remaining);
            if (remaining <= 0) clearInterval(timer);
        }, 1000);

        return () => clearInterval(timer);
    }, [orderId]);

    const handleBack = () => {
        if (orderId)
            localStorage.removeItem(`checkout_expiration_order_${orderId}`);
        navigate(-1);
    };

    const sendConfirmationEmail = async () => {
        // FIX 2: Logic hiển thị nội dung email cho cả 2 loại vé
        const ticketDetailStr = selectedItems
            .map(t =>
                isSeated
                    ? `Ghế ${t.zone}-${t.seatLabel}`
                    : `${t.quantity}x ${TICKET_LABELS[t.ticketType] || t.ticketType}`
            )
            .join(', ');

        const templateParams = {
            customer_name: user?.name || 'Khách hàng',
            event_name: event.name,
            order_id: orderId,
            quantity: totalQuantity,
            ticket_type: ticketDetailStr,
            total_price: totalPrice.toLocaleString('vi-VN') + ' đ',
            time: `${startDateTime.format('HH:mm')} ngày ${startDateTime.format('DD/MM/YYYY')}`,
            location: event.location,
            to_email: user?.email,
            ticket_link: `${window.location.origin}/my-tickets`
        };

        try {
            await emailjs.send(
                'service_9oozl9c',
                'template_agrx28n',
                templateParams,
                'fvefLbNeEdGweDTg5'
            );
            console.log('Email sent successfully!');
        } catch (error) {
            console.error('Failed to send confirmation email', error);
        }
    };

    const handleConfirmOrder = async () => {
        if (!agreed)
            return message.warning(
                'Vui lòng đồng ý với điều khoản trước khi thanh toán'
            );
        if (!orderId)
            return message.error(
                'Không tìm thấy mã đơn hàng. Vui lòng đặt vé lại!'
            );

        try {
            setIsSubmitting(true);
            const payRes = await orderApi.payOrder({ orderId });

            if (payRes) {
                message.success('Thanh toán thành công!');
                localStorage.removeItem(`checkout_expiration_order_${orderId}`);
                sendConfirmationEmail();
                setTimeout(() => {
                    navigate('/my-tickets', {
                        state: { activeTab: 'tickets' }
                    });
                }, 1500);
            }
        } catch (error) {
            console.error('Lỗi thanh toán:', error);
            message.error(
                error.response?.data?.message || 'Lỗi xử lý đơn hàng'
            );
            setIsSubmitting(false);
        }
    };

    const formatTime = seconds => {
        if (seconds === null) return '15:00';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // PHÒNG VỆ: Nếu người dùng refresh trang (mất state) thì về trang chủ thay vì hiện trang trắng
    if (!state || !event || selectedItems.length === 0) {
        return <Navigate to='/' replace />;
    }

    return (
        <div className={cx('checkoutPage')}>
            <div className={cx('eventBanner')}>
                <div
                    className={cx('blurBg')}
                    style={{
                        backgroundImage: `url('https://picsum.photos/1200/400')`
                    }}
                ></div>
                <div className={cx('overlay')}>
                    <div className={cx('bannerContent')}>
                        <Button
                            icon={<ArrowLeftOutlined />}
                            className={cx('backBtn')}
                            onClick={handleBack}
                        >
                            Quay lại
                        </Button>
                        <div className={cx('info')}>
                            <Title level={2} className={cx('eventName')}>
                                {event.name}
                            </Title>
                            <div className={cx('eventMetaWrapper')}>
                                <Text className={cx('eventMeta')}>
                                    {startDateTime.format('HH:mm')}
                                    {endDateTime
                                        ? ` - ${endDateTime.format('HH:mm')}`
                                        : ''}
                                    {` | ${startDateTime.format('dddd, DD/MM/YYYY')}`}
                                    {` • ${event.location}`}
                                </Text>
                                <div className={cx('ticketSummaryInline')}>
                                    <img
                                        src={ticketIcon}
                                        alt='ticket'
                                        className={cx('ticketIcon')}
                                    />
                                    <Text strong className={cx('ticketCount')}>
                                        x {totalQuantity} vé
                                    </Text>
                                </div>
                            </div>
                        </div>
                        <div className={cx('countdownBox')}>
                            <ClockCircleOutlined />
                            <span>
                                Hoàn tất đặt vé trong {formatTime(timeLeft)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className={cx('mainContent')}>
                <Title level={3} className={cx('sectionTitle')}>
                    THANH TOÁN
                </Title>
                <Row gutter={[24, 24]}>
                    <Col xs={24} lg={16}>
                        <Space
                            direction='vertical'
                            size={24}
                            style={{ width: '100%' }}
                        >
                            <div className={cx('checkoutCard')}>
                                <Title level={5}>
                                    <MailOutlined /> Thông tin nhận vé
                                </Title>
                                <div className={cx('cardBody')}>
                                    <Text>
                                        Email người nhận:{' '}
                                        <strong>{user?.email}</strong>
                                    </Text>
                                    <Text
                                        type='secondary'
                                        style={{ display: 'block' }}
                                    >
                                        Vé điện tử sẽ được gửi về email này.
                                    </Text>
                                </div>
                            </div>
                            <div className={cx('checkoutCard')}>
                                <Title level={5}>
                                    <WalletOutlined /> Phương thức thanh toán
                                </Title>
                                <div className={cx('cardBody')}>
                                    <Text italic>
                                        Hệ thống hỗ trợ thanh toán trực tiếp để
                                        xác nhận vé ngay lập tức.
                                    </Text>
                                </div>
                            </div>
                        </Space>
                    </Col>

                    <Col xs={24} lg={8}>
                        <div className={cx('orderSummary')}>
                            <Title level={4}>Thông tin đặt vé</Title>
                            <div className={cx('ticketInfo')}>
                                {selectedItems.map((item, idx) => (
                                    <div key={idx} className={cx('summaryRow')}>
                                        <Space size={8} align='center'>
                                            <img
                                                src={ticketIcon}
                                                alt='ticket'
                                                style={{ width: '18px' }}
                                            />
                                            <Text className={cx('ticketText')}>
                                                {/* FIX 3: Hiển thị linh hoạt Ghế hoặc Loại vé */}
                                                {isSeated
                                                    ? `Ghế ${item.zone}-${item.seatLabel}`
                                                    : `${item.quantity}x ${TICKET_LABELS[item.ticketType] || item.ticketType}`}
                                            </Text>
                                        </Space>
                                        <Text strong>
                                            {(
                                                item.price *
                                                (item.quantity || 1)
                                            ).toLocaleString('vi-VN')}{' '}
                                            đ
                                        </Text>
                                    </div>
                                ))}
                            </div>
                            <Divider className={cx('lightDivider')} />
                            <div className={cx('billing')}>
                                <div className={cx('summaryRow', 'total')}>
                                    <Text strong>Tổng cộng</Text>
                                    <Title
                                        level={4}
                                        type='success'
                                        style={{ margin: 0 }}
                                    >
                                        {totalPrice.toLocaleString('vi-VN')} đ
                                    </Title>
                                </div>
                            </div>
                            <div className={cx('terms')}>
                                <Checkbox
                                    checked={agreed}
                                    onChange={e => setAgreed(e.target.checked)}
                                >
                                    Tôi đồng ý với các điều khoản của EvtGo
                                </Checkbox>
                            </div>
                            <Button
                                type='primary'
                                block
                                size='large'
                                className={cx('payBtn')}
                                loading={isSubmitting}
                                disabled={timeLeft === 0 || !agreed}
                                onClick={handleConfirmOrder}
                                style={{
                                    background: '#2dc275',
                                    borderColor: '#2dc275',
                                    height: '50px'
                                }}
                            >
                                {timeLeft === 0
                                    ? 'Giao dịch hết hạn'
                                    : 'Thanh toán ngay'}
                            </Button>
                        </div>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default Checkout;
