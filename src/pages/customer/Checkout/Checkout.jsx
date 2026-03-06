// src/pages/customer/Checkout/Checkout.jsx
import React, { useState, useEffect, useContext } from 'react';
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

import styles from './Checkout.module.scss';
import { AuthContext } from '@contexts/AuthContext';
import orderApi from '@apis/orderApi';
import ticketIcon from '@icons/svgs/ticketIcon.svg';

dayjs.locale('vi');

const cx = classNames.bind(styles);
const { Title, Text } = Typography;

const TICKET_LABELS = {
    VIP: 'VÉ VIP',
    STANDARD: 'VÉ TIÊU CHUẨN'
};

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

    const totalQuantity = selectedTickets.reduce(
        (sum, item) => sum + item.quantity,
        0
    );

    const startDateTime = event
        ? dayjs(`${event.startDate} ${event.startTime || '00:00:00'}`)
        : null;
    const endDateTime =
        event && event.endTime
            ? dayjs(`${event.startDate} ${event.endTime}`)
            : null;

    useEffect(() => {
        if (!event?.id) return;
        const storageKey = `checkout_expiration_${event.id}`;
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
    }, [event?.id]);

    const handleBack = () => {
        if (event?.id) {
            localStorage.removeItem(`checkout_expiration_${event.id}`);
        }
        navigate(-1);
    };

    /**
     * Logic xử lý thanh toán thành công:
     * 1. Gọi createOrder (PENDING)
     * 2. Gọi payOrder (PAID)
     * 3. Điều hướng về Profile và mở sẵn tab vé
     */
    const handleConfirmOrder = async () => {
        if (!agreed) {
            message.warning(
                'Vui lòng đồng ý với điều khoản trước khi thanh toán'
            );
            return;
        }

        try {
            setIsSubmitting(true);

            const orderData = {
                eventId: event.id,
                totalPrice: totalPrice,
                items: selectedTickets.map(item => ({
                    ticketId: item.ticketId,
                    quantity: item.quantity,
                    price: item.price
                }))
            };

            // Bước 1: Tạo đơn hàng
            const createRes = await orderApi.createOrder(orderData);

            if (createRes && createRes.id) {
                // Bước 2: Thanh toán đơn hàng (giả lập thanh toán thành công theo BE)
                const paymentData = {
                    orderId: createRes.id
                };

                const payRes = await orderApi.payOrder(paymentData);

                if (payRes && payRes.orderStatus === 'PAID') {
                    // Thông báo thành công gọn gàng theo yêu cầu
                    message.success(
                        'Thanh toán thành công! Vé đã được lưu vào tài khoản của bạn.'
                    );

                    // Xóa bộ đếm ngược
                    localStorage.removeItem(`checkout_expiration_${event.id}`);

                    // Chuyển hướng sang trang Profile và chỉ định mở tab 'tickets'
                    setTimeout(() => {
                        navigate('/my-tickets', {
                            state: { activeTab: 'tickets' }
                        });
                    }, 1500);
                }
            }
        } catch (error) {
            console.error('Lỗi quy trình thanh toán:', error);
            const errorMsg =
                error.response?.data?.message ||
                'Có lỗi xảy ra trong quá trình xử lý đơn hàng';
            message.error(errorMsg);
        } finally {
            setIsSubmitting(false);
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
