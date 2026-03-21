import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    Row,
    Col,
    Typography,
    Button,
    Checkbox,
    Space,
    Divider,
    message
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
import emailjs from '@emailjs/browser'; // Import EmailJS

import styles from './Checkout.module.scss';
import { AuthContext } from '@contexts/AuthContext';
import orderApi from '@apis/orderApi';
import ticketIcon from '@icons/svgs/ticketIcon.svg';

dayjs.locale('vi');
const cx = classNames.bind(styles);
const { Title, Text } = Typography;

const TICKET_LABELS = { VIP: 'VÉ VIP', STANDARD: 'VÉ TIÊU CHUẨN' };

const Checkout = () => {
    const navigate = useNavigate();
    const { state } = useLocation();
    const { user } = useContext(AuthContext);

    const [timeLeft, setTimeLeft] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [agreed, setAgreed] = useState(false);

    const event = state?.event;
    const selectedTickets = state?.selectedTickets || [];
    const totalPrice = state?.totalPrice || 0;
    const orderId = state?.orderId;

    // [Tối ưu] Sử dụng useMemo cho các giá trị phái sinh
    const totalQuantity = useMemo(
        () => selectedTickets.reduce((sum, item) => sum + item.quantity, 0),
        [selectedTickets]
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

    // [Fix Bug Logic Timer] Dùng orderId làm key thay vì event.id
    useEffect(() => {
        if (!orderId) return;
        const storageKey = `checkout_expiration_order_${orderId}`;
        let expirationTime = localStorage.getItem(storageKey);

        if (!expirationTime) {
            expirationTime = Date.now() + 900 * 1000; // 15 phút
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

    // Hàm gửi email qua EmailJS
    const sendConfirmationEmail = async () => {
        const ticketTypesStr = selectedTickets
            .map(
                t =>
                    `${t.quantity}x ${TICKET_LABELS[t.ticketType] || t.ticketType}`
            )
            .join(', ');

        const templateParams = {
            customer_name: user?.name || 'Khách hàng',
            event_name: event.name,
            order_id: orderId,
            quantity: totalQuantity,
            ticket_type: ticketTypesStr,
            total_price: totalPrice.toLocaleString('vi-VN') + ' đ',
            time: `${startDateTime.format('HH:mm')} ngày ${startDateTime.format('DD/MM/YYYY')}`,
            location: event.location,
            to_email: user?.email,
            // Đưa link để user bấm vào trang của bạn xem chi tiết/QR
            ticket_link: `${window.location.origin}/my-tickets`
        };

        try {
            // Thay bằng ID thực tế của bạn từ tài khoản EmailJS
            await emailjs.send(
                'service_9oozl9c', // Thay YOUR_SERVICE_ID
                'template_agrx28n', // Thay YOUR_TEMPLATE_ID
                templateParams,
                'fvefLbNeEdGweDTg5' // Thay YOUR_PUBLIC_KEY
            );
            console.log('Email sent successfully!');
        } catch (error) {
            // Không throw error để không chặn luồng chạy của UI
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

            if (payRes && payRes.orderStatus === 'PAID') {
                message.success(
                    'Thanh toán thành công! Vé đã được lưu vào tài khoản của bạn.'
                );
                localStorage.removeItem(`checkout_expiration_order_${orderId}`);

                // 1. Gọi hàm gửi email trong background (Không dùng await để UI mượt mà)
                sendConfirmationEmail();

                // 2. Chuyển trang
                setTimeout(() => {
                    navigate('/my-tickets', {
                        state: { activeTab: 'tickets' }
                    });
                }, 1500);
            }
        } catch (error) {
            console.error('Lỗi quy trình thanh toán:', error);
            message.error(
                error.response?.data?.message ||
                    'Có lỗi xảy ra trong quá trình xử lý đơn hàng'
            );
            setIsSubmitting(false); // Chỉ tắt loading khi lỗi, thành công thì giữ nguyên để chờ navigate
        }
    };

    const formatTime = seconds => {
        if (seconds === null) return '15:00';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    if (!event || selectedTickets.length === 0) {
        return (
            <div style={{ padding: '100px', textAlign: 'center' }}>
                <Title level={4}>Không tìm thấy thông tin đơn hàng</Title>
                <Button type='primary' onClick={() => navigate('/')}>
                    Về trang chủ
                </Button>
            </div>
        );
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
                                    <Text block>
                                        Email người nhận:{' '}
                                        <strong>{user?.email}</strong>
                                    </Text>
                                    <Text type='secondary'>
                                        Vé điện tử và mã QR sẽ được gửi về địa
                                        chỉ email này sau khi thanh toán thành
                                        tông.
                                    </Text>
                                </div>
                            </div>

                            <div className={cx('checkoutCard')}>
                                <Title level={5}>
                                    <WalletOutlined /> Phương thức thanh toán
                                </Title>
                                <div className={cx('cardBody')}>
                                    <Text type='secondary' italic>
                                        Hệ thống hiện hỗ trợ xác nhận thanh toán
                                        trực tiếp. Khi nhấn nút
                                        <strong> "Thanh toán ngay"</strong>, đơn
                                        hàng sẽ được chuyển sang trạng thái{' '}
                                        <strong>PAID (Đã thanh toán)</strong> và
                                        hệ thống sẽ tự động xuất vé cho bạn.
                                    </Text>
                                </div>
                            </div>
                        </Space>
                    </Col>

                    <Col xs={24} lg={8}>
                        <div className={cx('orderSummary')}>
                            <Title level={4}>Thông tin đặt vé</Title>
                            <div className={cx('ticketInfo')}>
                                {selectedTickets.map(item => (
                                    <div
                                        key={item.ticketId}
                                        className={cx('summaryRow')}
                                    >
                                        <Space size={8} align='center'>
                                            <img
                                                src={ticketIcon}
                                                alt='ticket'
                                                style={{
                                                    width: '18px',
                                                    display: 'block'
                                                }}
                                            />
                                            <Text className={cx('ticketText')}>
                                                {item.quantity}x{' '}
                                                {TICKET_LABELS[
                                                    item.ticketType
                                                ] || item.ticketType}
                                            </Text>
                                        </Space>
                                        <Text strong>
                                            {(
                                                item.price * item.quantity
                                            ).toLocaleString('vi-VN')}{' '}
                                            đ
                                        </Text>
                                    </div>
                                ))}
                            </div>
                            <Divider className={cx('lightDivider')} />
                            <div className={cx('billing')}>
                                <div className={cx('summaryRow')}>
                                    <Text>Tạm tính</Text>
                                    <Text>
                                        {totalPrice.toLocaleString('vi-VN')} đ
                                    </Text>
                                </div>
                                <div className={cx('summaryRow', 'total')}>
                                    <Text strong>Tổng cộng</Text>
                                    <Text
                                        strong
                                        className={cx('highlightText')}
                                    >
                                        {totalPrice.toLocaleString('vi-VN')} đ
                                    </Text>
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
