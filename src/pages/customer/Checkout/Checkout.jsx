import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import {
    Row,
    Col,
    Typography,
    Button,
    Checkbox,
    Space,
    Divider,
    App,
    Modal // Sử dụng component Modal để điều khiển bằng hook
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
import transactionApi from '@apis/transactionApi'; // Thêm import transactionApi
import ticketIcon from '@icons/svgs/ticketIcon.svg';
import useModal from '@hooks/useModal'; // Import hook tự tạo của bạn

dayjs.locale('vi');
const cx = classNames.bind(styles);
const { Title, Text } = Typography;

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

    // Sử dụng hook useModal tự tạo của bạn
    const {
        isOpen: isCancelModalOpen,
        open: openCancelModal,
        close: closeCancelModal
    } = useModal();

    const [timeLeft, setTimeLeft] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [agreed, setAgreed] = useState(false);

    const event = state?.event;
    const selectedItems = state?.selectedItems || [];
    const totalPrice = state?.totalPrice || 0;
    const orderId = state?.orderId;
    const isSeated = state?.isSeated || false;

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

    // Xử lý đếm ngược 10 phút
    useEffect(() => {
        if (!orderId) return;
        const storageKey = `checkout_expiration_order_${orderId}`;
        let expirationTime = localStorage.getItem(storageKey);

        if (!expirationTime) {
            expirationTime = Date.now() + 600 * 1000;
            localStorage.setItem(storageKey, expirationTime);
        }

        const calculateTimeLeft = () => {
            const now = Date.now();
            const difference = Math.floor((expirationTime - now) / 1000);
            if (difference <= 0) {
                localStorage.removeItem(storageKey);
                orderApi
                    .cancelOrder(orderId)
                    .catch(err => console.error('Lỗi hủy đơn', err));
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

    // Mở modal xác nhận thay vì điều hướng ngay lập tức
    const handleBack = () => {
        openCancelModal();
    };

    // Hàm thực hiện hủy đơn thực tế khi người dùng xác nhận trên Modal
    const handleConfirmCancel = async () => {
        if (orderId) {
            try {
                await orderApi.cancelOrder(orderId);
                localStorage.removeItem(`checkout_expiration_order_${orderId}`);
            } catch (error) {
                console.error('Lỗi khi hủy đơn hàng:', error);
            }
        }
        closeCancelModal();
        navigate(-1);
    };

    const sendConfirmationEmail = async () => {
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
                // --- BẮT ĐẦU SỬA LẠI LOGIC LƯU TRANSACTION TRÊN FE ---
                try {
                    // Lấy danh sách các vé vừa được tạo từ phản hồi của API payOrder
                    const tickets = payRes.userTickets || [];

                    if (tickets.length > 0) {
                        // Tính số tiền trên mỗi vé (vì 1 Order có thể có nhiều vé, chia đều số tiền)
                        const amountPerTicket = totalPrice / tickets.length;

                        // Tạo mảng các request tạo Transaction cho từng vé
                        const transactionPromises = tickets.map(ticket =>
                            transactionApi.createTransaction({
                                userTicketId: ticket.id, // <-- Đã lấy đúng field BE cần
                                amount: amountPerTicket,
                                paymentMethod: 'ONLINE',
                                status: 'SUCCESS'
                            })
                        );

                        // Gọi đồng thời tất cả API tạo transaction bằng Promise.all
                        await Promise.all(transactionPromises);
                    }
                } catch (txnError) {
                    // Bắt lỗi âm thầm, không ảnh hưởng đến trải nghiệm (khách vẫn mua thành công)
                    console.error('Lỗi khi lưu transaction vào DB:', txnError);
                }
                // --- KẾT THÚC ---

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
            message.error(
                error.response?.data?.message || 'Lỗi xử lý đơn hàng'
            );
            setIsSubmitting(false);
        }
    };

    const formatTime = seconds => {
        if (seconds === null) return '10:00';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    if (!state || !event || selectedItems.length === 0) {
        return <Navigate to='/' replace />;
    }

    return (
        <div className={cx('checkoutPage')}>
            {/* Modal cảnh báo hủy đơn sử dụng hook useModal */}
            <Modal
                title='Hủy đơn hàng?'
                open={isCancelModalOpen}
                onOk={handleConfirmCancel}
                onCancel={closeCancelModal}
                okText='Đồng ý'
                cancelText='Hủy bỏ'
                okButtonProps={{ danger: true }}
                centered
            >
                <div style={{ marginTop: '10px' }}>
                    <p>
                        Bạn có chắc chắn muốn tiếp tục? Bạn sẽ mất vị trí mình
                        đã lựa chọn.
                    </p>
                    <p style={{ color: '#ff4d4f', fontWeight: '500' }}>
                        Đơn hàng đang trong quá trình thanh toán hoặc đã thanh
                        toán thành công cũng có thể bị huỷ.
                    </p>
                </div>
            </Modal>

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
