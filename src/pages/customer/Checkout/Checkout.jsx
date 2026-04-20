import React, { useState, useEffect, useContext, useMemo, useRef } from 'react';
import {
    useLocation,
    useNavigate,
    Navigate,
    useBlocker
} from 'react-router-dom';
import {
    Row,
    Col,
    Typography,
    Button,
    Checkbox,
    Space,
    Divider,
    App,
    Modal,
    Radio
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
import transactionApi from '@apis/transactionApi';
import paymentApi from '@apis/paymentApi';
import ticketIcon from '@icons/svgs/ticketIcon.svg';
import useModal from '@hooks/useModal';

import momoLogo from '@images/momo.png';
import vnpayLogo from '@images/vnpay.png';
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
    const { state: locationState } = useLocation();
    const { user } = useContext(AuthContext);
    const { message } = App.useApp();

    const {
        isOpen: isCancelModalOpen,
        open: openCancelModal,
        close: closeCancelModal
    } = useModal();

    const [timeLeft, setTimeLeft] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [agreed, setAgreed] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('momo');
    const event = locationState?.event;
    const selectedItems = locationState?.selectedItems || [];
    const totalPrice = locationState?.totalPrice || 0;
    const orderId = locationState?.orderId;
    const isSeated = locationState?.isSeated || false;

    // Refs để xử lý trong Event Listeners
    const isSuccessRef = useRef(isSuccess);
    const isTimeoutRef = useRef(false);

    useEffect(() => {
        isSuccessRef.current = isSuccess;
    }, [isSuccess]);

    useEffect(() => {
        // Tạo một điểm dừng giả trong lịch sử duyệt web
        window.history.pushState(null, null, window.location.pathname);

        const handlePopState = () => {
            if (!isSuccessRef.current && !isTimeoutRef.current) {
                // Đẩy ngược lại để giữ người dùng ở trang Checkout
                window.history.pushState(null, null, window.location.pathname);
                // Mở Modal cảnh báo
                openCancelModal();
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [openCancelModal]);

    const blocker = useBlocker(
        ({ currentLocation, nextLocation }) =>
            !isSuccessRef.current &&
            !isTimeoutRef.current &&
            currentLocation.pathname !== nextLocation.pathname
    );

    useEffect(() => {
        if (blocker.state === 'blocked') {
            openCancelModal();
        }
    }, [blocker.state, openCancelModal]);

    useEffect(() => {
        if (!orderId || isSuccess) return;
        const storageKey = `checkout_expiration_order_${orderId}`;
        let expirationTime = localStorage.getItem(storageKey);
        if (!expirationTime) {
            expirationTime = Date.now() + 600 * 1000;
            localStorage.setItem(storageKey, expirationTime);
        }
        const calculateTimeLeft = () => {
            const now = Date.now();
            const difference = Math.floor((expirationTime - now) / 1000);
            return difference > 0 ? difference : 0;
        };
        setTimeLeft(calculateTimeLeft());
        const timer = setInterval(() => {
            if (isSuccessRef.current) {
                clearInterval(timer);
                return;
            }
            const remaining = calculateTimeLeft();
            setTimeLeft(remaining);
            if (remaining <= 0) {
                clearInterval(timer);
                localStorage.removeItem(storageKey);
                orderApi
                    .cancelOrder(orderId)
                    .catch(err => console.error('Lỗi hủy đơn', err));
                message.error('Thời gian thanh toán đã hết!');
                isTimeoutRef.current = true;
                navigate('/', { replace: true });
            }
        }, 1000);
        return () => clearInterval(timer);
    }, [orderId, isSuccess, navigate, message]);

    const handleBack = () => {
        // Nút Quay lại trên giao diện gọi trực tiếp Modal
        openCancelModal();
    };

    const handleConfirmCancel = async () => {
        if (orderId) {
            try {
                await orderApi.cancelOrder(orderId);
                localStorage.removeItem(`checkout_expiration_order_${orderId}`);
            } catch (error) {
                console.error('Lỗi khi hủy đơn hàng:', error);
            }
        }

        // Tắt các chế độ chặn để thực hiện navigate
        isSuccessRef.current = true;
        closeCancelModal();

        if (blocker.state === 'blocked') {
            // Trường hợp 1: Người dùng bấm Logo hoặc Link ngoài (Blocker bắt được)
            // Đi đến trang đó (ví dụ trang chủ) và dùng replace để xóa Checkout khỏi lịch sử
            navigate(blocker.location.pathname, {
                replace: true,
                state: blocker.location.state
            });
            blocker.reset();
        } else {
            // Trường hợp 2: Người dùng bấm nút Back (trình duyệt/điện thoại) hoặc nút UI "Quay lại"
            // Điều hướng thẳng về trang Booking của sự kiện hiện tại
            // Dùng replace: true để đè trang Checkout, ngăn người dùng bấm Forward quay lại
            navigate(`/booking/${event?.id}`, {
                replace: true,
                state: { event } // Truyền lại event để trang booking có dữ liệu
            });
        }
    };

    const handleCloseModal = () => {
        if (blocker.state === 'blocked') {
            blocker.reset();
        }
        closeCancelModal();
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
            console.error('Failed to send email', error);
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
                setIsSuccess(true);
                try {
                    const tickets = payRes.userTickets || [];
                    if (tickets.length > 0) {
                        const amountPerTicket = totalPrice / tickets.length;
                        const transactionPromises = tickets.map(ticket =>
                            transactionApi.createTransaction({
                                userTicketId: ticket.id,
                                amount: amountPerTicket,
                                paymentMethod: 'ONLINE',
                                status: 'SUCCESS'
                            })
                        );
                        await Promise.allSettled(transactionPromises);
                    }
                } catch (txnError) {
                    console.error('Lỗi transaction:', txnError);
                }
                message.success('Thanh toán thành công!');
                sendConfirmationEmail();
                // Xóa bộ đếm ngược trong localStorage
                localStorage.removeItem(`checkout_expiration_order_${orderId}`);

                // Chuyển hướng sang trang thanh toán của MoMo
                setTimeout(() => {
                    navigate('/my-tickets', {
                        state: { activeTab: 'tickets' },
                        replace: true
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

    const formatTime = seconds => {
        if (seconds === null || seconds <= 0) return '00:00';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    if (!locationState || !event || selectedItems.length === 0) {
        return <Navigate to='/' replace />;
    }

    return (
        <div className={cx('checkoutPage')}>
            <Modal
                title='Hủy đơn hàng?'
                open={isCancelModalOpen}
                onOk={handleConfirmCancel}
                onCancel={handleCloseModal}
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
                                    <Radio.Group
                                        onChange={e =>
                                            setPaymentMethod(e.target.value)
                                        }
                                        value={paymentMethod}
                                        className={cx('paymentRadioGroup')}
                                    >
                                        <Space
                                            direction='vertical'
                                            style={{ width: '100%' }}
                                            size={16}
                                        >
                                            <div
                                                className={cx('paymentOption', {
                                                    active:
                                                        paymentMethod === 'momo'
                                                })}
                                            >
                                                <Radio value='momo'>
                                                    <div
                                                        className={cx(
                                                            'optionContent'
                                                        )}
                                                    >
                                                        <img
                                                            src={momoLogo}
                                                            alt='momo'
                                                        />
                                                        <span>
                                                            Ví điện tử MoMo
                                                        </span>
                                                    </div>
                                                </Radio>
                                            </div>
                                            <div
                                                className={cx('paymentOption', {
                                                    active:
                                                        paymentMethod ===
                                                        'vnpay'
                                                })}
                                            >
                                                <Radio value='vnpay'>
                                                    <div
                                                        className={cx(
                                                            'optionContent'
                                                        )}
                                                    >
                                                        <img
                                                            src={vnpayLogo}
                                                            alt='vnpay'
                                                        />
                                                        <span>
                                                            Cổng thanh toán
                                                            VNPAY
                                                        </span>
                                                    </div>
                                                </Radio>
                                            </div>
                                        </Space>
                                    </Radio.Group>
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
